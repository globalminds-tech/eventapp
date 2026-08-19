import jwt
from werkzeug.security import generate_password_hash, check_password_hash
from flask import current_app
from app.modules.auth.repository import AuthRepository
from app.Services import otp_service

class AuthService:
    @staticmethod
    def register_user(name: str, email: str, password: str, role: str):
        allowed_roles = ["organizer", "exhibitor", "visitor", "superuser"]
        if role not in allowed_roles:
            return {"status": False, "message": "Invalid role", "code": 400}

        existing_user = AuthRepository.get_user_by_email(email)
        if existing_user:
            return {"status": False, "message": "Email already registered", "code": 400}

        hashed_password = generate_password_hash(password)
        user = AuthRepository.create_user(name, email, hashed_password, role)
        return {"status": True, "message": "User registered successfully", "code": 200, "user_id": user.id}

    @staticmethod
    def login_user(email: str, password: str):
        email_clean = email.strip().lower()
        if not email_clean or not password:
            return {"status": False, "message": "Email and password required", "code": 400}

        user = AuthRepository.get_user_by_email(email_clean)
        if not user:
            return {"status": False, "message": "Email Id is not registered", "code": 401}

        if not check_password_hash(user.password, password):
            return {"status": False, "message": "Invalid password", "code": 401}

        secret = current_app.config.get('JWT_SECRET_KEY') or current_app.config.get('SECRET_KEY')
        token = jwt.encode(
            {
                "user_id": user.id,
                "role": user.role,
                "email": user.email
            },
            secret,
            algorithm="HS256"
        )

        return {
            "status": True,
            "code": 200,
            "data": {
                "message": "Login successful",
                "token": token,
                "name": user.name,
                "email": user.email,
                "role": user.role,
                "User_id": user.id,
                "profile_image": user.profile_image
            }
        }

    @staticmethod
    def send_otp(email: str):
        if not email:
            return {"status": False, "message": "Email required", "code": 400}
        otp_service.send_otp(email)
        return {"status": True, "message": "OTP sent", "code": 200}

    @staticmethod
    def resend_otp(email: str):
        if not email:
            return {"status": False, "message": "Email required", "code": 400}
        otp_service.resend_otp(email)
        return {"status": True, "message": "OTP resent", "code": 200}

    @staticmethod
    def verify_otp(email: str, otp: str):
        result = otp_service.verify_otp(email, otp)
        if result.get("status"):
            return {"status": True, "message": "Verified", "code": 200}
        return {"status": False, "error": result.get("message"), "code": 400}

    @staticmethod
    def reset_password(email: str, password: str):
        if not email or not password:
            return {"status": False, "message": "Email & password required", "code": 400}

        user = AuthRepository.get_user_by_email(email)
        if not user:
            return {"status": False, "message": "User not found", "code": 404}

        if not otp_service.is_verified(email):
            return {"status": False, "message": "OTP not verified", "code": 400}

        hashed_password = generate_password_hash(password)
        AuthRepository.update_password(email, hashed_password)
        otp_service.clear_verified(email)
        return {"status": True, "message": "Password updated successfully", "code": 200}
