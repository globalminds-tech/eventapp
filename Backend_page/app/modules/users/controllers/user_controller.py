from app.modules.users.services.user_service import UserService

class UserController:
    @staticmethod
    def get_profile(user_id: int):
        profile = UserService.get_profile(user_id)
        return {
            "success": True,
            "data": profile
        }

    @staticmethod
    def update_profile(user_id: int, raw_data: dict):
        profile = UserService.update_profile(user_id, raw_data)
        return {
            "success": True,
            "data": profile
        }

    @staticmethod
    def book_event(raw_data: dict):
        result = UserService.book_event(raw_data)
        return {
            "success": True,
            "data": result
        }

    @staticmethod
    def validate_qr(booking_id: int):
        result = UserService.validate_qr(booking_id)
        return {
            "success": True,
            "data": result
        }

    @staticmethod
    def get_my_bookings(email: str = None, user_id: int = None):
        bookings = UserService.get_my_bookings(email=email, user_id=user_id)
        return {
            "success": True,
            "data": bookings
        }
