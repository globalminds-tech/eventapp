from typing import Optional, List
from pydantic import BaseModel, EmailStr


class CreateCustomRoleSchema(BaseModel):
    name: str
    description: Optional[str] = None
    permissions: List[str] = []


class UpdateCustomRoleSchema(BaseModel):
    name: str
    description: Optional[str] = None
    permissions: List[str] = []


class DeleteCustomRoleSchema(BaseModel):
    reassign_role_id: Optional[str] = None


class InviteTeamMemberSchema(BaseModel):
    email: EmailStr
    name: Optional[str] = None
    role_id: str


class AcceptInvitationSchema(BaseModel):
    token: str


class RegisterAndAcceptInvitationSchema(BaseModel):
    token: str
    password: str
    name: Optional[str] = None
    mobile: Optional[str] = None
