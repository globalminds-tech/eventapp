from app.extensions.database import db
from app.models.user import User
from sqlalchemy import select

class OrganizerRepository:
    @staticmethod
    def get_organizer_by_id(user_id) -> User:
        return db.session.get(User, user_id)

    @staticmethod
    def update_organizer_kyc(user_id, kyc_data: dict) -> User:
        user = db.session.get(User, user_id)
        if user:
            user.company_name = kyc_data.get("company_name", user.company_name)
            user.gst_pan = f"{kyc_data.get('gst_number', '')} / {kyc_data.get('pan_number', '')}"
            user.bank_account = kyc_data.get("bank_account_number", user.bank_account)
            user.ifsc = kyc_data.get("ifsc_code", user.ifsc)
            user.kyc_status = "PENDING_APPROVAL"
            db.session.commit()
            db.session.refresh(user)
        return user
