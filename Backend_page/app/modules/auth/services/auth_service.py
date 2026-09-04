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
        disallowed_admin_roles = {"superuser", "superadmin", "admin"}
        if data.role.lower() in disallowed_admin_roles:
            raise ApiError("Administrative roles cannot be registered publicly.", 403)

        allowed_roles = ["organizer", "exhibitor", "user", "visitor"]
        if data.role not in allowed_roles:
            raise ApiError("Invalid user role specified", 400)

        existing_user = AuthRepository.get_user_by_email(data.email)
        if existing_user:
            raise ApiError("This email address is already registered. If you already have an account, please Sign In instead.", 400)

        hashed_password = generate_password_hash(data.password)
        user = AuthRepository.create_user(data.name, data.email, hashed_password, data.role)
        active_role = user.active_role or (user.roles[0] if user.roles else "user")
        access_token = generate_access_token(user.id, role=active_role, roles=user.roles)
        refresh_token = generate_refresh_token(user.id, role=active_role, roles=user.roles)
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
            raise ApiError("An account with this email address already exists. Please Sign In to your account.", 400)

        hashed_password = generate_password_hash(data.password) if data.password else ""
        user = AuthRepository.create_organizer_user(data.dict(), hashed_password)
        access_token = generate_access_token(user.id, role="organizer", roles=user.roles)
        refresh_token = generate_refresh_token(user.id, role="organizer", roles=user.roles)

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
    def upgrade_organizer_step1(user_id, raw_data: dict) -> dict:
        user = AuthRepository.get_user_by_id(user_id)
        if not user:
            raise ApiError("User not found", 404)
        if any(r in ["superuser", "superadmin", "admin"] for r in (user.roles or [])):
            raise ApiError("Super administrators cannot register or upgrade as an organizer.", 403)
        user = AuthRepository.save_organizer_step1(user, raw_data)
        return {
            "message": "Organizer KYC Step 1 saved successfully",
            "user": AuthService.get_current_user(user.id)
        }

    @staticmethod
    def upgrade_organizer(user_id, raw_data: dict) -> dict:
        user = AuthRepository.get_user_by_id(user_id)
        if not user:
            raise ApiError("User not found", 404)
        if any(r in ["superuser", "superadmin", "admin"] for r in (user.roles or [])):
            raise ApiError("Super administrators cannot register or upgrade as an organizer.", 403)
        
        user = AuthRepository.attach_organizer_profile(user, raw_data)
        access_token = generate_access_token(user.id, "organizer")
        refresh_token = generate_refresh_token(user.id, "organizer")

        return {
            "message": "Organizer profile attached successfully",
            "token": access_token,
            "access_token": access_token,
            "refresh_token": refresh_token,
            "user": AuthService.get_current_user(user.id)
        }

    @staticmethod
    def upgrade_exhibitor_step1(user_id, raw_data: dict) -> dict:
        user = AuthRepository.get_user_by_id(user_id)
        if not user:
            raise ApiError("User not found", 404)
        if any(r in ["superuser", "superadmin", "admin"] for r in (user.roles or [])):
            raise ApiError("Super administrators cannot register or upgrade as an exhibitor.", 403)
        user = AuthRepository.save_exhibitor_step1(user, raw_data)
        return {
            "message": "Exhibitor KYC Step 1 saved successfully",
            "user": AuthService.get_current_user(user.id)
        }

    @staticmethod
    def register_exhibitor(raw_data: dict) -> dict:
        from app.modules.auth.schemas.auth_schema import ExhibitorRegisterSchema
        data = ExhibitorRegisterSchema(**raw_data)

        existing_user = AuthRepository.get_user_by_email(data.email)
        if existing_user:
            raise ApiError("An account with this email address already exists. Please Sign In to your account.", 400)

        hashed_password = generate_password_hash(data.password) if data.password else ""
        user = AuthRepository.create_exhibitor_user(data.dict(), hashed_password)
        access_token = generate_access_token(user.id, role="exhibitor", roles=user.roles)
        refresh_token = generate_refresh_token(user.id, role="exhibitor", roles=user.roles)

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
    def upgrade_exhibitor(user_id, raw_data: dict) -> dict:
        user = AuthRepository.get_user_by_id(user_id)
        if not user:
            raise ApiError("User not found", 404)
        if any(r in ["superuser", "superadmin", "admin"] for r in (user.roles or [])):
            raise ApiError("Super administrators cannot register or upgrade as an exhibitor.", 403)
        
        user = AuthRepository.attach_exhibitor_profile(user, raw_data)
        access_token = generate_access_token(user.id, "exhibitor")
        refresh_token = generate_refresh_token(user.id, "exhibitor")

        return {
            "message": "Exhibitor profile attached successfully",
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

        user_full = AuthService.get_current_user(user.id)
        all_roles = user_full.get("roles") or ["user"]
        active_role = user_full.get("active_role") or (all_roles[0] if all_roles else "user")

        # Security Guard: Only the genuine designated email can log in with superadmin privileges
        is_super = any(r in ["superuser", "superadmin", "admin"] for r in all_roles) or user.active_role in ["superuser", "superadmin", "admin"]
        if is_super and user.email.lower() != "bookmyevent2026@gmail.com":
            raise ApiError("Unauthorized administrative access.", 403)

        access_token = generate_access_token(user.id, role=active_role, roles=all_roles)
        refresh_token = generate_refresh_token(user.id, role=active_role, roles=all_roles)
        return {
            "token": access_token,
            "access_token": access_token,
            "refresh_token": refresh_token,
            "user": user_full,
            "message": "Login successful"
        }

    @staticmethod
    def get_current_user(user_id) -> dict:
        user = AuthRepository.get_user_by_id(user_id)
        if not user:
            raise ApiError("User not found", 404)
        
        user_dict = user.to_dict()

        roles = list(user.roles) if user.roles else ["user"]
        is_admin_user = any(r in ["superuser", "superadmin", "admin"] for r in roles) or user.active_role in ["superuser", "superadmin", "admin"]

        # Super administrators are strictly isolated to platform administration
        if is_admin_user:
            user_dict["roles"] = ["superadmin"]
            user_dict["active_role"] = "superadmin"
            user_dict["profiles"] = {
                "organizer": None,
                "exhibitor": None,
            }
            return user_dict

        org_profile = AuthRepository.get_organizer_profile_by_user_id(user.id)
        exh_profile = AuthRepository.get_exhibitor_profile_by_user_id(user.id)

        if org_profile and org_profile.kyc_status in ["VERIFIED", "IN_PROGRESS"]:
            if "organizer" not in roles:
                roles.append("organizer")
        if exh_profile and exh_profile.kyc_status in ["VERIFIED", "IN_PROGRESS"]:
            if "exhibitor" not in roles:
                roles.append("exhibitor")

        # Sync back to DB if new profile roles were discovered
        if set(roles) != set(user.roles or []):
            user.roles = roles
            from app.extensions.database import db
            db.session.commit()

        active_role = user.active_role or (roles[0] if roles else "user")
        user_dict["roles"] = roles
        user_dict["active_role"] = active_role
        user_dict["profiles"] = {
            "organizer": org_profile.to_dict() if org_profile else None,
            "exhibitor": exh_profile.to_dict() if exh_profile else None,
        }

        # Attach prefilled shared KYC fields for upgrade convenience
        shared_kyc = AuthRepository.get_shared_kyc_data(user.id)
        user_dict["shared_kyc"] = shared_kyc

        # Backward compatible flat field overlays
        if org_profile:
            org_data = org_profile.to_dict()
            for key, val in org_data.items():
                if key not in ["id", "user_id"] and val and not user_dict.get(key):
                    user_dict[key] = val

        if exh_profile:
            exh_data = exh_profile.to_dict()
            for key, val in exh_data.items():
                if key not in ["id", "user_id"] and val and not user_dict.get(key):
                    user_dict[key] = val

        has_bank = bool(user_dict.get("bank_name") and user_dict.get("account_number"))
        user_dict["onboarding_completed"] = has_bank

        return user_dict

    @staticmethod
    def switch_active_role(user_id, target_role: str) -> dict:
        user = AuthRepository.get_user_by_id(user_id)
        if not user:
            raise ApiError("User not found", 404)
        
        user_full = AuthService.get_current_user(user_id)
        allowed_roles = [r.lower() for r in (user_full.get("roles") or ["user"])]
        is_super = any(r in ["superuser", "superadmin", "admin"] for r in allowed_roles)

        target_role_clean = target_role.strip().lower()

        # Super administrators are platform governors and cannot switch into attendee, organizer, or exhibitor roles
        if is_super and target_role_clean not in ["superuser", "superadmin", "admin"]:
            raise ApiError("Super administrators cannot switch into attendee, organizer, or exhibitor portals.", 403)

        # Non-admins cannot switch to administrative roles
        if target_role_clean in ["superuser", "superadmin", "admin"] and not is_super:
            raise ApiError("Unauthorized: You do not possess administrative privileges.", 403)

        if target_role_clean not in allowed_roles:
            raise ApiError(f"You do not possess the '{target_role}' role yet. Please onboard first.", 403)
        
        user.active_role = target_role_clean
        from app.extensions.database import db
        db.session.commit()

        new_access_token = generate_access_token(user.id, role=target_role_clean, roles=allowed_roles)
        user_full["active_role"] = target_role_clean

        return {
            "token": new_access_token,
            "access_token": new_access_token,
            "active_role": target_role_clean,
            "user": user_full,
            "message": f"Switched to {target_role_clean} workspace successfully"
        }

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
