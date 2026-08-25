from sqlalchemy import select, desc
from app.extensions.database import db
from app.models.event import EventDetails
from app.models.venue import Venue
from app.models.vendor import VendorDetails
from app.models.sponsor import SponsorDetails
from app.models.policy import Policy
from app.models.program import EventProgram

class EventRepository:
    @staticmethod
    def get_all() -> list[EventDetails]:
        stmt = select(EventDetails).order_by(desc(EventDetails.id))
        return list(db.session.scalars(stmt).all())

    @staticmethod
    def get_all_event_summaries() -> list[dict]:
        stmt = select(EventDetails.id, EventDetails.event_code, EventDetails.event_name, EventDetails.start_date, EventDetails.venue)
        rows = db.session.execute(stmt).all()
        return [{"id": r[0], "event_code": r[1], "event_name": r[2], "start_date": str(r[3]), "venue": r[4]} for r in rows]

    @staticmethod
    def get_by_id(event_id: int) -> EventDetails | None:
        return db.session.get(EventDetails, event_id)

    @staticmethod
    def create(event_data: dict) -> EventDetails:
        event = EventDetails(**event_data)
        db.session.add(event)
        db.session.commit()
        return event

    @staticmethod
    def update(event_id: int, update_data: dict) -> EventDetails | None:
        event = db.session.get(EventDetails, event_id)
        if event:
            for key, val in update_data.items():
                if val is not None and hasattr(event, key):
                    setattr(event, key, val)
            db.session.commit()
        return event

    @staticmethod
    def delete(event_id: int) -> bool:
        event = db.session.get(EventDetails, event_id)
        if event:
            db.session.delete(event)
            db.session.commit()
            return True
        return False

    @staticmethod
    def get_all_venues() -> list[Venue]:
        stmt = select(Venue).order_by(desc(Venue.id))
        return list(db.session.scalars(stmt).all())

    @staticmethod
    def get_all_vendors() -> list[VendorDetails]:
        stmt = select(VendorDetails).order_by(desc(VendorDetails.id))
        return list(db.session.scalars(stmt).all())

    @staticmethod
    def get_all_sponsors() -> list[SponsorDetails]:
        stmt = select(SponsorDetails).order_by(desc(SponsorDetails.id))
        return list(db.session.scalars(stmt).all())

    @staticmethod
    def get_all_policies() -> list[Policy]:
        stmt = select(Policy).order_by(desc(Policy.id))
        return list(db.session.scalars(stmt).all())

    @staticmethod
    def get_event_programs(event_id: int) -> list[EventProgram]:
        stmt = select(EventProgram).where(EventProgram.event_id == event_id)
        return list(db.session.scalars(stmt).all())
