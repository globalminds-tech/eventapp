import os
from app.exceptions.api_error import ApiError
from app.modules.admin.repository.admin_repository import AdminRepository
from app.modules.admin.schemas.admin_schema import (
    UpdateEventStatusSchema, CategorySchema, UpdateKycStatusSchema
)

from sqlalchemy import select, desc
from app.extensions.database import db
from app.models.event import EventDetails, EventBookingDetails, EventFile

class AdminService:
    @staticmethod
    def get_events(host_url: str = "") -> list[dict]:
        try:
            stmt = select(EventDetails).order_by(desc(EventDetails.id))
            events = db.session.scalars(stmt).all()
            events_list = []
            for event in events:
                booking = db.session.scalars(select(EventBookingDetails).where(EventBookingDetails.event_id == event.id)).first()
                banner_file = db.session.scalars(select(EventFile).where(EventFile.event_id == event.id, EventFile.file_type == "banner")).first()
                b_url = banner_file.file_path if banner_file else ""
                events_list.append({
                    "id": event.id,
                    "event_code": getattr(event, "event_code", None) or f"EVT-{event.id}",
                    "code": getattr(event, "event_code", None) or f"EVT-{event.id}",
                    "slug": getattr(event, "slug", "") or "",
                    "event_name": event.event_name or "Untitled Event",
                    "name": event.event_name or "Untitled Event",
                    "status": event.status or "Active",
                    "category": event.category or "General",
                    "sub_category": getattr(event, "sub_category", "") or "",
                    "start_date": str(event.start_date) if getattr(event, "start_date", None) else None,
                    "date": str(event.start_date) if getattr(event, "start_date", None) else None,
                    "start_time": str(event.start_time) if getattr(event, "start_time", None) else None,
                    "end_date": str(event.end_date) if getattr(event, "end_date", None) else None,
                    "end_time": str(event.end_time) if getattr(event, "end_time", None) else None,
                    "venue": event.venue or "Venue Setup",
                    "address": event.address or "",
                    "created_by": getattr(event, "created_by", None),
                    "user_id": getattr(event, "user_id", None),
                    "capacity": (getattr(booking, "capacity", None) if booking else None) or getattr(event, "total_capacity", 500) or 500,
                    "charge_type": (getattr(booking, "charge_type", None) if booking else None) or "Free",
                    "pass_fee": float(getattr(event, "pass_fee", 0) or 0),
                    "banner_url": b_url,
                    "banner": b_url,
                    "image": b_url,
                    "banner_preview": b_url
                })
            return events_list
        except Exception as e:
            print("Failed to load events from DB:", e)
            return []

    @staticmethod
    def update_event_status(event_id: int, raw_data: dict) -> dict:
        data = UpdateEventStatusSchema(**raw_data)
        if data.status not in ["APPROVED", "REJECTED", "PENDING"]:
            raise ApiError("Invalid status value", 400)

        event = AdminRepository.update_event_status(event_id, data.status)
        if not event:
            raise ApiError("Event not found", 404)

        return {"message": f"Event status updated to {data.status}"}

    @staticmethod
    def get_categories() -> list[dict]:
        cats = AdminRepository.get_all_categories()
        return [c.to_dict() if hasattr(c, "to_dict") else {"id": c.id, "name": c.name, "subcategories": c.subcategories} for c in cats]

    @staticmethod
    def create_category(raw_data: dict) -> dict:
        data = CategorySchema(**raw_data)
        subcategories = data.subcategories
        if isinstance(subcategories, list):
            subcategories = ", ".join(subcategories)

        cat = AdminRepository.create_or_update_category(
            name=data.name,
            subcategories=subcategories,
            icon_name=data.icon_name,
            status=data.status
        )
        return cat.to_dict() if hasattr(cat, "to_dict") else {"id": cat.id, "name": cat.name, "subcategories": cat.subcategories}

    @staticmethod
    def get_pending_organizers() -> list[dict]:
        users = AdminRepository.get_pending_organizers()
        organizers_list = []
        for u in users:
            organizers_list.append({
                "id": str(u.id),
                "name": u.name,
                "email": u.email,
                "mobile": getattr(u, "mobile", ""),
                "company_name": getattr(u, "company_name", "DIY Event Corp"),
                "gst_pan": getattr(u, "gst_pan", "33ABCDE1234F1Z5"),
                "bank_account": getattr(u, "bank_account", "XXXX-XXXX-9876"),
                "ifsc": getattr(u, "ifsc", "HDFC0001234"),
                "kyc_status": getattr(u, "kyc_status", "VERIFIED"),
            })
        return organizers_list

    @staticmethod
    def update_organizer_kyc_status(user_id: int, raw_data: dict) -> dict:
        data = UpdateKycStatusSchema(**raw_data)
        user = AdminRepository.update_organizer_kyc_status(user_id, data.status)
        if not user:
            raise ApiError("User not found", 404)
        return {"message": f"Organizer KYC status updated to {data.status}"}
