from sqlalchemy import select
from app.extensions.database import db
from app.models.stall import EventStall, StallAmenity

class StallRepository:
    @staticmethod
    def get_stalls_by_event(event_id) -> list[EventStall]:
        import uuid
        try:
            eid = uuid.UUID(str(event_id))
        except Exception:
            eid = event_id
        stmt = select(EventStall).where(EventStall.event_id == eid, EventStall.deleted_at.is_(None))
        return list(db.session.scalars(stmt).all())

    @staticmethod
    def get_amenities_by_event(event_id) -> list[StallAmenity]:
        import uuid
        try:
            eid = uuid.UUID(str(event_id))
        except Exception:
            eid = event_id
        stmt = select(StallAmenity).where(StallAmenity.event_id == eid)
        return list(db.session.scalars(stmt).all())

    @staticmethod
    def get_by_id(stall_id) -> EventStall | None:
        return db.session.get(EventStall, stall_id)
