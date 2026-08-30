from app.modules.organizer.repository.organizer_repository import OrganizerRepository
from app.modules.events.controllers.event_controller import EventController
from app.extensions.storage import StorageService

class OrganizerService:
    @staticmethod
    def upload_banner(contents: bytes, filename: str, content_type: str) -> str:
        return StorageService.upload_file_bytes(contents, filename, content_type, folder="banners")

    @staticmethod
    def create_event(event_data: dict, user_id: int = None) -> dict:
        return EventController.create_event(event_data, user_id=user_id)

    @staticmethod
    def get_event(event_id: str) -> dict:
        return EventController.get_event(event_id)

    @staticmethod
    def update_event(event_id: str, event_data: dict) -> dict:
        return EventController.update_event(event_id, event_data)

    @staticmethod
    def get_venues(organizer_id: int = None) -> list[dict]:
        from sqlalchemy import select
        from app.extensions.database import db
        from app.models.venue import Venue
        try:
            stmt = select(Venue).order_by(Venue.venue_name.asc())
            venues = db.session.scalars(stmt).all()
            if venues:
                return [v.to_dict() for v in venues]
        except Exception:
            pass
        return [
            { "id": 1, "venue_name": "Grand Convention Center", "city_name": "Chennai", "address": "123 MRC Nagar, Chennai", "total_area_sqft": 50000.0 },
            { "id": 2, "venue_name": "Cyber City Auditorium", "city_name": "Bangalore", "address": "100 Innovation Way, Cyber City, Bangalore", "total_area_sqft": 35000.0 },
            { "id": 3, "venue_name": "International Expo Center", "city_name": "Hyderabad", "address": "HITEC City Main Road, Hyderabad", "total_area_sqft": 75000.0 },
            { "id": 4, "venue_name": "Royal Palace Grounds", "city_name": "Mumbai", "address": "BKC Complex, Bandra East, Mumbai", "total_area_sqft": 100000.0 },
        ]

    @staticmethod
    def get_vendor_types() -> list[dict]:
        return [
            { "vendor_type": "Catering & Beverages" },
            { "vendor_type": "Audio & Visual Systems" },
            { "vendor_type": "Security & Bouncers" },
            { "vendor_type": "Stage & Decoration" },
            { "vendor_type": "Lighting & Power Backup" },
            { "vendor_type": "Photography & Videography" },
        ]

    @staticmethod
    def get_sponsors() -> list[dict]:
        return [
            { "sponsor_name": "Red Bull Energy" },
            { "sponsor_name": "Tech Corp Global" },
            { "sponsor_name": "Monster Energy" },
            { "sponsor_name": "Samsung Electronics" },
            { "sponsor_name": "Intel Corporation" },
        ]

    @staticmethod
    def get_policies(organizer_id: int = None) -> list[dict]:
        return [
            {
                "id": 1,
                "policy_group": "Cancellation Policy",
                "policy_type": "General Cancellation",
                "policy_name": "Standard 48-Hour Refund Policy",
                "description": "Full refund available up to 48 hours before event start date."
            },
            {
                "id": 2,
                "policy_group": "Cancellation Policy",
                "policy_type": "General Cancellation",
                "policy_name": "Non-Refundable Ticket",
                "description": "Tickets are strictly non-refundable once purchased."
            },
            {
                "id": 3,
                "policy_group": "Refund Policy",
                "policy_type": "Payment Return",
                "policy_name": "5-7 Business Days Payout",
                "description": "Refunds will be credited to original payment method within 5-7 business days."
            },
            {
                "id": 4,
                "policy_group": "Safety Policy",
                "policy_type": "Venue Security",
                "policy_name": "Mandatory Government ID Verification",
                "description": "All attendees must present a valid government-issued photo ID at entry."
            }
        ]

    @staticmethod
    def submit_kyc(user_id: int, kyc_data: dict) -> dict:
        user = OrganizerRepository.update_organizer_kyc(user_id, kyc_data)
        if not user:
            return {"success": False, "message": "User not found"}
        return {"success": True, "message": "KYC submitted successfully", "status": user.kyc_status}
