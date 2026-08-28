from werkzeug.security import generate_password_hash, check_password_hash
from app.exceptions.api_error import ApiError
from app.modules.auth.repository.auth_repository import AuthRepository
from app.modules.auth.schemas.auth_schema import (
    RegisterSchema, LoginSchema, SendOTPSchema, VerifyOTPSchema, ResetPasswordSchema
)
from app.utils.jwt_utils import generate_access_token, generate_refresh_token, generate_token
from app.Services import otp_service

class AuthService:
    @staticmethod
    def register_user(raw_data: dict) -> dict:
        data = RegisterSchema(**raw_data)
        allowed_roles = ["organizer", "exhibitor", "user", "visitor", "superuser", "superadmin", "admin"]
        if data.role not in allowed_roles:
            raise ApiError("Invalid user role specified", 400)

        existing_user = AuthRepository.get_user_by_email(data.email)
        if existing_user:
            raise ApiError("This email address is already registered. If you already have an account, please Sign In instead.", 400)

        hashed_password = generate_password_hash(data.password)
        user = AuthRepository.create_user(data.name, data.email, hashed_password, data.role)
        access_token = generate_access_token(user.id, user.role)
        refresh_token = generate_refresh_token(user.id, user.role)
        return {
            "message": "User registered successfully",
            "token": access_token,
            "access_token": access_token,
            "refresh_token": refresh_token,
            "user": user.to_dict()
        }

    @staticmethod
    def register_organizer(raw_data: dict) -> dict:
        from app.modules.auth.schemas.auth_schema import OrganizerRegisterSchema
        data = OrganizerRegisterSchema(**raw_data)

        existing_user = AuthRepository.get_user_by_email(data.email)
        if existing_user:
            hashed_password = generate_password_hash(data.password) if data.password else ""
            user = AuthRepository.attach_organizer_profile(existing_user, data.dict(), hashed_password)
            access_token = generate_access_token(user.id, "organizer")
            refresh_token = generate_refresh_token(user.id, "organizer")

            return {
                "message": "Organizer profile updated successfully",
                "token": access_token,
                "access_token": access_token,
                "refresh_token": refresh_token,
                "user": AuthService.get_current_user(user.id)
            }

        hashed_password = generate_password_hash(data.password) if data.password else ""
        user = AuthRepository.create_organizer_user(data.dict(), hashed_password)
        access_token = generate_access_token(user.id, user.role)
        refresh_token = generate_refresh_token(user.id, user.role)

        try:
            from app.Services.mail_service import send_organizer_welcome_email
            send_organizer_welcome_email(data.email, data.name, data.company_name)
        except Exception as mail_err:
            print(f"[WARN] Organizer welcome mail trigger note: {mail_err}")

        return {
            "message": "Organizer account created successfully",
            "token": access_token,
            "access_token": access_token,
            "refresh_token": refresh_token,
            "user": AuthService.get_current_user(user.id)
        }

    @staticmethod
    def register_exhibitor(raw_data: dict) -> dict:
        from app.modules.auth.schemas.auth_schema import ExhibitorRegisterSchema
        data = ExhibitorRegisterSchema(**raw_data)

        existing_user = AuthRepository.get_user_by_email(data.email)
        if existing_user:
            hashed_password = generate_password_hash(data.password) if data.password else ""
            user = AuthRepository.attach_exhibitor_profile(existing_user, data.dict(), hashed_password)
            access_token = generate_access_token(user.id, "exhibitor")
            refresh_token = generate_refresh_token(user.id, "exhibitor")

            return {
                "message": "Exhibitor profile updated successfully",
                "token": access_token,
                "access_token": access_token,
                "refresh_token": refresh_token,
                "user": AuthService.get_current_user(user.id)
            }

        hashed_password = generate_password_hash(data.password) if data.password else ""
        user = AuthRepository.create_exhibitor_user(data.dict(), hashed_password)
        access_token = generate_access_token(user.id, user.role)
        refresh_token = generate_refresh_token(user.id, user.role)

        try:
            from app.Services.mail_service import send_exhibitor_welcome_email
            send_exhibitor_welcome_email(data.email, data.name, data.company_name, data.vendor_category)
        except Exception as mail_err:
            print(f"[WARN] Exhibitor welcome mail trigger note: {mail_err}")

        return {
            "message": "Exhibitor account created successfully",
            "token": access_token,
            "access_token": access_token,
            "refresh_token": refresh_token,
            "user": AuthService.get_current_user(user.id)
        }

    @staticmethod
    def login_user(raw_data: dict) -> dict:
        data = LoginSchema(**raw_data)
        user = AuthRepository.get_user_by_email(data.email)
        if not user:
            raise ApiError("Email address is not registered. Please register an account first.", 401)

        if not check_password_hash(user.password, data.password):
            raise ApiError("Invalid password", 401)

        access_token = generate_access_token(user.id, user.role)
        refresh_token = generate_refresh_token(user.id, user.role)
        user_dict = user.to_dict()
        return {
            "token": access_token,
            "access_token": access_token,
            "refresh_token": refresh_token,
            "user": user_dict,
            "message": "Login successful"
        }

    @staticmethod
    def get_current_user(user_id: int) -> dict:
        user = AuthRepository.get_user_by_id(user_id)
        if not user:
            raise ApiError("User not found", 404)
        
        user_dict = user.to_dict()

        # Attach Organizer Profile fields if present
        org_profile = AuthRepository.get_organizer_profile_by_user_id(user.id)
        if org_profile:
            org_data = org_profile.to_dict()
            for key, val in org_data.items():
                if key not in ["id", "user_id"] and val:
                    user_dict[key] = val

        # Attach Exhibitor Profile fields if present
        exh_profile = AuthRepository.get_exhibitor_profile_by_user_id(user.id)
        if exh_profile:
            exh_data = exh_profile.to_dict()
            for key, val in exh_data.items():
                if key not in ["id", "user_id"] and val:
                    user_dict[key] = val

        return user_dict

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
