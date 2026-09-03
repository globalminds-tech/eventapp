import re
from typing import Optional, List, Dict, Any
from app.modules.rbac.repository.rbac_repository import RBACRepository
from app.Services.mail_service import send_team_invitation_email
from app.extensions.database import db_session
from app.models.organization import Organization


class RBACService:

    @staticmethod
    def get_permissions() -> List[Dict[str, Any]]:
        return RBACRepository.get_all_permissions()

    @staticmethod
    def get_roles(organization_id: Optional[str] = None) -> List[Dict[str, Any]]:
        return RBACRepository.get_roles_for_tenant(organization_id)

    @staticmethod
    def create_custom_role(
        organization_id: str,
        name: str,
        description: str,
        permission_codes: List[str],
        created_by: str
    ) -> Dict[str, Any]:
        if not name or not name.strip():
            raise ValueError("Role name is required.")
        
        # Generate clean code from name
        clean_code = re.sub(r'[^a-zA-Z0-9]+', '_', name.lower()).strip('_')
        return RBACRepository.create_custom_role(
            organization_id=organization_id,
            name=name.strip(),
            code=clean_code,
            description=description,
            permission_codes=permission_codes,
            created_by=created_by
        )

    @staticmethod
    def update_custom_role(
        role_id: str,
        organization_id: str,
        name: str,
        description: str,
        permission_codes: List[str],
        updated_by: str
    ) -> Dict[str, Any]:
        if not name or not name.strip():
            raise ValueError("Role name is required.")
        return RBACRepository.update_custom_role(
            role_id=role_id,
            organization_id=organization_id,
            name=name.strip(),
            description=description,
            permission_codes=permission_codes,
            updated_by=updated_by
        )

    @staticmethod
    def delete_custom_role(
        role_id: str,
        organization_id: str,
        reassign_role_id: Optional[str],
        deleted_by: str
    ) -> bool:
        return RBACRepository.delete_custom_role(
            role_id=role_id,
            organization_id=organization_id,
            reassign_role_id=reassign_role_id,
            deleted_by=deleted_by
        )

    @staticmethod
    def get_team_members(organization_id: str) -> List[Dict[str, Any]]:
        return RBACRepository.get_organization_members(organization_id)

    @staticmethod
    def invite_team_member(
        organization_id: str,
        role_id: str,
        email: str,
        name: str,
        invited_by: str
    ) -> Dict[str, Any]:
        if not email or "@" not in email:
            raise ValueError("A valid email address is required.")
        
        invite_data = RBACRepository.create_invitation(
            organization_id=organization_id,
            role_id=role_id,
            email=email.strip().lower(),
            name=name.strip() if name else "",
            invited_by=invited_by
        )

        # Retrieve organization and role name for email
        session = db_session()
        try:
            org = session.query(Organization).filter_by(id=organization_id).first()
            org_name = org.name if org else "Organization"
        finally:
            session.close()

        role_name = invite_data.get("role_name") or "Team Member"
        raw_token = invite_data.get("raw_token")

        # Dispatch async/background email safely
        try:
            send_team_invitation_email(
                email=email.strip().lower(),
                name=name.strip() if name else "Team Member",
                org_name=org_name,
                role_name=role_name,
                raw_token=raw_token
            )
        except Exception as err:
            print(f"[WARN] Failed to send team invitation email: {err}")

        return {
            "id": invite_data["id"],
            "email": invite_data["invited_email"],
            "name": invite_data["invited_name"],
            "role_name": role_name,
            "status": invite_data["status"],
            "expires_at": invite_data["expires_at"],
            "invite_link": f"http://localhost:5173/accept-invite?token={raw_token}"
        }

    @staticmethod
    def verify_invitation(token: str) -> Dict[str, Any]:
        if not token or not token.strip():
            raise ValueError("Invitation token is required.")
        return RBACRepository.verify_invitation(token.strip())

    @staticmethod
    def accept_invitation(token: str, user_id: str) -> Dict[str, Any]:
        if not token or not user_id:
            raise ValueError("Token and user identifier are required.")
        return RBACRepository.accept_invitation(token.strip(), user_id)

    @staticmethod
    def remove_member(organization_id: str, member_id: str, deleted_by: str) -> bool:
        return RBACRepository.remove_member(
            organization_id=organization_id,
            member_id=member_id,
            deleted_by=deleted_by
        )

    @staticmethod
    def get_user_permissions(user_id: str, organization_id: Optional[str] = None) -> List[str]:
        return RBACRepository.get_user_effective_permissions(user_id, organization_id)
