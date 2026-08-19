from sqlalchemy import select, desc
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
    def create_stall_booking(data_dict: dict):
        booking = ExhibitorStallBooking(**data_dict)
        db.session.add(booking)
        db.session.commit()
        return booking

    @staticmethod
    def get_user_bookings(user_id: int):
        stmt = select(ExhibitorStallBooking, EventDetails.event_name).join(
            EventDetails, ExhibitorStallBooking.event_id == EventDetails.id
        ).where(ExhibitorStallBooking.user_id == user_id).order_by(desc(ExhibitorStallBooking.created_at))
        return db.session.execute(stmt).all()

    @staticmethod
    def get_booking_by_id(booking_id: int):
        stmt = select(ExhibitorStallBooking, EventDetails.event_name).join(
            EventDetails, ExhibitorStallBooking.event_id == EventDetails.id
        ).where(ExhibitorStallBooking.id == booking_id)
        return db.session.execute(stmt).first()

    @staticmethod
    def update_booking(booking_id: int, update_dict: dict):
        booking = db.session.get(ExhibitorStallBooking, booking_id)
        if booking:
            for key, val in update_dict.items():
                if hasattr(booking, key) and val is not None:
                    setattr(booking, key, val)
            db.session.commit()
            return booking
        return None
