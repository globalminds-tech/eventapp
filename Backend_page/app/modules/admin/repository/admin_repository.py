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
                name="superadmin",
                email=email,
                password=hashed_password,
                roles=["superadmin"],
                active_role="superadmin"
            )
            db.session.add(superuser)
            db.session.commit()
            print("[OK] SuperAdmin auto-created via SQLAlchemy")
        else:
            existing.name = "superadmin"
            existing.roles = ["superadmin"]
            existing.active_role = "superadmin"
            db.session.commit()
            print("[OK] SuperAdmin role isolated exclusively to ['superadmin']")

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
        ).order_by(desc(EventDetails.created_at))

        return db.session.execute(stmt).all()

    @staticmethod
    def get_event_by_id(event_id):
        return db.session.get(EventDetails, event_id)

    @staticmethod
    def update_event_status(event_id, status: str):
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
            stmt = select(CategoryMaster).order_by(CategoryMaster.name.asc())
            return list(db.session.scalars(stmt).all())
        except Exception as e:
            print(f"[Error] CategoryMaster query error: {e}")
            db.session.rollback()
            raise e

    @staticmethod
    def create_or_update_category(name: str, subcategories: str, icon_name: str = "Tag", category_image: str = "", status: str = "Active"):
        from app.models.category import CategoryMaster
        stmt = select(CategoryMaster).where(CategoryMaster.name == name)
        existing = db.session.scalar(stmt)
        if existing:
            existing.subcategories = subcategories
            existing.status = status
            if icon_name:
                existing.icon_name = icon_name
            if category_image:
                existing.category_image = category_image
            db.session.commit()
            return existing
        else:
            cat = CategoryMaster(name=name, subcategories=subcategories, icon_name=icon_name, category_image=category_image, status=status)
            db.session.add(cat)
            db.session.commit()
            return cat

    @staticmethod
    def update_category_by_id(cat_id, data: dict):
        from app.models.category import CategoryMaster
        cat = db.session.get(CategoryMaster, cat_id)
        if not cat:
            return None
        if "name" in data:
            cat.name = data["name"]
        if "subcategories" in data:
            subs = data["subcategories"]
            if isinstance(subs, list):
                cat.subcategories = ", ".join(subs)
            else:
                cat.subcategories = str(subs)
        if "icon_name" in data:
            cat.icon_name = data["icon_name"]
        if "category_image" in data:
            cat.category_image = data["category_image"]
        if "status" in data:
            cat.status = data["status"]
        db.session.commit()
        return cat

    @staticmethod
    def delete_category_by_id(cat_id):
        from app.models.category import CategoryMaster
        cat = db.session.get(CategoryMaster, cat_id)
        if cat:
            db.session.delete(cat)
            db.session.commit()
            return True
        return False

    @staticmethod
    def get_pending_organizers():
        stmt = select(User).where(User.roles.any('organizer')).order_by(desc(User.created_at))
        return db.session.scalars(stmt).all()

    @staticmethod
    def update_organizer_kyc_status(user_id, kyc_status: str):
        user = db.session.get(User, user_id)
        if user:
            user.kyc_status = kyc_status
            db.session.commit()
            return user
        return None
