from typing import Optional
from fastapi import APIRouter, Depends, Header, Query
from app.middleware.auth import get_current_user, require_roles
from app.modules.rbac.controllers.rbac_controller import RBACController
from app.modules.rbac.schemas.rbac_schemas import (
    CreateCustomRoleSchema,
    UpdateCustomRoleSchema,
    DeleteCustomRoleSchema,
    InviteTeamMemberSchema,
    AcceptInvitationSchema,
    RegisterAndAcceptInvitationSchema
)

rbac_router = APIRouter(prefix="/api/v1/rbac", tags=["Role-Based Access Control"])


# --- Permissions & Roles ---

@rbac_router.get("/permissions")
def get_permissions():
    """Retrieve all available platform permissions grouped by module."""
    return RBACController.get_permissions()


@rbac_router.get("/roles")
def get_roles(
    current_user: dict = Depends(get_current_user),
    x_organization_id: Optional[str] = Header(None, alias="X-Organization-Id")
):
    """Retrieve all system roles and tenant-scoped custom roles."""
    return RBACController.get_roles(current_user, x_organization_id)


@rbac_router.post("/roles")
def create_custom_role(
    payload: CreateCustomRoleSchema,
    current_user: dict = Depends(get_current_user),
    x_organization_id: Optional[str] = Header(None, alias="X-Organization-Id")
):
    """Create a new custom role within the active organization."""
    return RBACController.create_custom_role(payload.dict(), current_user, x_organization_id)


@rbac_router.put("/roles/{role_id}")
def update_custom_role(
    role_id: str,
    payload: UpdateCustomRoleSchema,
    current_user: dict = Depends(get_current_user),
    x_organization_id: Optional[str] = Header(None, alias="X-Organization-Id")
):
    """Update a custom role's permissions or details."""
    return RBACController.update_custom_role(role_id, payload.dict(), current_user, x_organization_id)


@rbac_router.delete("/roles/{role_id}")
def delete_custom_role(
    role_id: str,
    payload: DeleteCustomRoleSchema,
    current_user: dict = Depends(get_current_user),
    x_organization_id: Optional[str] = Header(None, alias="X-Organization-Id")
):
    """Delete a custom role. Requires reassign_role_id if members are assigned."""
    return RBACController.delete_custom_role(role_id, payload.dict(), current_user, x_organization_id)


# --- Team Members & Invitations ---

@rbac_router.get("/team/members")
def get_team_members(
    current_user: dict = Depends(get_current_user),
    x_organization_id: Optional[str] = Header(None, alias="X-Organization-Id")
):
    """List all active and invited members of the organization."""
    return RBACController.get_team_members(current_user, x_organization_id)


@rbac_router.post("/team/invite")
def invite_team_member(
    payload: InviteTeamMemberSchema,
    current_user: dict = Depends(get_current_user),
    x_organization_id: Optional[str] = Header(None, alias="X-Organization-Id")
):
    """Send a secure email invitation to join the organization."""
    return RBACController.invite_team_member(payload.dict(), current_user, x_organization_id)


@rbac_router.delete("/team/members/{member_id}")
def remove_team_member(
    member_id: str,
    current_user: dict = Depends(get_current_user),
    x_organization_id: Optional[str] = Header(None, alias="X-Organization-Id")
):
    """Remove or deactivate a team member from the organization."""
    return RBACController.remove_member(member_id, current_user, x_organization_id)


# --- Public Invitation Acceptance Workflow ---

@rbac_router.get("/invitations/verify")
def verify_invitation(token: str = Query(..., description="Invitation token from email")):
    """Verify an invitation token before accepting or registering."""
    return RBACController.verify_invitation(token)


@rbac_router.post("/invitations/accept")
def accept_invitation(
    payload: AcceptInvitationSchema,
    current_user: dict = Depends(get_current_user)
):
    """Accept an invitation for an already authenticated user."""
    return RBACController.accept_invitation(payload.dict(), current_user)


@rbac_router.post("/invitations/register-and-accept")
def register_and_accept(payload: RegisterAndAcceptInvitationSchema):
    """Register a new user account and accept invitation in one step."""
    return RBACController.register_and_accept(payload.dict())


# --- Current User Effective Permissions ---

@rbac_router.get("/me/permissions")
def get_my_permissions(
    current_user: dict = Depends(get_current_user),
    x_organization_id: Optional[str] = Header(None, alias="X-Organization-Id")
):
    """Fetch all effective permission codes for current user in active workspace."""
    return RBACController.get_my_permissions(current_user, x_organization_id)
