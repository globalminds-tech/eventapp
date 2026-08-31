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
        return []

    @staticmethod
    def create_venue(venue_data: dict, user_id: int = None) -> dict:
        from app.extensions.database import db
        from app.models.venue import Venue
        try:
            new_venue = Venue(
                venue_name=venue_data.get("venue_name"),
                address=venue_data.get("address"),
                city_name=venue_data.get("city_name", ""),
                state_name=venue_data.get("state_name", ""),
                country_name=venue_data.get("country_name", ""),
                pin_code=venue_data.get("pin_code", ""),
                status="Active",
                organizer_id=user_id or venue_data.get("organizer_id")
            )
            db.session.add(new_venue)
            db.session.commit()
            return new_venue.to_dict()
        except Exception as e:
            db.session.rollback()
            raise e

    @staticmethod
    def get_vendor_types() -> list[dict]:
        from sqlalchemy import select
        from app.extensions.database import db
        from app.models.vendor import VendorDetails
        try:
            stmt = select(VendorDetails.vendor_type).distinct()
            types = db.session.scalars(stmt).all()
            result = [{"vendor_type": t} for t in types if t]
            if not result:
                return [
                    {"vendor_type": "Catering & Beverages"},
                    {"vendor_type": "Audio & Visual Systems"},
                    {"vendor_type": "Security & Bouncers"},
                    {"vendor_type": "Stage & Decoration"}
                ]
            return result
        except Exception:
            return []

    @staticmethod
    def get_vendor_names(vendor_type: str = None) -> list[dict]:
        from sqlalchemy import select
        from app.extensions.database import db
        from app.models.vendor import VendorDetails
        try:
            stmt = select(VendorDetails)
            if vendor_type:
                stmt = stmt.where(VendorDetails.vendor_type == vendor_type)
            vendors = db.session.scalars(stmt).all()
            return [{"vendor_name": v.vendor_name, "vendor_type": v.vendor_type} for v in vendors if v.vendor_name]
        except Exception:
            return []

    @staticmethod
    def get_sponsors() -> list[dict]:
        from sqlalchemy import select
        from app.extensions.database import db
        from app.models.sponsor import SponsorDetails
        try:
            stmt = select(SponsorDetails)
            sponsors = db.session.scalars(stmt).all()
            return [{"sponsor_name": s.sponsor_name} for s in sponsors if s.sponsor_name]
        except Exception:
            return []

    @staticmethod
    def create_vendor(vendor_data: dict, user_id: int = None) -> dict:
        from app.extensions.database import db
        from app.models.vendor import VendorDetails
        try:
            new_vendor = VendorDetails(
                vendor_type=vendor_data.get("vendor_type") or vendor_data.get("vendorType"),
                vendor_name=vendor_data.get("vendor_name") or vendor_data.get("vendorName"),
                company_name=vendor_data.get("company_name", ""),
                primary_contact=vendor_data.get("primary_contact", ""),
                mail_id=vendor_data.get("mail_id", ""),
                address=vendor_data.get("address", ""),
                status="Active",
                organizer_id=user_id or vendor_data.get("organizer_id")
            )
            db.session.add(new_vendor)
            db.session.commit()
            return {"vendor_name": new_vendor.vendor_name, "vendor_type": new_vendor.vendor_type}
        except Exception as e:
            db.session.rollback()
            raise e

    @staticmethod
    def create_sponsor(sponsor_data: dict, user_id: int = None) -> dict:
        from app.extensions.database import db
        from app.models.sponsor import SponsorDetails
        try:
            new_sponsor = SponsorDetails(
                sponsor_name=sponsor_data.get("sponsor_name") or sponsor_data.get("sponsorName"),
                primary_contact=sponsor_data.get("primary_contact", ""),
                mail_id=sponsor_data.get("mail_id", ""),
                address=sponsor_data.get("address", ""),
                status="Active",
                organizer_id=user_id or sponsor_data.get("organizer_id")
            )
            db.session.add(new_sponsor)
            db.session.commit()
            return {"sponsor_name": new_sponsor.sponsor_name}
        except Exception as e:
            db.session.rollback()
            raise e

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
