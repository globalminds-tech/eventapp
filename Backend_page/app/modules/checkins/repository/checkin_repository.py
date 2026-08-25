from datetime import datetime
from app.extensions.database import db
from app.models.booking import UserBookingDetails

class CheckinRepository:
    @staticmethod
    def mark_scanned(booking_id: int):
        booking = db.session.get(UserBookingDetails, booking_id)
        if not booking:
            return False, None
        if booking.is_scanned:
            return False, booking
        booking.is_scanned = True
        booking.scanned_at = datetime.utcnow()
        db.session.commit()
        return True, booking
