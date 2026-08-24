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

    @staticmethod
    def get_all_categories():
        from app.models.category import CategoryMaster
        try:
            db.create_all()
            stmt = select(CategoryMaster).order_by(CategoryMaster.name.asc())
            results = list(db.session.scalars(stmt).all())
            if not results:
                defaults = [
                    ("Music & Concerts", "Rock, Pop, EDM, Classical, Jazz"),
                    ("Sports & Fitness", "Football, Cricket, Marathon, Esports"),
                    ("Tech & Business Expos", "AI & Tech, Startups, Web3, Finance"),
                    ("Food & Culinary", "Food Fest, Wine Tasting, Baking Workshop"),
                    ("Arts & Theatre", "Standup Comedy, Drama, Art Gallery")
                ]
                for name, subs in defaults:
                    cat = CategoryMaster(name=name, subcategories=subs, icon_name="Tag", status="Active")
                    db.session.add(cat)
                db.session.commit()
                results = list(db.session.scalars(stmt).all())
            return results
        except Exception as e:
            print(f"[Warning] CategoryMaster query handled gracefully: {e}")
            db.session.rollback()
            return []

    @staticmethod
    def create_or_update_category(name: str, subcategories: str, icon_name: str = "Tag", status: str = "Active"):
        from app.models.category import CategoryMaster
        stmt = select(CategoryMaster).where(CategoryMaster.name == name)
        existing = db.session.scalar(stmt)
        if existing:
            existing.subcategories = subcategories
            existing.status = status
            if icon_name:
                existing.icon_name = icon_name
            db.session.commit()
            return existing
        else:
            cat = CategoryMaster(name=name, subcategories=subcategories, icon_name=icon_name, status=status)
            db.session.add(cat)
            db.session.commit()
            return cat

    @staticmethod
    def get_pending_organizers():
        stmt = select(User).where(User.role == 'organizer').order_by(desc(User.id))
        return db.session.scalars(stmt).all()

    @staticmethod
    def update_organizer_kyc_status(user_id: int, kyc_status: str):
        user = db.session.get(User, user_id)
        if user:
            user.kyc_status = kyc_status
            db.session.commit()
            return user
        return None


