from datetime import datetime
from sqlalchemy import select, desc
from werkzeug.security import generate_password_hash
from app.extensions.database import db
from app.models.user import User
from app.models.event import EventDetails, EventBookingDetails, EventFile

class AdminRepository:
    @staticmethod
    def create_default_superuser():
        email = "bookmyevent2026@gmail.com"
        stmt = select(User).where(User.email == email)
        existing = db.session.scalar(stmt)

        if not existing:
            hashed_password = generate_password_hash("admin@#$123")
            superuser = User(
                name="superuser",
                email=email,
                password=hashed_password,
                role="superuser"
            )
            db.session.add(superuser)
            db.session.commit()
            print("[OK] SuperUser auto-created via SQLAlchemy")
        else:
            print("[OK] SuperUser already exists")

    @staticmethod
    def get_all_events():
        stmt = select(
            EventDetails,
            EventBookingDetails,
            EventFile
        ).outerjoin(
            EventBookingDetails, EventDetails.id == EventBookingDetails.event_id
        ).outerjoin(
            EventFile, (EventDetails.id == EventFile.event_id) & (EventFile.file_type == 'banner')
        ).order_by(desc(EventDetails.id))

        return db.session.execute(stmt).all()

    @staticmethod
    def get_event_by_id(event_id: int):
        return db.session.get(EventDetails, event_id)

    @staticmethod
    def update_event_status(event_id: int, status: str):
        event = db.session.get(EventDetails, event_id)
        if event:
            event.status = status
            if status == "APPROVED":
                event.approved_at = datetime.utcnow()
            elif status == "REJECTED":
                event.rejected_at = datetime.utcnow()
            db.session.commit()
            return event
        return None
