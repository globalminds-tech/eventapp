from app.modules.bookings.services.booking_service import BookingService

class BookingController:
    @staticmethod
    def get_my_bookings(email: str):
        if not email:
            return {"success": False, "message": "Email is required"}
        bookings = BookingService.get_user_bookings(email)
        return {
            "success": True,
            "data": bookings
        }

    @staticmethod
    def get_booking(booking_id: int):
        booking = BookingService.get_booking(booking_id)
        return {
            "success": True,
            "data": booking
        }
