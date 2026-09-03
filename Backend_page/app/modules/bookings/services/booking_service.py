from app.exceptions.api_error import ApiError
from app.modules.bookings.repository.booking_repository import BookingRepository

class BookingService:
    @staticmethod
    def get_user_bookings(email: str) -> list[dict]:
        bookings = BookingRepository.get_user_bookings(email)
        return [b.to_dict() if hasattr(b, "to_dict") else {"id": str(b.id), "event_id": str(b.event_id) if b.event_id else None, "name": b.name, "email": b.email} for b in bookings]

    @staticmethod
    def get_booking(booking_id) -> dict:
        booking = BookingRepository.get_by_id(booking_id)
        if not booking:
            raise ApiError("Booking not found", 404)
        return booking.to_dict() if hasattr(booking, "to_dict") else {"id": str(booking.id), "event_id": str(booking.event_id) if booking.event_id else None, "name": booking.name}
