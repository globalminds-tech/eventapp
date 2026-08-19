from datetime import datetime
from app.extensions.database import db
from app.models.booking import UserBookingDetails

class CheckinRepository:
    @staticmethod
    def get_booking(booking_id: int):
        return db.session.get(UserBookingDetails, booking_id)

    @staticmethod
    def mark_scanned(booking_id: int):
        booking = db.session.get(UserBookingDetails, booking_id)
        if booking and not booking.is_scanned:
            booking.is_scanned = True
            booking.scanned_at = datetime.utcnow()
            db.session.commit()
            return True, booking
        return False, booking
