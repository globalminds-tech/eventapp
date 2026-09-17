from sqlalchemy import select
from app.extensions.database import db
from app.models.exhibitor import ExhibitorStallBooking, ExhibitorLead
from app.models.event import EventDetails

class ExhibitorRepository:
    @staticmethod
    def get_existing_booking(email: str = None, event_id = None, user_id = None, active_only: bool = True):
        from sqlalchemy import or_, func
        import uuid

        conditions = []
        if user_id:
            try:
                parsed_uid = uuid.UUID(str(user_id))
                conditions.append(ExhibitorStallBooking.user_id == parsed_uid)
            except Exception:
                conditions.append(ExhibitorStallBooking.user_id == user_id)
        if email:
            conditions.append(func.lower(ExhibitorStallBooking.email) == email.strip().lower())

        if not conditions or not event_id:
            return None

        event_uid = None
        try:
            event_uid = uuid.UUID(str(event_id))
        except Exception:
            event_uid = event_id

        stmt = select(ExhibitorStallBooking).where(
            ExhibitorStallBooking.event_id == event_uid,
            or_(*conditions)
        )

        if active_only:
            # Active applications that block duplicate bookings
            stmt = stmt.where(
                func.lower(ExhibitorStallBooking.status).in_(["pending", "approved", "confirmed", "paid"])
            )

        stmt = stmt.order_by(ExhibitorStallBooking.created_at.desc()).with_for_update()
        return db.session.scalar(stmt)

    @staticmethod
    def create_stall_booking(data_dict: dict) -> ExhibitorStallBooking:
        booking = ExhibitorStallBooking(**data_dict)
        db.session.add(booking)
        db.session.commit()
        return booking

    @staticmethod
    def get_user_bookings(user_id, status: str = None, search: str = None):
        from sqlalchemy import or_, and_, func
        import uuid
        conditions = []
        if user_id:
            try:
                parsed_uid = uuid.UUID(str(user_id))
                conditions.append(ExhibitorStallBooking.user_id == parsed_uid)
            except Exception:
                conditions.append(ExhibitorStallBooking.user_id == user_id)

        stmt = select(
            ExhibitorStallBooking,
            EventDetails.event_name,
            EventDetails.status
        ).outerjoin(
            EventDetails, ExhibitorStallBooking.event_id == EventDetails.id
        )
        if conditions:
            stmt = stmt.where(or_(*conditions))

        if status and status.strip() and status.strip().lower() != "all":
            clean_status = status.strip().lower()
            if clean_status == "confirmed":
                stmt = stmt.where(func.lower(ExhibitorStallBooking.status).in_(["confirmed", "paid"]))
            else:
                stmt = stmt.where(func.lower(ExhibitorStallBooking.status) == clean_status)

        if search and search.strip():
            term = f"%{search.strip().lower()}%"
            stmt = stmt.where(
                or_(
                    func.lower(EventDetails.event_name).like(term),
                    func.lower(ExhibitorStallBooking.company_name).like(term),
                    func.lower(ExhibitorStallBooking.stall_area).like(term)
                )
            )

        stmt = stmt.order_by(ExhibitorStallBooking.created_at.desc())
        return db.session.execute(stmt).all()

    @staticmethod
    def get_booking_by_id(booking_id) -> ExhibitorStallBooking | None:
        return db.session.get(ExhibitorStallBooking, booking_id)

    @staticmethod
    def get_all_applications():
        stmt = select(
            ExhibitorStallBooking,
            EventDetails.event_name,
            EventDetails.status
        ).outerjoin(
            EventDetails, ExhibitorStallBooking.event_id == EventDetails.id
        ).order_by(ExhibitorStallBooking.created_at.desc())
        return db.session.execute(stmt).all()

    @staticmethod
    def update_application_status(booking_id, status: str, rejection_reason: str = ""):
        booking = db.session.get(ExhibitorStallBooking, booking_id)
        if booking:
            booking.status = status
            if rejection_reason and hasattr(booking, "rejection_reason"):
                booking.rejection_reason = rejection_reason
            db.session.commit()
            return booking
        return None

    @staticmethod
    def create_lead(data_dict: dict) -> ExhibitorLead:
        import uuid
        cleaned = dict(data_dict)
        if "event_id" in cleaned and cleaned["event_id"]:
            try:
                cleaned["event_id"] = uuid.UUID(str(cleaned["event_id"]))
            except Exception:
                pass
        if "user_id" in cleaned and cleaned["user_id"]:
            try:
                cleaned["user_id"] = uuid.UUID(str(cleaned["user_id"]))
            except Exception:
                pass

        # Allowed model fields
        valid_fields = {"event_id", "user_id", "visitor_name", "company_name", "email", "mobile", "buying_intent", "notes"}
        model_kwargs = {k: v for k, v in cleaned.items() if k in valid_fields}

        lead = ExhibitorLead(**model_kwargs)
        db.session.add(lead)
        db.session.commit()
        return lead

    @staticmethod
    def get_leads_by_event(event_id, user_id, search: str = None):
        import uuid
        from sqlalchemy import or_, func
        ev_uuid = None
        if event_id:
            try:
                ev_uuid = uuid.UUID(str(event_id))
            except Exception:
                ev_uuid = event_id

        u_uuid = None
        if user_id:
            try:
                u_uuid = uuid.UUID(str(user_id))
            except Exception:
                u_uuid = user_id

        stmt = select(ExhibitorLead).where(
            ExhibitorLead.event_id == ev_uuid,
            ExhibitorLead.user_id == u_uuid
        )

        if search and search.strip():
            term = f"%{search.strip().lower()}%"
            stmt = stmt.where(
                or_(
                    func.lower(ExhibitorLead.visitor_name).like(term),
                    func.lower(ExhibitorLead.company_name).like(term),
                    func.lower(ExhibitorLead.email).like(term),
                    func.lower(ExhibitorLead.mobile).like(term)
                )
            )

        stmt = stmt.order_by(ExhibitorLead.created_at.desc())
        return db.session.scalars(stmt).all()
