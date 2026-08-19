from datetime import datetime
from sqlalchemy import select
from app.extensions.database import db
from app.models.event import EventDetails
from app.models.booking import UserBookingDetails

class UserRepository:
    @staticmethod
    def get_event_by_id(event_id: int):
        return db.session.get(EventDetails, event_id)

    @staticmethod
    def create_booking(event_id: int, name: str, email: str, phone: str, food_preference: str, qr_data: str = "PENDING"):
        booking = UserBookingDetails(
            event_id=event_id,
            name=name,
            email=email.strip().lower(),
            phone=phone,
            food_preference=food_preference,
            qr_data=qr_data,
            is_scanned=False
        )
        db.session.add(booking)
        db.session.commit()
        return booking

    @staticmethod
    def update_qr_data(booking_id: int, qr_text: str):
        booking = db.session.get(UserBookingDetails, booking_id)
        if booking:
            booking.qr_data = qr_text
            db.session.commit()
            return booking
        return None

    @staticmethod
    def get_booking_with_event(booking_id: int):
        stmt = select(UserBookingDetails, EventDetails).join(
            EventDetails, UserBookingDetails.event_id == EventDetails.id
        ).where(UserBookingDetails.id == booking_id)
        return db.session.execute(stmt).first()

    @staticmethod
    def mark_booking_scanned(booking_id: int):
        booking = db.session.get(UserBookingDetails, booking_id)
        if booking and not booking.is_scanned:
            booking.is_scanned = True
            booking.scanned_at = datetime.utcnow()
            db.session.commit()
            return True, booking
        return False, booking
