import os
import datetime
import jwt

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", os.getenv("SECRET_KEY", "bookmyevent-production-grade-cryptographic-jwt-secret-key-v1-2026-secure"))
JWT_ALGORITHM = "HS256"

def generate_access_token(user_id, role: str = "user", roles: list[str] = None, expires_in_minutes: int = 60) -> str:
    """
    Generates a short-lived JWT Access Token for API requests.
    Default lifetime: 60 minutes for SPA dashboard convenience.
    """
    now = datetime.datetime.utcnow()
    user_roles = roles if roles else [role]
    active_role = role or (user_roles[0] if user_roles else "user")
    payload = {
        "user_id": str(user_id),
        "id": str(user_id),
        "active_role": active_role,
        "roles": user_roles,
        "type": "access",
        "iat": now,
        "exp": now + datetime.timedelta(minutes=expires_in_minutes)
    }
    return jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)

def generate_refresh_token(user_id, role: str = "user", roles: list[str] = None, expires_in_days: int = 7) -> str:
    """
    Generates a long-lived JWT Refresh Token stored in HttpOnly cookies.
    Default lifetime: 7 days.
    """
    now = datetime.datetime.utcnow()
    user_roles = roles if roles else [role]
    active_role = role or (user_roles[0] if user_roles else "user")
    payload = {
        "user_id": str(user_id),
        "id": str(user_id),
        "active_role": active_role,
        "roles": user_roles,
        "type": "refresh",
        "iat": now,
        "exp": now + datetime.timedelta(days=expires_in_days)
    }
    return jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)

def generate_token(user_id, role: str = "user", roles: list[str] = None, expires_in_hours: int = 24) -> str:
    """Backward compatible token generator helper."""
    return generate_access_token(user_id, role=role, roles=roles, expires_in_minutes=expires_in_hours * 60)

def decode_token(token: str) -> dict:
    """Decodes and validates JWT token signature and expiration."""
    return jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
