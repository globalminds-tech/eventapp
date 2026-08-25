from sqlalchemy import select
from app.extensions.database import db
from app.models.exhibitor import ExhibitorStallBooking
from app.models.event import EventDetails

class ExhibitorRepository:
    @staticmethod
    def get_existing_booking(email: str, event_id: int):
        stmt = select(ExhibitorStallBooking).where(
            ExhibitorStallBooking.email == email,
            ExhibitorStallBooking.event_id == event_id
        )
        return db.session.scalar(stmt)

    @staticmethod
    def create_stall_booking(data_dict: dict) -> ExhibitorStallBooking:
        booking = ExhibitorStallBooking(**data_dict)
        db.session.add(booking)
        db.session.commit()
        return booking

    @staticmethod
    def get_user_bookings(user_id: int):
        stmt = select(
            ExhibitorStallBooking,
            EventDetails.event_name
        ).outerjoin(
            EventDetails, ExhibitorStallBooking.event_id == EventDetails.id
        ).where(ExhibitorStallBooking.user_id == user_id)
        return db.session.execute(stmt).all()

    @staticmethod
    def get_booking_by_id(booking_id: int) -> ExhibitorStallBooking | None:
        return db.session.get(ExhibitorStallBooking, booking_id)
