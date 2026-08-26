from app.modules.auth.services.auth_service import AuthService

class AuthController:
    @staticmethod
    def register(raw_data: dict):
        result = AuthService.register_user(raw_data)
        return {
            "success": True,
            "data": result
        }

    @staticmethod
    def register_organizer(raw_data: dict):
        result = AuthService.register_organizer(raw_data)
        return {
            "success": True,
            "data": result
        }

    @staticmethod
    def register_exhibitor(raw_data: dict):
        result = AuthService.register_exhibitor(raw_data)
        return {
            "success": True,
            "data": result
        }

    @staticmethod
    def login(raw_data: dict):
        result = AuthService.login_user(raw_data)
        return {
            "success": True,
            "data": result
        }

    @staticmethod
    def me(user_id: int):
        user_data = AuthService.get_current_user(user_id)
        return {
            "success": True,
            "data": user_data
        }

    @staticmethod
    def send_otp(raw_data: dict):
        result = AuthService.send_otp(raw_data)
        return {
            "success": True,
            "data": result
        }

    @staticmethod
    def resend_otp(raw_data: dict):
        result = AuthService.resend_otp(raw_data)
        return {
            "success": True,
            "data": result
        }

    @staticmethod
    def verify_otp(raw_data: dict):
        result = AuthService.verify_otp(raw_data)
        return {
            "success": True,
            "data": result
        }

    @staticmethod
    def reset_password(raw_data: dict):
        result = AuthService.reset_password(raw_data)
        return {
            "success": True,
            "data": result
        }
