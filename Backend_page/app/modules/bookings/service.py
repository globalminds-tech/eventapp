from app.modules.bookings.repository import BookingRepository

class BookingService:
    @staticmethod
    def get_user_bookings(email: str):
        bookings = BookingRepository.get_user_bookings(email)
        return {"status": True, "data": [b.id for b in bookings]}
