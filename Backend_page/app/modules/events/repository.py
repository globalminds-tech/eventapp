from sqlalchemy import select, desc
from app.extensions.database import db
from app.models.event import EventDetails, EventBookingDetails, EventLayout
from app.models.venue import Venue
from app.models.stall import EventStall
from app.models.vendor import VendorDetails
from app.models.sponsor import SponsorDetails
from app.models.policy import Policy
from app.models.program import EventProgram

class EventRepository:
    @staticmethod
    def get_all_event_summaries():
        stmt = select(EventDetails.id, EventDetails.event_code, EventDetails.event_name)
        rows = db.session.execute(stmt).all()
        return [{"id": r[0], "event_code": r[1], "event_name": r[2]} for r in rows]

    @staticmethod
    def get_event_by_id(event_id: int):
        return db.session.get(EventDetails, event_id)

    @staticmethod
    def create_event(event_data: dict):
        event = EventDetails(**event_data)
        db.session.add(event)
        db.session.commit()
        return event

    @staticmethod
    def get_all_venues():
        stmt = select(Venue).order_by(desc(Venue.id))
        return db.session.scalars(stmt).all()

    @staticmethod
    def get_all_vendors():
        stmt = select(VendorDetails).order_by(desc(VendorDetails.id))
        return db.session.scalars(stmt).all()

    @staticmethod
    def get_all_sponsors():
        stmt = select(SponsorDetails).order_by(desc(SponsorDetails.id))
        return db.session.scalars(stmt).all()

    @staticmethod
    def get_all_policies():
        stmt = select(Policy).order_by(desc(Policy.id))
        return db.session.scalars(stmt).all()

    @staticmethod
    def get_event_programs(event_id: int):
        stmt = select(EventProgram).where(EventProgram.event_id == event_id)
        return db.session.scalars(stmt).all()
