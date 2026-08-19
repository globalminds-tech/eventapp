from sqlalchemy import select
from app.extensions.database import db
from app.models.stall import EventStall, StallAmenity

class StallRepository:
    @staticmethod
    def get_stalls_by_event(event_id: int):
        stmt = select(EventStall).where(EventStall.event_id == event_id)
        return db.session.scalars(stmt).all()

    @staticmethod
    def get_amenities_by_event(event_id: int):
        stmt = select(StallAmenity).where(StallAmenity.event_id == event_id)
        return db.session.scalars(stmt).all()
