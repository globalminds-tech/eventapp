from sqlalchemy import select, desc
from app.extensions.database import db
from app.models.booking import UserBookingDetails

class BookingRepository:
    @staticmethod
    def get_by_id(booking_id) -> UserBookingDetails | None:
        return db.session.get(UserBookingDetails, booking_id)

    @staticmethod
    def get_user_bookings(email: str) -> list[UserBookingDetails]:
        if not email:
            return []
        stmt = select(UserBookingDetails).where(UserBookingDetails.email == email.strip().lower()).order_by(desc(UserBookingDetails.created_at))
        return list(db.session.scalars(stmt).all())

    @staticmethod
    def get_all() -> list[UserBookingDetails]:
        stmt = select(UserBookingDetails).order_by(desc(UserBookingDetails.created_at))
        return list(db.session.scalars(stmt).all())
