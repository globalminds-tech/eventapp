import re
import secrets
from typing import Optional
from sqlalchemy import func
from fastapi import HTTPException, status
from app.modules.rbac.services.rbac_service import RBACService
from app.extensions.database import db_session
from app.models.organization import Organization, OrganizationMember
from app.models.user import User
from werkzeug.security import generate_password_hash
from app.utils.jwt_utils import generate_access_token, generate_refresh_token


class RBACController:

    @staticmethod
    def _resolve_org_id(current_user: dict, explicit_org_id: Optional[str] = None, workspace_scope: Optional[str] = None) -> str:
        if explicit_org_id:
            return explicit_org_id
        
        user_id = current_user.get("user_id") or current_user.get("id")
        session = db_session()
        try:
            import re
            import secrets
            user_obj = session.query(User).filter_by(id=user_id).first()
            raw_scope = str(workspace_scope or current_user.get("active_role") or (user_obj.active_role if user_obj else "") or current_user.get("role") or "").lower()
            target_org_type = "EXHIBITOR" if "exhibitor" in raw_scope else "ORGANIZER"

            # 1. Check if user is owner of an organization matching target_org_type
            org = session.query(Organization).filter_by(owner_id=user_id, org_type=target_org_type, deleted_at=None).first()
            if org:
                return str(org.id)
            
            # 2. Check if user is a member of an organization matching target_org_type
            membership = session.query(OrganizationMember).join(Organization).filter(
                OrganizationMember.user_id == user_id,
                OrganizationMember.deleted_at.is_(None),
                Organization.deleted_at.is_(None),
                Organization.org_type == target_org_type
            ).first()
            if membership:
                return str(membership.organization_id)
            
            # 3. Auto-provision default organization specifically for target_org_type
            org_name = current_user.get("name") or (user_obj.name if user_obj else None) or "My Organization"
            suffix = "Exhibitor Team" if target_org_type == "EXHIBITOR" else "Organizer Team"
            display_name = f"{org_name}'s {suffix}"
            base_slug = re.sub(r'[^a-zA-Z0-9]+', '-', org_name.lower()).strip('-') or "org"
            slug = f"{base_slug}-{target_org_type.lower()}-{str(user_id)[:8]}"

            existing = session.query(Organization).filter_by(slug=slug).first()
            if existing:
                slug = f"{slug}-{secrets.token_hex(2)}"

            new_org = Organization(
                name=display_name,
                slug=slug,
                org_type=target_org_type,
                owner_id=user_id,
                status="ACTIVE",
                created_by=user_id
            )
            session.add(new_org)
            session.commit()
            return str(new_org.id)
        except HTTPException:
            raise
        except Exception:
            session.rollback()
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No active organization found for this user. Please set up your organization first."
            )
        finally:
            session.close()

    @staticmethod
    def _check_has_permission(current_user: dict, org_id: str, required_permissions: list[str], err_msg: str = "Access Denied: You do not have permission to perform this action."):
        user_id = current_user.get("user_id") or current_user.get("id")
        roles = current_user.get("roles") or [current_user.get("role")]
        if any(str(r).lower() in ["superuser", "superadmin"] for r in roles if r):
            return True

        session = db_session()
        try:
            org = session.query(Organization).filter_by(id=org_id, owner_id=user_id, deleted_at=None).first()
            if org:
                return True
        finally:
            session.close()

        user_perms = RBACService.get_user_permissions(user_id, org_id)
        if "*" in user_perms:
            return True
        if any(req in user_perms for req in required_permissions):
            return True
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=err_msg)

    @staticmethod
    def get_permissions(scope: Optional[str] = None):
        try:
            perms = RBACService.get_permissions(scope=scope)
            return {"success": True, "data": perms}
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))

    @staticmethod
    def create_permission(payload: dict, current_user: dict):
        try:
            # Check superadmin or admin authorization
            roles = current_user.get("roles") or [current_user.get("role")]
            is_admin = any(str(r).lower() in ["superuser", "superadmin", "admin"] for r in roles if r)
            if not is_admin:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only super administrators can manage screen permissions.")

            perm = RBACService.create_permission(
                module=payload.get("module"),
                action=payload.get("action"),
                code=payload.get("code"),
                name=payload.get("name"),
                description=payload.get("description")
            )
            return {"success": True, "message": "Permission created successfully", "data": perm}
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))

    @staticmethod
    def update_permission(permission_id: str, payload: dict, current_user: dict):
        try:
            roles = current_user.get("roles") or [current_user.get("role")]
            is_admin = any(str(r).lower() in ["superuser", "superadmin", "admin"] for r in roles if r)
            if not is_admin:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only super administrators can manage screen permissions.")

            perm = RBACService.update_permission(
                permission_id=permission_id,
                name=payload.get("name"),
                description=payload.get("description")
            )
            return {"success": True, "message": "Permission updated successfully", "data": perm}
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))

    @staticmethod
    def delete_permission(permission_id: str, current_user: dict):
        try:
            roles = current_user.get("roles") or [current_user.get("role")]
            is_admin = any(str(r).lower() in ["superuser", "superadmin", "admin"] for r in roles if r)
            if not is_admin:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only super administrators can manage screen permissions.")

            RBACService.delete_permission(permission_id)
            return {"success": True, "message": "Permission deleted successfully"}
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))


    @staticmethod
    def get_roles(current_user: dict, org_id: Optional[str] = None, workspace_scope: Optional[str] = None):
        try:
            resolved_org = None
            try:
                resolved_org = RBACController._resolve_org_id(current_user, org_id, workspace_scope)
            except Exception:
                pass
            roles = RBACService.get_roles(resolved_org)
            return {"success": True, "data": roles}
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))

    @staticmethod
    def create_custom_role(payload: dict, current_user: dict, org_id: Optional[str] = None, workspace_scope: Optional[str] = None):
        try:
            resolved_org = RBACController._resolve_org_id(current_user, org_id, workspace_scope)
            RBACController._check_has_permission(current_user, resolved_org, ["roles.manage", "exhibitor.roles.manage"], "Access Denied: You do not have permission to create roles.")
            user_id = current_user.get("user_id") or current_user.get("id")
            role = RBACService.create_custom_role(
                organization_id=resolved_org,
                name=payload.get("name"),
                description=payload.get("description", ""),
                permission_codes=payload.get("permissions", []),
                created_by=user_id
            )
            return {"success": True, "data": role, "message": "Custom role created successfully."}
        except HTTPException:
            raise
        except ValueError as ve:
            raise HTTPException(status_code=400, detail=str(ve))
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    @staticmethod
    def update_custom_role(role_id: str, payload: dict, current_user: dict, org_id: Optional[str] = None, workspace_scope: Optional[str] = None):
        try:
            resolved_org = RBACController._resolve_org_id(current_user, org_id, workspace_scope)
            RBACController._check_has_permission(current_user, resolved_org, ["roles.manage", "exhibitor.roles.manage"], "Access Denied: You do not have permission to edit roles.")
            user_id = current_user.get("user_id") or current_user.get("id")
            role = RBACService.update_custom_role(
                role_id=role_id,
                organization_id=resolved_org,
                name=payload.get("name"),
                description=payload.get("description", ""),
                permission_codes=payload.get("permissions", []),
                updated_by=user_id
            )
            return {"success": True, "data": role, "message": "Custom role updated successfully."}
        except HTTPException:
            raise
        except ValueError as ve:
            raise HTTPException(status_code=400, detail=str(ve))
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    @staticmethod
    def delete_custom_role(role_id: str, payload: dict, current_user: dict, org_id: Optional[str] = None, workspace_scope: Optional[str] = None):
        try:
            resolved_org = RBACController._resolve_org_id(current_user, org_id, workspace_scope)
            RBACController._check_has_permission(current_user, resolved_org, ["roles.manage", "exhibitor.roles.manage"], "Access Denied: You do not have permission to delete roles.")
            user_id = current_user.get("user_id") or current_user.get("id")
            RBACService.delete_custom_role(
                role_id=role_id,
                organization_id=resolved_org,
                reassign_role_id=payload.get("reassign_role_id"),
                deleted_by=user_id
            )
            return {"success": True, "message": "Role deleted successfully."}
        except HTTPException:
            raise
        except ValueError as ve:
            raise HTTPException(status_code=400, detail=str(ve))
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    @staticmethod
    def get_team_members(current_user: dict, org_id: Optional[str] = None, workspace_scope: Optional[str] = None):
        try:
            resolved_org = RBACController._resolve_org_id(current_user, org_id, workspace_scope)
            members = RBACService.get_team_members(resolved_org)
            return {"success": True, "data": members}
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))

    @staticmethod
    def invite_team_member(payload: dict, current_user: dict, org_id: Optional[str] = None, workspace_scope: Optional[str] = None):
        try:
            resolved_org = RBACController._resolve_org_id(current_user, org_id, workspace_scope)
            RBACController._check_has_permission(current_user, resolved_org, ["team.invite", "team.manage", "exhibitor.team.invite", "exhibitor.team.manage"], "Access Denied: You do not have permission to invite team members.")
            user_id = current_user.get("user_id") or current_user.get("id")
            result = RBACService.invite_team_member(
                organization_id=resolved_org,
                role_id=payload.get("role_id"),
                email=payload.get("email"),
                name=payload.get("name", ""),
                invited_by=user_id
            )
            return {"success": True, "data": result, "message": f"Invitation sent to {payload.get('email')}"}
        except HTTPException:
            raise
        except ValueError as ve:
            raise HTTPException(status_code=400, detail=str(ve))
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    @staticmethod
    def verify_invitation(token: str):
        try:
            result = RBACService.verify_invitation(token)
            return {"success": True, "data": result}
        except ValueError as ve:
            raise HTTPException(status_code=400, detail=str(ve))
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    @staticmethod
    def accept_invitation(payload: dict, current_user: dict):
        try:
            user_id = current_user.get("user_id") or current_user.get("id")
            result = RBACService.accept_invitation(payload.get("token"), user_id)
            return {"success": True, "data": result, "message": "Joined organization successfully!"}
        except ValueError as ve:
            raise HTTPException(status_code=400, detail=str(ve))
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    @staticmethod
    def register_and_accept(payload: dict):
        raw_token = payload.get("token")
        invitation_info = RBACService.verify_invitation(raw_token)
        email = invitation_info["email"].lower().strip()
        password_raw = payload.get("password")
        target_role = "exhibitor" if invitation_info.get("org_type") == "EXHIBITOR" else "organizer"

        session = db_session()
        try:
            user = session.query(User).filter(func.lower(User.email) == email).first()
            if user:
                # Pre-provisioned or existing user accepting invitation
                if password_raw:
                    user.password = generate_password_hash(password_raw)
                    user.must_change_password = False
                if payload.get("name"):
                    user.name = payload.get("name")
                user.email_verified = True
                user.status = "ACTIVE"
                user_roles = list(user.roles) if user.roles else ["user"]
                if target_role not in user_roles:
                    user_roles.append(target_role)
                user.roles = user_roles
                user.active_role = target_role
                session.commit()
            else:
                # Create new user
                user_roles = ["user", target_role]
                user = User(
                    email=email,
                    name=payload.get("name") or invitation_info.get("name") or email.split("@")[0],
                    password=generate_password_hash(password_raw or secrets.token_urlsafe(12)),
                    roles=user_roles,
                    active_role=target_role,
                    mobile=payload.get("mobile"),
                    email_verified=True,
                    status="ACTIVE",
                    must_change_password=False if password_raw else True
                )
                session.add(user)
                session.commit()

            user_id = str(user.id)
            user_name = user.name or (payload.get("name") or invitation_info.get("name") or email.split("@")[0])
            user_email = user.email
            user_active_role = user.active_role or target_role
            user_roles_list = list(user.roles) if user.roles else [target_role]
            user_must_change = bool(user.must_change_password)
        except Exception as e:
            session.rollback()
            raise HTTPException(status_code=500, detail=str(e))
        finally:
            session.close()

        # Accept invitation (upserts OrganizationMember and marks token ACCEPTED)
        RBACService.accept_invitation(raw_token, user_id)

        # Generate authentication tokens
        token = generate_access_token(user_id, user_active_role, roles=user_roles_list)
        refresh = generate_refresh_token(user_id, user_active_role, roles=user_roles_list)

        user_dict = {
            "id": user_id,
            "name": user_name,
            "email": user_email,
            "active_role": user_active_role,
            "roles": user_roles_list,
            "status": "ACTIVE",
            "email_verified": True,
            "must_change_password": user_must_change,
            "organization_name": invitation_info.get("organization_name"),
            "role_name": invitation_info.get("role_name")
        }

        return {
            "success": True,
            "data": {
                "token": token,
                "access_token": token,
                "refresh_token": refresh,
                "user": user_dict,
                "target_role": user_active_role,
                "organization_name": invitation_info.get("organization_name")
            },
            "message": "Account setup and joined organization successfully!"
        }

    @staticmethod
    def remove_member(member_id: str, current_user: dict, org_id: Optional[str] = None, workspace_scope: Optional[str] = None, hard_delete: bool = True):
        try:
            resolved_org = RBACController._resolve_org_id(current_user, org_id, workspace_scope)
            RBACController._check_has_permission(current_user, resolved_org, ["team.remove", "team.manage", "exhibitor.team.remove", "exhibitor.team.manage"], "Access Denied: You do not have permission to remove team members.")
            user_id = current_user.get("user_id") or current_user.get("id")
            RBACService.remove_member(resolved_org, member_id, user_id, hard_delete=hard_delete)
            return {"success": True, "message": "Member removed successfully."}
        except HTTPException:
            raise
        except ValueError as ve:
            raise HTTPException(status_code=400, detail=str(ve))
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    @staticmethod
    def update_member_status(member_id: str, payload: dict, current_user: dict, org_id: Optional[str] = None, workspace_scope: Optional[str] = None):
        try:
            resolved_org = RBACController._resolve_org_id(current_user, org_id, workspace_scope)
            RBACController._check_has_permission(current_user, resolved_org, ["team.edit", "team.manage", "exhibitor.team.edit", "exhibitor.team.manage"], "Access Denied: You do not have permission to update member status.")
            user_id = current_user.get("user_id") or current_user.get("id")
            member = RBACService.update_member_status(
                organization_id=resolved_org,
                member_id=member_id,
                status_val=payload.get("status", "ACTIVE"),
                updated_by=user_id
            )
            return {"success": True, "message": "Member status updated successfully.", "data": member}
        except HTTPException:
            raise
        except ValueError as ve:
            raise HTTPException(status_code=400, detail=str(ve))
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))


    @staticmethod
    def get_my_permissions(current_user: dict, org_id: Optional[str] = None, workspace_scope: Optional[str] = None):
        try:
            user_id = current_user.get("user_id") or current_user.get("id")
            resolved_org = None
            try:
                resolved_org = RBACController._resolve_org_id(current_user, org_id, workspace_scope)
            except Exception:
                pass
            perms = RBACService.get_user_permissions(user_id, resolved_org)
            return {"success": True, "data": perms}
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))
