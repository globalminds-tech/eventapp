import os
import datetime
import jwt

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", os.getenv("SECRET_KEY", "super-secret-jwt-key-2026"))
JWT_ALGORITHM = "HS256"

def generate_access_token(user_id: int, role: str, expires_in_minutes: int = 60) -> str:
    """
    Generates a short-lived JWT Access Token for API requests.
    Default lifetime: 60 minutes for SPA dashboard convenience (or 15m in tight security mode).
    """
    now = datetime.datetime.utcnow()
    payload = {
        "user_id": user_id,
        "id": user_id,
        "role": role,
        "type": "access",
        "iat": now,
        "exp": now + datetime.timedelta(minutes=expires_in_minutes)
    }
    return jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)

def generate_refresh_token(user_id: int, role: str, expires_in_days: int = 7) -> str:
    """
    Generates a long-lived JWT Refresh Token stored in HttpOnly cookies.
    Default lifetime: 7 days.
    """
    now = datetime.datetime.utcnow()
    payload = {
        "user_id": user_id,
        "id": user_id,
        "role": role,
        "type": "refresh",
        "iat": now,
        "exp": now + datetime.timedelta(days=expires_in_days)
    }
    return jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)

def generate_token(user_id: int, role: str, expires_in_hours: int = 24) -> str:
    """Backward compatible token generator helper."""
    return generate_access_token(user_id, role, expires_in_minutes=expires_in_hours * 60)

def decode_token(token: str) -> dict:
    """Decodes and validates JWT token signature and expiration."""
    return jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
