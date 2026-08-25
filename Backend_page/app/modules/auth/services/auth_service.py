from werkzeug.security import generate_password_hash, check_password_hash
from app.exceptions.api_error import ApiError
from app.modules.auth.repository.auth_repository import AuthRepository
from app.modules.auth.schemas.auth_schema import (
    RegisterSchema, LoginSchema, SendOTPSchema, VerifyOTPSchema, ResetPasswordSchema
)
from app.utils.jwt_utils import generate_token
from app.Services import otp_service

class AuthService:
    @staticmethod
    def register_user(raw_data: dict) -> dict:
        data = RegisterSchema(**raw_data)
        allowed_roles = ["organizer", "exhibitor", "visitor", "superuser", "admin"]
        if data.role not in allowed_roles:
            raise ApiError("Invalid user role specified", 400)

        existing_user = AuthRepository.get_user_by_email(data.email)
        if existing_user:
            raise ApiError("Email already registered", 400)

        hashed_password = generate_password_hash(data.password)
        user = AuthRepository.create_user(data.name, data.email, hashed_password, data.role)
        token = generate_token(user.id, user.role)
        return {
            "message": "User registered successfully",
            "token": token,
            "user": user.to_dict()
        }

    @staticmethod
    def login_user(raw_data: dict) -> dict:
        data = LoginSchema(**raw_data)
        user = AuthRepository.get_user_by_email(data.email)
        if not user:
            raise ApiError("Email address is not registered", 401)

        if not check_password_hash(user.password, data.password):
            raise ApiError("Invalid password", 401)

        token = generate_token(user.id, user.role)
        user_dict = user.to_dict()
        return {
            "token": token,
            "user": user_dict,
            "message": "Login successful"
        }

    @staticmethod
    def get_current_user(user_id: int) -> dict:
        user = AuthRepository.get_user_by_id(user_id)
        if not user:
            raise ApiError("User not found", 404)
        return user.to_dict()

    @staticmethod
    def send_otp(raw_data: dict) -> dict:
        data = SendOTPSchema(**raw_data)
        otp_service.send_otp(data.email)
        return {"message": "OTP sent successfully"}

    @staticmethod
    def resend_otp(raw_data: dict) -> dict:
        data = SendOTPSchema(**raw_data)
        otp_service.resend_otp(data.email)
        return {"message": "OTP resent successfully"}

    @staticmethod
    def verify_otp(raw_data: dict) -> dict:
        data = VerifyOTPSchema(**raw_data)
        result = otp_service.verify_otp(data.email, data.otp)
        if not result.get("status"):
            raise ApiError(result.get("message", "Invalid OTP"), 400)
        return {"message": "OTP verified successfully"}

    @staticmethod
    def reset_password(raw_data: dict) -> dict:
        data = ResetPasswordSchema(**raw_data)
        user = AuthRepository.get_user_by_email(data.email)
        if not user:
            raise ApiError("User not found", 404)

        if not otp_service.is_verified(data.email):
            raise ApiError("OTP not verified for this email", 400)

        hashed_password = generate_password_hash(data.password)
        AuthRepository.update_password(data.email, hashed_password)
        otp_service.clear_verified(data.email)
        return {"message": "Password updated successfully"}
