import os
import jwt
from fastapi import Depends, HTTPException, Security, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.utils.jwt_utils import JWT_SECRET_KEY, JWT_ALGORITHM

security = HTTPBearer(auto_error=False)

def get_current_user(credentials: HTTPAuthorizationCredentials = Security(security)) -> dict:
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication bearer token missing",
            headers={"WWW-Authenticate": "Bearer"}
        )
    token = credentials.credentials
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("user_id") or payload.get("id") or payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload: missing user identifier",
                headers={"WWW-Authenticate": "Bearer"}
            )
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token has expired",
            headers={"WWW-Authenticate": "Bearer"}
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
            headers={"WWW-Authenticate": "Bearer"}
        )

def require_roles(allowed_roles: list[str]):
    def role_checker(current_user: dict = Depends(get_current_user)) -> dict:
        user_roles = list(current_user.get("roles") or [])
        primary_role = current_user.get("role") or current_user.get("user_role")
        if primary_role and primary_role not in user_roles:
            user_roles.append(primary_role)

        clean_allowed = [r.lower() for r in allowed_roles]
        clean_user_roles = [str(r).lower() for r in user_roles]

        # Superuser and admin always have universal governance access
        if any(admin_role in clean_user_roles for admin_role in ["superuser", "superadmin", "admin"]):
            return current_user

        if clean_allowed and not any(r in clean_user_roles for r in clean_allowed):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: insufficient permissions"
            )
        return current_user
    return role_checker


def require_permission(permission_code: str):
    """
    Fine-grained permission dependency checking User -> Organization -> Role -> Permissions.
    Superusers bypass automatically.
    """
    def permission_checker(
        current_user: dict = Depends(get_current_user),
    ) -> dict:
        user_roles = [str(r).lower() for r in (current_user.get("roles") or [current_user.get("role")])]
        # Superuser and admin universal override
        if any(admin_role in user_roles for admin_role in ["superuser", "superadmin", "admin"]):
            return current_user

        user_id = current_user.get("user_id") or current_user.get("id")
        from app.modules.rbac.services.rbac_service import RBACService
        effective_perms = RBACService.get_user_permissions(user_id)
        if permission_code not in effective_perms and "*" not in effective_perms:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied: Missing required permission '{permission_code}'"
            )
        return current_user
    return permission_checker

