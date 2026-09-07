import secrets
import hashlib
from datetime import datetime, timedelta, timezone
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import joinedload
from sqlalchemy import or_, and_
from app.extensions.database import db_session
from app.models.rbac import Role, Permission, RolePermission
from app.models.organization import Organization, OrganizationMember, OrganizationInvitation
from app.models.user import User
from app.models.audit_log import AuditLog
from werkzeug.security import generate_password_hash



class RBACRepository:

    @staticmethod
    def get_all_permissions(scope: Optional[str] = None) -> List[Dict[str, Any]]:
        session = db_session()
        try:
            query = session.query(Permission)
            if scope:
                clean_scope = scope.strip().upper()
                if clean_scope in ["ORGANIZER", "EXHIBITOR"]:
                    query = query.filter(Permission.scope.in_([clean_scope, "BOTH"]))
            perms = query.order_by(Permission.module, Permission.name).all()
            return [p.to_dict() for p in perms]
        finally:
            session.close()

    @staticmethod
    def create_permission(module: str, action: str, code: Optional[str], name: str, description: Optional[str] = None) -> Dict[str, Any]:
        session = db_session()
        try:
            clean_module = module.strip().lower()
            clean_action = action.strip().lower()
            clean_code = code.strip().lower() if code else f"{clean_module}.{clean_action}"

            existing = session.query(Permission).filter(Permission.code == clean_code).first()
            if existing:
                raise ValueError(f"Permission with code '{clean_code}' already exists.")

            perm = Permission(
                module=clean_module,
                action=clean_action,
                code=clean_code,
                name=name.strip(),
                description=description.strip() if description else None
            )
            session.add(perm)
            session.commit()
            return perm.to_dict()
        except Exception:
            session.rollback()
            raise
        finally:
            session.close()

    @staticmethod
    def update_permission(permission_id: str, name: Optional[str] = None, description: Optional[str] = None) -> Dict[str, Any]:
        session = db_session()
        try:
            perm = session.query(Permission).filter(Permission.id == permission_id).first()
            if not perm:
                raise ValueError(f"Permission '{permission_id}' not found.")

            if name:
                perm.name = name.strip()
            if description is not None:
                perm.description = description.strip() if description else None

            session.commit()
            return perm.to_dict()
        except Exception:
            session.rollback()
            raise
        finally:
            session.close()

    @staticmethod
    def delete_permission(permission_id: str) -> bool:
        session = db_session()
        try:
            perm = session.query(Permission).filter(Permission.id == permission_id).first()
            if not perm:
                raise ValueError(f"Permission '{permission_id}' not found.")

            session.query(RolePermission).filter(RolePermission.permission_id == perm.id).delete()
            session.delete(perm)
            session.commit()
            return True
        except Exception:
            session.rollback()
            raise
        finally:
            session.close()


    @staticmethod
    def get_roles_for_tenant(organization_id: Optional[str] = None) -> List[Dict[str, Any]]:
        session = db_session()
        try:
            if not organization_id:
                return []

            roles = session.query(Role).options(joinedload(Role.role_permissions).joinedload(RolePermission.permission))\
                .filter(
                    Role.organization_id == organization_id,
                    Role.deleted_at.is_(None),
                    ~Role.code.in_(["superadmin", "super_admin", "org_owner", "organizer_owner"])
                )\
                .order_by(Role.created_at.desc(), Role.name)\
                .all()
            return [r.to_dict() for r in roles]
        finally:
            session.close()

    @staticmethod
    def get_role_by_id(role_id: str) -> Optional[Role]:
        session = db_session()
        try:
            return session.query(Role).options(joinedload(Role.role_permissions).joinedload(RolePermission.permission))\
                .filter(Role.id == role_id, Role.deleted_at.is_(None)).first()
        finally:
            session.close()

    @staticmethod
    def create_custom_role(
        organization_id: str,
        name: str,
        code: str,
        description: str,
        permission_codes: List[str],
        created_by: str
    ) -> Dict[str, Any]:
        session = db_session()
        try:
            # Check unique role code in organization
            existing = session.query(Role).filter(
                Role.organization_id == organization_id,
                Role.code == code,
                Role.deleted_at.is_(None)
            ).first()
            if existing:
                raise ValueError(f"A role with code '{code}' already exists in this organization.")

            new_role = Role(
                organization_id=organization_id,
                name=name,
                code=code,
                description=description,
                is_system_role=False,
                is_default=False,
                created_by=created_by
            )
            session.add(new_role)
            session.flush()

            # Attach permissions
            if permission_codes:
                matched_perms = session.query(Permission).filter(Permission.code.in_(permission_codes)).all()
                for perm in matched_perms:
                    rp = RolePermission(role_id=new_role.id, permission_id=perm.id, created_by=created_by)
                    session.add(rp)

            # Audit Log
            audit = AuditLog(
                organization_id=organization_id,
                user_id=created_by,
                action="role.create",
                resource_type="role",
                resource_id=new_role.id,
                after_state=new_role.to_dict()
            )
            session.add(audit)

            session.commit()
            return new_role.to_dict()
        except Exception as e:
            session.rollback()
            raise e
        finally:
            session.close()

    @staticmethod
    def update_custom_role(
        role_id: str,
        organization_id: str,
        name: str,
        description: str,
        permission_codes: List[str],
        updated_by: str
    ) -> Dict[str, Any]:
        session = db_session()
        try:
            role = session.query(Role).filter(
                Role.id == role_id,
                Role.organization_id == organization_id,
                Role.deleted_at.is_(None)
            ).first()
            if not role:
                raise ValueError("Custom role not found or belongs to another organization.")

            if role.is_system_role:
                raise ValueError("System-defined roles cannot be modified.")

            before_state = role.to_dict()
            role.name = name
            role.description = description
            role.updated_by = updated_by

            # Re-map permissions
            session.query(RolePermission).filter(RolePermission.role_id == role.id).delete()
            if permission_codes:
                matched_perms = session.query(Permission).filter(Permission.code.in_(permission_codes)).all()
                for perm in matched_perms:
                    rp = RolePermission(role_id=role.id, permission_id=perm.id, created_by=updated_by)
                    session.add(rp)

            audit = AuditLog(
                organization_id=organization_id,
                user_id=updated_by,
                action="role.update",
                resource_type="role",
                resource_id=role.id,
                before_state=before_state,
                after_state=role.to_dict()
            )
            session.add(audit)

            session.commit()
            return role.to_dict()
        except Exception as e:
            session.rollback()
            raise e
        finally:
            session.close()

    @staticmethod
    def delete_custom_role(
        role_id: str,
        organization_id: str,
        reassign_role_id: Optional[str],
        deleted_by: str
    ) -> bool:
        session = db_session()
        try:
            role = session.query(Role).filter(
                Role.id == role_id,
                Role.organization_id == organization_id,
                Role.deleted_at.is_(None)
            ).first()
            if not role:
                raise ValueError("Role not found.")
            if role.is_system_role:
                raise ValueError("System roles cannot be deleted.")

            # Check if members are assigned to this role
            active_members = session.query(OrganizationMember).filter(
                OrganizationMember.role_id == role_id,
                OrganizationMember.organization_id == organization_id,
                OrganizationMember.deleted_at.is_(None)
            ).all()

            if active_members:
                m_names = [m.user.name or m.user.email for m in active_members if m.user]
                names_str = ", ".join(m_names[:3]) if m_names else "active users"
                if len(m_names) > 3:
                    names_str += f" and {len(m_names) - 3} more"
                if not reassign_role_id:
                    raise ValueError(f"Cannot delete role: Currently assigned to {len(active_members)} active team member(s) ({names_str}). Please reassign or remove these members first.")
                
                # Validate replacement role
                reassign_role = session.query(Role).filter(
                    Role.id == reassign_role_id,
                    Role.deleted_at.is_(None),
                    or_(Role.organization_id.is_(None), Role.organization_id == organization_id)
                ).first()
                if not reassign_role:
                    raise ValueError("Reassignment target role does not exist.")

                for m in active_members:
                    m.role_id = reassign_role.id
                    m.updated_by = deleted_by

            role.deleted_at = datetime.now(timezone.utc)
            role.deleted_by = deleted_by

            audit = AuditLog(
                organization_id=organization_id,
                user_id=deleted_by,
                action="role.delete",
                resource_type="role",
                resource_id=role.id,
                before_state={"id": str(role.id), "name": role.name, "reassigned_to": str(reassign_role_id) if reassign_role_id else None}
            )
            session.add(audit)

            session.commit()
            return True
        except Exception as e:
            session.rollback()
            raise e
        finally:
            session.close()

    @staticmethod
    def update_member_status(
        organization_id: str,
        member_id: str,
        status_val: str,
        updated_by: str
    ) -> Dict[str, Any]:
        session = db_session()
        try:
            member = session.query(OrganizationMember).filter(
                OrganizationMember.id == member_id,
                OrganizationMember.organization_id == organization_id,
                OrganizationMember.deleted_at.is_(None)
            ).first()
            if not member:
                raise ValueError("Organization member not found.")

            clean_status = status_val.strip().upper()
            if clean_status not in ["ACTIVE", "DEACTIVATED", "SUSPENDED"]:
                raise ValueError("Invalid status. Allowed values: ACTIVE, DEACTIVATED")

            member.status = clean_status
            member.updated_by = updated_by

            audit = AuditLog(
                organization_id=organization_id,
                user_id=updated_by,
                action="team.member_status",
                resource_type="team_member",
                resource_id=member.id,
                after_state={"status": clean_status}
            )
            session.add(audit)
            session.commit()
            return member.to_dict()
        except Exception:
            session.rollback()
            raise
        finally:
            session.close()

    @staticmethod
    def get_organization_members(organization_id: str) -> List[Dict[str, Any]]:
        session = db_session()
        try:
            # 1. Fetch active and deactivated members
            members = session.query(OrganizationMember)\
                .options(joinedload(OrganizationMember.user), joinedload(OrganizationMember.role))\
                .filter(
                    OrganizationMember.organization_id == organization_id,
                    OrganizationMember.deleted_at.is_(None)
                ).order_by(OrganizationMember.joined_at.desc()).all()
            
            result = [m.to_dict() for m in members]
            active_emails = {m.user.email.lower() for m in members if m.user and m.user.email}

            # 2. Fetch pending invitations for this organization
            invitations = session.query(OrganizationInvitation)\
                .options(joinedload(OrganizationInvitation.role))\
                .filter(
                    OrganizationInvitation.organization_id == organization_id,
                    OrganizationInvitation.status == 'PENDING'
                ).order_by(OrganizationInvitation.created_at.desc()).all()

            for inv in invitations:
                if inv.invited_email.lower() not in active_emails:
                    result.append({
                        "id": str(inv.id),
                        "organization_id": str(inv.organization_id),
                        "user_id": None,
                        "role_id": str(inv.role_id),
                        "role_name": inv.role.name if inv.role else "Custom Role",
                        "role_code": inv.role.code if inv.role else None,
                        "user_name": inv.invited_name or inv.invited_email.split("@")[0].capitalize(),
                        "user_email": inv.invited_email,
                        "title": inv.invited_name,
                        "department": None,
                        "status": "PENDING",
                        "joined_at": None,
                        "created_at": inv.created_at.isoformat() if inv.created_at else None,
                        "is_deleted": False,
                        "is_invitation": True
                    })

            return result
        finally:
            session.close()

    @staticmethod
    def create_invitation(
        organization_id: str,
        role_id: str,
        email: str,
        name: str,
        invited_by: str
    ) -> Dict[str, Any]:
        session = db_session()
        try:
            # Validate role exists
            role = session.query(Role).filter(Role.id == role_id, Role.deleted_at.is_(None)).first()
            if not role:
                raise ValueError("Target role not found.")

            # Generate secure temporary password for direct onboarding
            temp_password = f"BME#{secrets.token_hex(3).upper()}"
            hashed_temp_pw = generate_password_hash(temp_password)

            # Check if user already exists
            existing_user = session.query(User).filter(User.email == email.lower().strip(), User.deleted_at.is_(None)).first()
            if existing_user:
                # Disallow inviting registered Organizers or Exhibitors as team members
                from app.models.organizer_profile import OrganizerProfile
                from app.models.exhibitor_profile import ExhibitorProfile

                has_org_profile = session.query(OrganizerProfile).filter(OrganizerProfile.user_id == existing_user.id).first() is not None
                has_exh_profile = session.query(ExhibitorProfile).filter(ExhibitorProfile.user_id == existing_user.id).first() is not None
                owns_organization = session.query(Organization).filter(Organization.created_by == existing_user.id, Organization.deleted_at.is_(None)).first() is not None

                if has_org_profile or has_exh_profile or owns_organization:
                    user_type = "Event Organizer" if (has_org_profile or owns_organization) else "Exhibitor"
                    raise ValueError(
                        f"The email '{email}' is registered as an independent {user_type} on BookMyEvent. "
                        f"Registered {user_type}s cannot be added as team members. Please invite a different email address."
                    )

                existing_member = session.query(OrganizationMember).filter(
                    OrganizationMember.organization_id == organization_id,
                    OrganizationMember.user_id == existing_user.id,
                    OrganizationMember.deleted_at.is_(None)
                ).first()
                if existing_member:
                    raise ValueError(f"{email} is already an active member of this organization.")

                # Re-invited team member: Update temporary password and force password change
                existing_user.password = hashed_temp_pw
                existing_user.must_change_password = True
                session.flush()
            else:
                # Auto-provision user account with temporary password
                new_user = User(
                    email=email.lower().strip(),
                    name=name or email.split("@")[0].capitalize(),
                    password=hashed_temp_pw,
                    active_role="user",
                    roles=["user"],
                    must_change_password=True
                )
                session.add(new_user)
                session.flush()

            # Invalidate previous pending invitations for this email + org
            session.query(OrganizationInvitation).filter(
                OrganizationInvitation.organization_id == organization_id,
                OrganizationInvitation.invited_email == email.lower().strip(),
                OrganizationInvitation.status == 'PENDING'
            ).update({"status": "REVOKED"})

            raw_token = secrets.token_urlsafe(32)
            token_hash = hashlib.sha256(raw_token.encode()).hexdigest()
            expires_at = datetime.now(timezone.utc) + timedelta(days=7)

            invitation = OrganizationInvitation(
                organization_id=organization_id,
                role_id=role_id,
                invited_email=email.lower().strip(),
                invited_name=name,
                token_hash=token_hash,
                status='PENDING',
                expires_at=expires_at,
                created_by=invited_by
            )
            session.add(invitation)

            audit = AuditLog(
                organization_id=organization_id,
                user_id=invited_by,
                action="team.invite",
                resource_type="team_member",
                after_state={"email": email, "role_id": str(role_id), "name": name}
            )
            session.add(audit)

            session.commit()
            result = invitation.to_dict()
            result["raw_token"] = raw_token # Returned only once for email dispatch
            result["temp_password"] = temp_password
            return result

        except Exception as e:
            session.rollback()
            raise e
        finally:
            session.close()

    @staticmethod
    def verify_invitation(raw_token: str) -> Dict[str, Any]:
        session = db_session()
        try:
            token_hash = hashlib.sha256(raw_token.encode()).hexdigest()
            invitation = session.query(OrganizationInvitation)\
                .options(joinedload(OrganizationInvitation.organization), joinedload(OrganizationInvitation.role))\
                .filter(OrganizationInvitation.token_hash == token_hash).first()
            
            if not invitation:
                raise ValueError("Invalid invitation link or token.")
            if invitation.status != 'PENDING':
                raise ValueError(f"Invitation is already {invitation.status.lower()}.")
            
            now_utc = datetime.now(timezone.utc)
            # Handle naive or aware datetime
            exp = invitation.expires_at
            if exp.tzinfo is None:
                exp = exp.replace(tzinfo=timezone.utc)
            if now_utc > exp:
                invitation.status = 'EXPIRED'
                session.commit()
                raise ValueError("This invitation has expired. Please ask your administrator to send a new invite.")

            # Check if user already exists
            existing_user = session.query(User).filter(User.email == invitation.invited_email, User.deleted_at.is_(None)).first()

            return {
                "valid": True,
                "email": invitation.invited_email,
                "name": invitation.invited_name,
                "organization_name": invitation.organization.name if invitation.organization else "Organization",
                "org_type": invitation.organization.org_type if invitation.organization else "ORGANIZER",
                "role_name": invitation.role.name if invitation.role else "Member",
                "is_existing_user": bool(existing_user),
                "organization_id": str(invitation.organization_id),
                "role_id": str(invitation.role_id)
            }
        finally:
            session.close()

    @staticmethod
    def accept_invitation(raw_token: str, user_id: str) -> Dict[str, Any]:
        session = db_session()
        try:
            token_hash = hashlib.sha256(raw_token.encode()).hexdigest()
            invitation = session.query(OrganizationInvitation).filter(
                OrganizationInvitation.token_hash == token_hash,
                OrganizationInvitation.status == 'PENDING'
            ).first()
            if not invitation:
                raise ValueError("Invalid or expired invitation.")

            user = session.query(User).filter(User.id == user_id, User.deleted_at.is_(None)).first()
            if not user:
                raise ValueError("User not found.")

            # Upsert organization_members to avoid duplicate key issues
            member = session.query(OrganizationMember).filter(
                OrganizationMember.organization_id == invitation.organization_id,
                OrganizationMember.user_id == user.id
            ).first()
            if member:
                member.role_id = invitation.role_id
                member.title = invitation.invited_name or user.name or member.title
                member.status = 'ACTIVE'
                member.deleted_at = None
            else:
                member = OrganizationMember(
                    organization_id=invitation.organization_id,
                    user_id=user.id,
                    role_id=invitation.role_id,
                    title=invitation.invited_name or user.name,
                    status='ACTIVE'
                )
                session.add(member)
            session.flush()

            # Mark invitation accepted
            invitation.status = 'ACCEPTED'
            invitation.accepted_at = datetime.now(timezone.utc)
            invitation.accepted_by_user_id = user.id

            # Sync organization workspace role to user profile
            org = session.query(Organization).filter_by(id=invitation.organization_id).first()
            target_role = "exhibitor" if (org and org.org_type == "EXHIBITOR") else "organizer"
            user_roles = list(user.roles) if user.roles else ["user"]
            if target_role not in user_roles:
                user_roles.append(target_role)
            user.roles = user_roles
            user.active_role = target_role

            audit = AuditLog(
                organization_id=invitation.organization_id,
                user_id=user.id,
                action="team.join",
                resource_type="team_member",
                resource_id=member.id,
                after_state={"user_id": str(user.id), "email": user.email, "role_id": str(invitation.role_id)}
            )
            session.add(audit)

            session.commit()
            return {
                "success": True,
                "organization_id": str(invitation.organization_id),
                "member_id": str(member.id),
                "target_role": target_role
            }
        except Exception as e:
            session.rollback()
            raise e
        finally:
            session.close()

    @staticmethod
    def remove_member(organization_id: str, member_id: str, deleted_by: str, hard_delete: bool = True) -> bool:
        session = db_session()
        try:
            member = session.query(OrganizationMember).filter(
                OrganizationMember.id == member_id,
                OrganizationMember.organization_id == organization_id,
                OrganizationMember.deleted_at.is_(None)
            ).first()
            if not member:
                # Check if it is a pending invitation to revoke or delete
                inv = session.query(OrganizationInvitation).filter(
                    OrganizationInvitation.id == member_id,
                    OrganizationInvitation.organization_id == organization_id
                ).first()
                if inv:
                    if hard_delete:
                        session.delete(inv)
                    else:
                        inv.status = 'REVOKED'
                    session.commit()
                    return True
                raise ValueError("Team member or invitation not found.")

            # Prevent deleting the organization owner
            org = session.query(Organization).filter(Organization.id == organization_id).first()
            if org and org.owner_id == member.user_id:
                raise ValueError("Cannot remove the organization owner.")

            # Check if there's any invitation for this user/email in this organization to clean up
            target_user = session.query(User).filter_by(id=member.user_id).first()
            if target_user and hard_delete:
                session.query(OrganizationInvitation).filter(
                    OrganizationInvitation.organization_id == organization_id,
                    OrganizationInvitation.invited_email == target_user.email
                ).delete(synchronize_session=False)

                # Check if target user has any other active memberships or own organization
                other_memberships = session.query(OrganizationMember).filter(
                    OrganizationMember.user_id == target_user.id,
                    OrganizationMember.id != member.id,
                    OrganizationMember.deleted_at.is_(None)
                ).count()
                owns_org = session.query(Organization).filter(Organization.owner_id == target_user.id).count()
                is_admin = any(r in ['organizer', 'exhibitor', 'superadmin'] for r in (target_user.roles or [])) and owns_org > 0

                if other_memberships == 0 and not is_admin:
                    session.delete(target_user)

            if hard_delete:
                session.delete(member)
            else:
                member.deleted_at = datetime.now(timezone.utc)
                member.deleted_by = deleted_by
                member.status = 'DEACTIVATED'

            audit = AuditLog(
                organization_id=organization_id,
                user_id=deleted_by,
                action="team.remove_member",
                resource_type="team_member",
                resource_id=member.id
            )
            session.add(audit)

            session.commit()
            return True
        except Exception as e:
            session.rollback()
            raise e
        finally:
            session.close()

    @staticmethod
    def get_user_effective_permissions(user_id: str, organization_id: Optional[str] = None) -> List[str]:
        session = db_session()
        try:
            user = session.query(User).filter(User.id == user_id, User.deleted_at.is_(None)).first()
            if not user:
                return []

            # Super administrator universal bypass
            clean_roles = [str(r).lower() for r in (user.roles or ["user"])]
            if any(r in clean_roles for r in ["superuser", "superadmin", "admin"]):
                all_perms = session.query(Permission.code).all()
                return [p[0] for p in all_perms] + ["*"]

            # If organization_id provided, query membership role or check ownership
            perms = set()
            if organization_id:
                org = session.query(Organization).filter(
                    Organization.id == organization_id,
                    Organization.deleted_at.is_(None)
                ).first()

                # Primary organization owner has implicit full control over their organization's scope
                if org and str(org.owner_id) == str(user_id):
                    org_scope = (org.org_type or "ORGANIZER").upper()
                    owner_perms = session.query(Permission.code).filter(
                        Permission.scope.in_([org_scope, "BOTH"])
                    ).all()
                    return [p[0] for p in owner_perms] + [f"{org_scope.lower()}.*"]

                member = session.query(OrganizationMember)\
                    .options(joinedload(OrganizationMember.role).joinedload(Role.role_permissions).joinedload(RolePermission.permission))\
                    .filter(
                        OrganizationMember.user_id == user_id,
                        OrganizationMember.organization_id == organization_id,
                        OrganizationMember.deleted_at.is_(None),
                        OrganizationMember.status == 'ACTIVE'
                    ).first()
                if member and member.role:
                    for rp in member.role.role_permissions:
                        if rp.permission and rp.permission.code:
                            perms.add(rp.permission.code)

            if not perms:
                from app.models.organizer_profile import OrganizerProfile
                from app.models.exhibitor_profile import ExhibitorProfile

                is_organizer = (
                    "organizer" in clean_roles or
                    session.query(OrganizerProfile).filter(OrganizerProfile.user_id == user.id).first() is not None
                )
                if is_organizer:
                    owner_perms = session.query(Permission.code).filter(
                        Permission.scope.in_(["ORGANIZER", "BOTH"])
                    ).all()
                    return [p[0] for p in owner_perms] + ["organizer.*"]

                is_exhibitor = (
                    "exhibitor" in clean_roles or
                    session.query(ExhibitorProfile).filter(ExhibitorProfile.user_id == user.id).first() is not None
                )
                if is_exhibitor:
                    owner_perms = session.query(Permission.code).filter(
                        Permission.scope.in_(["EXHIBITOR", "BOTH"])
                    ).all()
                    return [p[0] for p in owner_perms] + ["exhibitor.*"]

            return list(perms)
        finally:
            session.close()

