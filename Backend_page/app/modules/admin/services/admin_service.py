import os
from app.exceptions.api_error import ApiError
from app.modules.admin.repository.admin_repository import AdminRepository
from app.modules.admin.schemas.admin_schema import (
    UpdateEventStatusSchema, CategorySchema, UpdateKycStatusSchema
)

class AdminService:
    @staticmethod
    def get_events(host_url: str = "") -> list[dict]:
        rows = AdminRepository.get_all_events()
        events_dict = {}
        base_url = host_url.rstrip("/")

        for event, booking, banner_file in rows:
            event_id = event.id
            if event_id not in events_dict:
                file_path = banner_file.file_path if banner_file else None
                banner_url = None

                if file_path:
                    clean_path = file_path.replace("\\", "/")
                    relative_path = clean_path.split("/uploads/")[-1] if "/uploads/" in clean_path else os.path.basename(clean_path)
                    banner_url = f"{base_url}/uploads/{relative_path}"

                events_dict[event_id] = {
                    "id": event.id,
                    "event_name": event.event_name,
                    "status": event.status,
                    "category": event.category,
                    "start_date": str(event.start_date) if event.start_date else None,
                    "start_time": str(event.start_time) if event.start_time else None,
                    "end_date": str(event.end_date) if event.end_date else None,
                    "end_time": str(event.end_time) if event.end_time else None,
                    "venue": event.venue,
                    "address": event.address,
                    "created_by": event.created_by,
                    "capacity": booking.capacity if booking else None,
                    "charge_type": booking.charge_type if booking else None,
                    "banner_url": banner_url
                }

        return list(events_dict.values())

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
