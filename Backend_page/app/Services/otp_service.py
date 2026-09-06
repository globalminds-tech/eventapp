import random
import time
import logging
from app.Services.mail_service import send_otp_email, send_otp_email_reset
from app.extensions.redis import redis_client

logger = logging.getLogger("otp_service")

# In-memory fallback stores
otp_store = {}
verified_users = set()

OTP_EXPIRATION_SECONDS = 300  # 5 minutes
VERIFIED_STATE_SECONDS = 600  # 10 minutes


def generate_otp():
    return str(random.randint(100000, 999999))


def _set_otp_cache(email: str, otp: str):
    email = email.lower().strip()
    expiration = time.time() + OTP_EXPIRATION_SECONDS
    # In-memory fallback
    otp_store[email] = (otp, expiration)

    # Redis distributed store
    if redis_client and redis_client.client:
        try:
            redis_client.set_json(f"otp:{email}", {"otp": otp, "expires_at": expiration}, expire_seconds=OTP_EXPIRATION_SECONDS)
        except Exception as err:
            logger.warning(f"Failed to store OTP in Redis ({err}), memory fallback active.")


def _get_otp_cache(email: str):
    email = email.lower().strip()
    # Try Redis first
    if redis_client and redis_client.client:
        try:
            cached = redis_client.get_json(f"otp:{email}")
            if cached and isinstance(cached, dict):
                return cached.get("otp"), cached.get("expires_at")
        except Exception as err:
            logger.warning(f"Redis get OTP failed ({err}), falling back to memory.")

    # Fallback to in-memory store
    return otp_store.get(email, (None, None))


def _delete_otp_cache(email: str):
    email = email.lower().strip()
    otp_store.pop(email, None)
    if redis_client and redis_client.client:
        try:
            redis_client.delete(f"otp:{email}")
        except Exception:
            pass


def send_otp(email):
    email = email.lower().strip()
    otp = generate_otp()
    _set_otp_cache(email, otp)
    send_otp_email(email, otp)
    return True


def send_reset_otp(email):
    email = email.lower().strip()
    otp = generate_otp()
    _set_otp_cache(email, otp)
    send_otp_email_reset(email, otp)
    return True


def resend_otp(email):
    return send_otp(email)


def resend_reset_otp(email):
    return send_reset_otp(email)


def verify_otp(email, user_otp):
    email = email.lower().strip()
    stored_otp, expiration = _get_otp_cache(email)

    if not stored_otp:
        return {"status": False, "message": "No OTP found"}

    if expiration and time.time() > expiration:
        _delete_otp_cache(email)
        return {"status": False, "message": "OTP expired"}

    # Case-insensitive / whitespace-stripped comparison
    if str(user_otp).strip() != str(stored_otp).strip():
        return {"status": False, "message": "Invalid OTP"}

    # Verified successfully
    verified_users.add(email)
    if redis_client and redis_client.client:
        try:
            redis_client.set_json(f"otp_verified:{email}", True, expire_seconds=VERIFIED_STATE_SECONDS)
        except Exception:
            pass

    _delete_otp_cache(email)
    return {"status": True, "message": "OTP verified"}


def is_verified(email):
    email = email.lower().strip()
    if redis_client and redis_client.client:
        try:
            if redis_client.get_json(f"otp_verified:{email}"):
                return True
        except Exception:
            pass

    return email in verified_users


def clear_verified(email):
    email = email.lower().strip()
    verified_users.discard(email)
    if redis_client and redis_client.client:
        try:
            redis_client.delete(f"otp_verified:{email}")
        except Exception:
            pass