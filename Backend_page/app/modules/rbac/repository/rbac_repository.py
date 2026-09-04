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


class RBACRepository:

    @staticmethod
    def get_all_permissions() -> List[Dict[str, Any]]:
        session = db_session()
        try:
            perms = session.query(Permission).order_by(Permission.module, Permission.code).all()
            return [p.to_dict() for p in perms]
        finally:
            session.close()

    @staticmethod
    def get_roles_for_tenant(organization_id: Optional[str] = None) -> List[Dict[str, Any]]:
        session = db_session()
        try:
            query = session.query(Role).options(joinedload(Role.role_permissions).joinedload(RolePermission.permission))\
                .filter(Role.deleted_at.is_(None))
            
            if organization_id:
                query = query.filter(or_(Role.organization_id.is_(None), Role.organization_id == organization_id))
            else:
                query = query.filter(Role.organization_id.is_(None))

            roles = query.order_by(Role.is_system_role.desc(), Role.name).all()
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
                if not reassign_role_id:
                    raise ValueError(f"Cannot delete role: {len(active_members)} active members are currently assigned to it. Provide a replacement role.")
                
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
    def get_organization_members(organization_id: str) -> List[Dict[str, Any]]:
        session = db_session()
        try:
            members = session.query(OrganizationMember)\
                .options(joinedload(OrganizationMember.user), joinedload(OrganizationMember.role))\
                .filter(
                    OrganizationMember.organization_id == organization_id,
                    OrganizationMember.deleted_at.is_(None)
                ).order_by(OrganizationMember.joined_at.desc()).all()
            return [m.to_dict() for m in members]
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

            # Check if user is already an active member of this organization
            existing_user = session.query(User).filter(User.email == email.lower().strip(), User.deleted_at.is_(None)).first()
            if existing_user:
                existing_member = session.query(OrganizationMember).filter(
                    OrganizationMember.organization_id == organization_id,
                    OrganizationMember.user_id == existing_user.id,
                    OrganizationMember.deleted_at.is_(None)
                ).first()
                if existing_member:
                    raise ValueError(f"{email} is already an active member of this organization.")

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

            # Add to organization_members
            member = OrganizationMember(
                organization_id=invitation.organization_id,
                user_id=user.id,
                role_id=invitation.role_id,
                title=invitation.invited_name or user.name,
                status='ACTIVE'
            )
            session.add(member)

            # Mark invitation accepted
            invitation.status = 'ACCEPTED'
            invitation.accepted_at = datetime.now(timezone.utc)
            invitation.accepted_by_user_id = user.id

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
            return {"success": True, "organization_id": str(invitation.organization_id), "member_id": str(member.id)}
        except Exception as e:
            session.rollback()
            raise e
        finally:
            session.close()

    @staticmethod
    def remove_member(organization_id: str, member_id: str, deleted_by: str) -> bool:
        session = db_session()
        try:
            member = session.query(OrganizationMember).filter(
                OrganizationMember.id == member_id,
                OrganizationMember.organization_id == organization_id,
                OrganizationMember.deleted_at.is_(None)
            ).first()
            if not member:
                raise ValueError("Team member not found.")

            # Prevent deleting the organization owner
            org = session.query(Organization).filter(Organization.id == organization_id).first()
            if org and org.owner_id == member.user_id:
                raise ValueError("Cannot remove the organization owner.")

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

            # If organization_id provided, query membership role
            perms = set()
            if organization_id:
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
                        if rp.permission:
                            perms.add(rp.permission.code)

            return list(perms)
        finally:
            session.close()
