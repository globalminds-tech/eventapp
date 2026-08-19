from sqlalchemy import select
from app.extensions.database import db
from app.models.booking import UserBookingDetails

class BookingRepository:
    @staticmethod
    def get_user_bookings(email: str):
        stmt = select(UserBookingDetails).where(UserBookingDetails.email == email.strip().lower())
        return db.session.scalars(stmt).all()
