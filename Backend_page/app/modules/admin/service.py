import os
from app.modules.admin.repository import AdminRepository

class AdminService:
    @staticmethod
    def get_events(host_url: str):
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
                    banner_url = f"{base_url}/superuser/uploads/{relative_path}"

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

        return {"success": True, "events": list(events_dict.values())}

    @staticmethod
    def update_event_status(event_id: int, status: str):
        if status not in ["APPROVED", "REJECTED"]:
            return {"success": False, "message": "Invalid status value"}, 400

        event = AdminRepository.update_event_status(event_id, status)
        if not event:
            return {"success": False, "message": "Event not found"}, 404

        return {"success": True, "message": f"Event status updated to {status}"}, 200

    @staticmethod
    def get_categories():
        cats = AdminRepository.get_all_categories()
        return {"success": True, "categories": [c.to_dict() for c in cats]}

    @staticmethod
    def create_category(data: dict):
        name = data.get("name")
        subcategories = data.get("subcategories", "")
        if isinstance(subcategories, list):
            subcategories = ", ".join(subcategories)
        icon_name = data.get("icon_name", "Tag")
        status = data.get("status", "Active")

        if not name:
            return {"success": False, "message": "Category name is required"}, 400

        cat = AdminRepository.create_or_update_category(name, subcategories, icon_name, status)
        return {"success": True, "message": "Category saved successfully", "category": cat.to_dict()}, 200

    @staticmethod
    def get_pending_organizers():
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
        return {"success": True, "organizers": organizers_list}

    @staticmethod
    def update_organizer_kyc_status(user_id: int, status: str):
        user = AdminRepository.update_organizer_kyc_status(user_id, status)
        return {"success": True, "message": f"Organizer KYC status updated to {status}"}, 200


