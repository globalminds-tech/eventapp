from typing import Optional
from fastapi import HTTPException, status
from app.modules.rbac.services.rbac_service import RBACService
from app.extensions.database import db_session
from app.models.organization import Organization, OrganizationMember
from app.models.user import User
from werkzeug.security import generate_password_hash
from app.utils.jwt_utils import generate_access_token, generate_refresh_token


class RBACController:

    @staticmethod
    def _resolve_org_id(current_user: dict, explicit_org_id: Optional[str] = None) -> str:
        if explicit_org_id:
            return explicit_org_id
        
        user_id = current_user.get("user_id") or current_user.get("id")
        session = db_session()
        try:
            # 1. Check if user is owner of an organization
            org = session.query(Organization).filter_by(owner_id=user_id, deleted_at=None).first()
            if org:
                return str(org.id)
            
            # 2. Check if user is a member of an organization
            membership = session.query(OrganizationMember).filter_by(user_id=user_id, deleted_at=None).first()
            if membership:
                return str(membership.organization_id)
            
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No active organization found for this user. Please set up your organization first."
            )
        finally:
            session.close()

    @staticmethod
    def get_permissions():
        try:
            perms = RBACService.get_permissions()
            return {"success": True, "data": perms}
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))

    @staticmethod
    def get_roles(current_user: dict, org_id: Optional[str] = None):
        try:
            resolved_org = None
            try:
                resolved_org = RBACController._resolve_org_id(current_user, org_id)
            except Exception:
                pass
            roles = RBACService.get_roles(resolved_org)
            return {"success": True, "data": roles}
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))

    @staticmethod
    def create_custom_role(payload: dict, current_user: dict, org_id: Optional[str] = None):
        try:
            resolved_org = RBACController._resolve_org_id(current_user, org_id)
            user_id = current_user.get("user_id") or current_user.get("id")
            role = RBACService.create_custom_role(
                organization_id=resolved_org,
                name=payload.get("name"),
                description=payload.get("description", ""),
                permission_codes=payload.get("permissions", []),
                created_by=user_id
            )
            return {"success": True, "data": role, "message": "Custom role created successfully."}
        except ValueError as ve:
            raise HTTPException(status_code=400, detail=str(ve))
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    @staticmethod
    def update_custom_role(role_id: str, payload: dict, current_user: dict, org_id: Optional[str] = None):
        try:
            resolved_org = RBACController._resolve_org_id(current_user, org_id)
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
        except ValueError as ve:
            raise HTTPException(status_code=400, detail=str(ve))
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    @staticmethod
    def delete_custom_role(role_id: str, payload: dict, current_user: dict, org_id: Optional[str] = None):
        try:
            resolved_org = RBACController._resolve_org_id(current_user, org_id)
            user_id = current_user.get("user_id") or current_user.get("id")
            RBACService.delete_custom_role(
                role_id=role_id,
                organization_id=resolved_org,
                reassign_role_id=payload.get("reassign_role_id"),
                deleted_by=user_id
            )
            return {"success": True, "message": "Role deleted successfully."}
        except ValueError as ve:
            raise HTTPException(status_code=400, detail=str(ve))
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    @staticmethod
    def get_team_members(current_user: dict, org_id: Optional[str] = None):
        try:
            resolved_org = RBACController._resolve_org_id(current_user, org_id)
            members = RBACService.get_team_members(resolved_org)
            return {"success": True, "data": members}
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))

    @staticmethod
    def invite_team_member(payload: dict, current_user: dict, org_id: Optional[str] = None):
        try:
            resolved_org = RBACController._resolve_org_id(current_user, org_id)
            user_id = current_user.get("user_id") or current_user.get("id")
            result = RBACService.invite_team_member(
                organization_id=resolved_org,
                role_id=payload.get("role_id"),
                email=payload.get("email"),
                name=payload.get("name", ""),
                invited_by=user_id
            )
            return {"success": True, "data": result, "message": f"Invitation sent to {payload.get('email')}"}
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
        session = db_session()
        try:
            raw_token = payload.get("token")
            invitation_info = RBACService.verify_invitation(raw_token)
            email = invitation_info["email"]

            existing = session.query(User).filter_by(email=email).first()
            if existing:
                raise HTTPException(status_code=400, detail="Account already exists for this email. Please log in first.")

            # Create new user
            new_user = User(
                email=email,
                name=payload.get("name") or invitation_info.get("name") or email.split("@")[0],
                password=generate_password_hash(payload.get("password")),
                role="user",
                roles=["user"],
                active_role="user",
                mobile=payload.get("mobile"),
                email_verified=True,
                status="ACTIVE"
            )
            session.add(new_user)
            session.commit()

            # Accept invitation
            RBACService.accept_invitation(raw_token, str(new_user.id))

            # Generate authentication token
            token = generate_access_token(str(new_user.id), "user", roles=["user"])
            refresh = generate_refresh_token(str(new_user.id), "user", roles=["user"])

            return {
                "success": True,
                "data": {
                    "token": token,
                    "access_token": token,
                    "refresh_token": refresh,
                    "user": new_user.to_dict()
                },
                "message": "Account created and joined organization successfully!"
            }
        except HTTPException as he:
            raise he
        except Exception as e:
            session.rollback()
            raise HTTPException(status_code=500, detail=str(e))
        finally:
            session.close()

    @staticmethod
    def remove_member(member_id: str, current_user: dict, org_id: Optional[str] = None):
        try:
            resolved_org = RBACController._resolve_org_id(current_user, org_id)
            user_id = current_user.get("user_id") or current_user.get("id")
            RBACService.remove_member(resolved_org, member_id, user_id)
            return {"success": True, "message": "Member removed successfully."}
        except ValueError as ve:
            raise HTTPException(status_code=400, detail=str(ve))
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    @staticmethod
    def get_my_permissions(current_user: dict, org_id: Optional[str] = None):
        try:
            user_id = current_user.get("user_id") or current_user.get("id")
            resolved_org = None
            try:
                resolved_org = RBACController._resolve_org_id(current_user, org_id)
            except Exception:
                pass
            perms = RBACService.get_user_permissions(user_id, resolved_org)
            return {"success": True, "data": perms}
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))
