import uuid
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
from sqlalchemy.orm import joinedload
from app.extensions.database import db_session
from app.models.organization import Organization, OrganizationMember, OrganizationInvitation
from app.models.rbac import Role, RolePermission, Permission
from app.models.user import User


class TenantService:

    @staticmethod
    def auto_accept_pending_invitations_for_user(user_id: str, email: str) -> None:
        """
        When a user logs in (e.g. with direct temporary password credentials),
        auto-accept any pending organization invitations for this email.
        Ensures the user is immediately an active OrganizationMember and has appropriate roles.
        """
        if not email:
            return

        session = db_session()
        try:
            clean_email = email.strip().lower()
            pending_invitations = session.query(OrganizationInvitation).filter(
                OrganizationInvitation.invited_email == clean_email,
                OrganizationInvitation.status == 'PENDING'
            ).all()

            if not pending_invitations:
                return

            user = session.query(User).filter(User.id == user_id, User.deleted_at.is_(None)).first()
            if not user:
                return

            user_roles = list(user.roles) if user.roles else ["user"]

            for invitation in pending_invitations:
                # 1. Upsert OrganizationMember
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

                # 2. Mark invitation accepted
                invitation.status = 'ACCEPTED'
                invitation.accepted_at = datetime.now(timezone.utc)
                invitation.accepted_by_user_id = user.id

                # 3. Add workspace role to user profile
                org = session.query(Organization).filter_by(id=invitation.organization_id).first()
                if org:
                    target_role = "exhibitor" if (org.org_type or "").upper() == "EXHIBITOR" else "organizer"
                    if target_role not in user_roles:
                        user_roles.append(target_role)
                    user.active_role = target_role

            user.roles = user_roles
            session.commit()
        except Exception as e:
            session.rollback()
            print(f"[WARN] TenantService.auto_accept_pending_invitations_for_user error: {e}")
        finally:
            session.close()

    @staticmethod
    def resolve_tenant_context(user_id: Any, workspace_scope: Optional[str] = None) -> Dict[str, Any]:
        """
        Resolves whether user is an Organization Owner or Member for the specified scope (EXHIBITOR or ORGANIZER).
        Returns comprehensive tenant context including:
        - tenant_org_id: UUID string of the organization
        - tenant_owner_id: UUID string of the organization owner (the inviter)
        - is_owner: bool
        - is_team_member: bool
        - tenant_user_ids: list of UUIDs belonging to this organization (for scoped data queries)
        - role_name: name of assigned role
        - permissions: list of effective permission codes
        - inherited_profile: profile and KYC data inherited from the owner
        """
        clean_uid = str(user_id).strip() if user_id else ""
        if not clean_uid:
            return {
                "organization_id": None,
                "organization_name": None,
                "organization_owner_id": None,
                "is_owner": False,
                "is_team_member": False,
                "tenant_user_ids": [],
                "role_name": None,
                "permissions": [],
                "inherited_profile": None
            }

        session = db_session()
        try:
            scope_str = str(workspace_scope or "").upper()
            target_org_type = "EXHIBITOR" if "EXHIBITOR" in scope_str else ("ORGANIZER" if "ORGANIZER" in scope_str else None)

            # 1. Check if user is an Organization Owner
            owner_query = session.query(Organization).filter(
                Organization.owner_id == clean_uid,
                Organization.deleted_at.is_(None)
            )
            if target_org_type:
                owner_query = owner_query.filter(Organization.org_type == target_org_type)
            org_owned = owner_query.first()

            if org_owned:
                # Fetch all members of this organization to include in tenant_user_ids
                member_ids = session.query(OrganizationMember.user_id).filter(
                    OrganizationMember.organization_id == org_owned.id,
                    OrganizationMember.deleted_at.is_(None),
                    OrganizationMember.status == 'ACTIVE'
                ).all()
                all_uids = [org_owned.owner_id] + [m[0] for m in member_ids]

                return {
                    "organization_id": str(org_owned.id),
                    "organization_name": org_owned.name,
                    "organization_owner_id": str(org_owned.owner_id),
                    "is_owner": True,
                    "is_team_member": False,
                    "tenant_user_ids": all_uids,
                    "role_name": "Owner",
                    "permissions": ["*"],
                    "inherited_profile": None
                }

            # 2. Check if user is an active Organization Member
            member_query = session.query(OrganizationMember)\
                .join(Organization, OrganizationMember.organization_id == Organization.id)\
                .options(
                    joinedload(OrganizationMember.organization),
                    joinedload(OrganizationMember.role).joinedload(Role.role_permissions).joinedload(RolePermission.permission)
                )\
                .filter(
                    OrganizationMember.user_id == clean_uid,
                    OrganizationMember.deleted_at.is_(None),
                    OrganizationMember.status == 'ACTIVE',
                    Organization.deleted_at.is_(None)
                )

            if target_org_type:
                member_query = member_query.filter(Organization.org_type == target_org_type)

            membership = member_query.first()

            if membership and membership.organization:
                org = membership.organization
                owner_id = org.owner_id

                # Fetch all members of this organization
                member_ids = session.query(OrganizationMember.user_id).filter(
                    OrganizationMember.organization_id == org.id,
                    OrganizationMember.deleted_at.is_(None),
                    OrganizationMember.status == 'ACTIVE'
                ).all()
                all_uids = [owner_id] + [m[0] for m in member_ids]
                if clean_uid not in [str(u) for u in all_uids]:
                    all_uids.append(clean_uid)

                # Extract member permissions
                perms = []
                role_name = "Team Member"
                if membership.role:
                    role_name = membership.role.name
                    for rp in (membership.role.role_permissions or []):
                        if rp.permission and rp.permission.code:
                            perms.append(rp.permission.code)

                # Lookup parent owner's profile to inherit company name & verified KYC
                inherited_profile = {}
                from app.models.exhibitor_profile import ExhibitorProfile
                from app.models.organizer_profile import OrganizerProfile

                if (org.org_type or "").upper() == "EXHIBITOR":
                    owner_exh = session.query(ExhibitorProfile).filter_by(user_id=owner_id).first()
                    from app.utils.security_crypto import decrypt_field, mask_pan_number
                    if owner_exh:
                        inherited_profile = {
                            "company_name": owner_exh.company_name or org.name,
                            "kyc_status": owner_exh.kyc_status or "VERIFIED",
                            "vendor_category": getattr(owner_exh, "vendor_category", None),
                            "gstin": getattr(owner_exh, "gstin", None),
                            "pan_number": mask_pan_number(decrypt_field(getattr(owner_exh, "pan_number", None))),
                            "website_url": getattr(owner_exh, "website_url", None),
                            "city": getattr(owner_exh, "city", None),
                            "state": getattr(owner_exh, "state", None),
                            "is_inherited": True
                        }
                    else:
                        inherited_profile = {
                            "company_name": org.name,
                            "kyc_status": "VERIFIED",
                            "is_inherited": True
                        }
                else:
                    owner_org = session.query(OrganizerProfile).filter_by(user_id=owner_id).first()
                    if owner_org:
                        inherited_profile = {
                            "organization_name": owner_org.company_name or org.name,
                            "company_name": owner_org.company_name or org.name,
                            "kyc_status": owner_org.kyc_status or "VERIFIED",
                            "business_type": getattr(owner_org, "business_type", None),
                            "gstin": getattr(owner_org, "gstin", None),
                            "pan_number": mask_pan_number(decrypt_field(getattr(owner_org, "pan_number", None))),
                            "city": getattr(owner_org, "city", None),
                            "state": getattr(owner_org, "state", None),
                            "is_inherited": True
                        }
                    else:
                        inherited_profile = {
                            "organization_name": org.name,
                            "company_name": org.name,
                            "kyc_status": "VERIFIED",
                            "is_inherited": True
                        }

                return {
                    "organization_id": str(org.id),
                    "organization_name": org.name,
                    "organization_owner_id": str(owner_id),
                    "is_owner": False,
                    "is_team_member": True,
                    "tenant_user_ids": all_uids,
                    "role_name": role_name,
                    "permissions": perms,
                    "inherited_profile": inherited_profile
                }

            # 3. Standalone user (neither owner nor member)
            return {
                "organization_id": None,
                "organization_name": None,
                "organization_owner_id": clean_uid,
                "is_owner": True,
                "is_team_member": False,
                "tenant_user_ids": [clean_uid],
                "role_name": None,
                "permissions": ["*"],
                "inherited_profile": None
            }

        except Exception as e:
            print(f"[WARN] TenantService.resolve_tenant_context error: {e}")
            return {
                "organization_id": None,
                "organization_name": None,
                "organization_owner_id": clean_uid,
                "is_owner": True,
                "is_team_member": False,
                "tenant_user_ids": [clean_uid],
                "role_name": None,
                "permissions": ["*"],
                "inherited_profile": None
            }
        finally:
            session.close()

    @staticmethod
    def resolve_tenant_user_ids(user_id: Any, workspace_scope: Optional[str] = None) -> List[Any]:
        """
        Quick convenience helper returning the list of UUIDs belonging to the tenant.
        Ensures queries match both the parent inviter and any team member actions.
        """
        if not user_id:
            return []
        context = TenantService.resolve_tenant_context(user_id, workspace_scope)
        return context.get("tenant_user_ids") or [user_id]

    @staticmethod
    def get_pure_team_member_ids_subquery():
        """
        Returns a SQLAlchemy selectable subquery containing User IDs who are active team members
        in an organization owned by someone else, and who do NOT own any active organization themselves.
        Used to exclude invited staff/delegates from Super Admin KYC & Payout queues.
        """
        from app.models.organization import Organization, OrganizationMember
        from sqlalchemy import select

        owner_ids_subquery = select(Organization.owner_id).where(
            Organization.deleted_at.is_(None)
        )

        return select(OrganizationMember.user_id).join(
            Organization, OrganizationMember.organization_id == Organization.id
        ).where(
            OrganizationMember.deleted_at.is_(None),
            Organization.deleted_at.is_(None),
            OrganizationMember.status == 'ACTIVE',
            Organization.owner_id != OrganizationMember.user_id,
            ~OrganizationMember.user_id.in_(owner_ids_subquery)
        )

    @staticmethod
    def is_pure_team_member(user_id: Any) -> bool:
        """
        Checks if a specific user is solely an invited team member and not an organization owner.
        """
        if not user_id:
            return False
        from app.models.organization import Organization, OrganizationMember
        session = db_session()
        try:
            owns_any = session.query(Organization).filter(
                Organization.owner_id == user_id,
                Organization.deleted_at.is_(None)
            ).first() is not None
            if owns_any:
                return False

            is_member = session.query(OrganizationMember).join(Organization).filter(
                OrganizationMember.user_id == user_id,
                OrganizationMember.deleted_at.is_(None),
                OrganizationMember.status == 'ACTIVE',
                Organization.deleted_at.is_(None),
                Organization.owner_id != user_id
            ).first() is not None
            return is_member
        finally:
            session.close()
