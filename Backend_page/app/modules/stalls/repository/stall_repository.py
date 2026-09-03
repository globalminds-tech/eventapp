from sqlalchemy import select
from app.extensions.database import db
from app.models.stall import EventStall, StallAmenity

class StallRepository:
    @staticmethod
    def get_stalls_by_event(event_id) -> list[EventStall]:
        stmt = select(EventStall).where(EventStall.event_id == event_id)
        return list(db.session.scalars(stmt).all())

    @staticmethod
    def get_amenities_by_event(event_id) -> list[StallAmenity]:
        stmt = select(StallAmenity).where(StallAmenity.event_id == event_id)
        return list(db.session.scalars(stmt).all())

    @staticmethod
    def get_by_id(stall_id) -> EventStall | None:
        return db.session.get(EventStall, stall_id)
