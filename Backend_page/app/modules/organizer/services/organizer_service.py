from app.modules.organizer.repository.organizer_repository import OrganizerRepository
from app.modules.events.controllers.event_controller import EventController
from app.extensions.storage import StorageService

class OrganizerService:
    @staticmethod
    def upload_banner(contents: bytes, filename: str, content_type: str) -> str:
        return StorageService.upload_file_bytes(contents, filename, content_type, folder="banners")

    @staticmethod
    def create_event(event_data: dict, user_id = None) -> dict:
        return EventController.create_event(event_data, user_id=user_id)

    @staticmethod
    def get_event(event_id: str) -> dict:
        return EventController.get_event(event_id)

    @staticmethod
    def update_event(event_id: str, event_data: dict) -> dict:
        return EventController.update_event(event_id, event_data)

    @staticmethod
    def get_venues(organizer_id = None) -> list[dict]:
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
    def create_venue(venue_data: dict, user_id = None) -> dict:
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
                venue_image=venue_data.get("venue_image", ""),
                latitude=venue_data.get("latitude") if venue_data.get("latitude") else None,
                longitude=venue_data.get("longitude") if venue_data.get("longitude") else None,
                google_place_id=venue_data.get("location_details", ""),
                status=venue_data.get("status", "Active"),
                organizer_id=user_id or venue_data.get("organizer_id")
            )
            db.session.add(new_venue)
            db.session.flush()

            documents = venue_data.get("documents", [])
            if documents:
                from app.models.venue import VenueDocument
                for doc in documents:
                    new_doc = VenueDocument(
                        venue_id=new_venue.id,
                        document_type=doc.get("document_type", ""),
                        document_number=doc.get("document_number", ""),
                        document_file=doc.get("document_file", "")
                    )
                    db.session.add(new_doc)
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
    def get_sponsors(organizer_id=None) -> list[dict]:
        from sqlalchemy import select
        from app.extensions.database import db
        from app.models.sponsor import SponsorDetails
        try:
            stmt = select(SponsorDetails)
            if organizer_id:
                stmt = stmt.where(SponsorDetails.organizer_id == organizer_id)
            sponsors = db.session.scalars(stmt).all()
            return [{
                "id": str(s.id),
                "sponsor_name": s.sponsor_name,
                "primary_contact": s.primary_contact,
                "mail_id": s.mail_id,
                "address": s.address,
                "status": s.status,
                "created_at": str(s.created_at) if s.created_at else None
            } for s in sponsors if s.sponsor_name]
        except Exception:
            return []

    @staticmethod
    def get_vendors(organizer_id=None) -> list[dict]:
        from sqlalchemy import select
        from app.extensions.database import db
        from app.models.vendor import VendorDetails
        try:
            stmt = select(VendorDetails)
            if organizer_id:
                stmt = stmt.where(VendorDetails.organizer_id == organizer_id)
            vendors = db.session.scalars(stmt).all()
            return [{
                "id": str(v.id),
                "vendor_type": v.vendor_type,
                "vendor_name": v.vendor_name,
                "company_name": v.company_name,
                "primary_contact": v.primary_contact,
                "mail_id": v.mail_id,
                "address": v.address,
                "status": v.status,
                "created_at": str(v.created_at) if v.created_at else None
            } for v in vendors]
        except Exception:
            return []

    @staticmethod
    def create_vendor(vendor_data: dict, user_id = None) -> dict:
        from app.extensions.database import db
        from app.models.vendor import VendorDetails
        try:
            new_vendor = VendorDetails(
                vendor_type=vendor_data.get("vendor_type") or vendor_data.get("vendorType"),
                vendor_name=vendor_data.get("vendor_name") or vendor_data.get("vendorName"),
                company_name=vendor_data.get("company_name", ""),
                primary_contact=vendor_data.get("primary_contact", ""),
                secondary_contact=vendor_data.get("secondary_contact", ""),
                mail_id=vendor_data.get("mail_id", ""),
                country=vendor_data.get("country", ""),
                state=vendor_data.get("state", ""),
                city=vendor_data.get("city", ""),
                address=vendor_data.get("address", ""),
                bank_name=vendor_data.get("bank_name", ""),
                account_holder=vendor_data.get("account_holder", ""),
                ifsc_code=vendor_data.get("ifsc_code", ""),
                account_number=vendor_data.get("account_number", ""),
                bank_passbook=vendor_data.get("bank_passbook", ""),
                status=vendor_data.get("status", "Active"),
                organizer_id=user_id or vendor_data.get("organizer_id")
            )
            db.session.add(new_vendor)
            db.session.flush()

            documents = vendor_data.get("documents", [])
            if documents:
                from app.models.vendor import VendorDocument
                for doc in documents:
                    new_doc = VendorDocument(
                        vendor_id=new_vendor.id,
                        document_type=doc.get("document_type", ""),
                        document_number=doc.get("document_number", ""),
                        document_file=doc.get("document_file", "")
                    )
                    db.session.add(new_doc)
            db.session.commit()
            return {"vendor_name": new_vendor.vendor_name, "vendor_type": new_vendor.vendor_type}
        except Exception as e:
            db.session.rollback()
            raise e

    @staticmethod
    def create_sponsor(sponsor_data: dict, user_id = None) -> dict:
        from app.extensions.database import db
        from app.models.sponsor import SponsorDetails
        try:
            new_sponsor = SponsorDetails(
                sponsor_name=sponsor_data.get("sponsor_name") or sponsor_data.get("sponsorName"),
                primary_contact=sponsor_data.get("primary_contact", ""),
                secondary_contact=sponsor_data.get("secondary_contact", ""),
                mail_id=sponsor_data.get("mail_id", ""),
                address=sponsor_data.get("address", ""),
                status=sponsor_data.get("status", "Active"),
                organizer_id=user_id or sponsor_data.get("organizer_id")
            )
            db.session.add(new_sponsor)
            db.session.flush()

            documents = sponsor_data.get("documents", [])
            if documents:
                from app.models.sponsor import SponsorDocument
                for doc in documents:
                    new_doc = SponsorDocument(
                        sponsor_id=new_sponsor.id,
                        document_type=doc.get("document_type", ""),
                        document_number=doc.get("document_number", ""),
                        document_file=doc.get("document_file", "")
                    )
                    db.session.add(new_doc)
            db.session.commit()
            return {"sponsor_name": new_sponsor.sponsor_name}
        except Exception as e:
            db.session.rollback()
            raise e

    @staticmethod
    def create_policy(policy_data: dict, user_id = None) -> dict:
        from app.extensions.database import db
        from app.models.policy import Policy
        try:
            new_policy = Policy(
                policy_name=policy_data.get("policy_name"),
                policy_type=policy_data.get("policy_type", ""),
                policy_group=policy_data.get("policy_group", ""),
                description=policy_data.get("description", ""),
                status=policy_data.get("status", "Active"),
                organizer_id=user_id or policy_data.get("organizer_id")
            )
            db.session.add(new_policy)
            db.session.commit()
            return {
                "id": str(new_policy.id),
                "policy_name": new_policy.policy_name,
                "policy_group": new_policy.policy_group,
                "policy_type": new_policy.policy_type,
                "description": new_policy.description,
                "status": new_policy.status
            }
        except Exception as e:
            db.session.rollback()
            raise e

    @staticmethod
    def get_policies(organizer_id = None) -> list[dict]:
        from sqlalchemy import select
        from app.extensions.database import db
        from app.models.policy import Policy
        try:
            stmt = select(Policy)
            if organizer_id:
                stmt = stmt.where(Policy.organizer_id == organizer_id)
            policies = db.session.scalars(stmt).all()
            if policies:
                return [{
                    "id": str(p.id),
                    "policy_code": p.policy_code,
                    "policy_name": p.policy_name,
                    "policy_type": p.policy_type,
                    "policy_group": p.policy_group,
                    "description": p.description,
                    "status": p.status,
                    "created_at": str(p.created_at) if p.created_at else None
                } for p in policies]
        except Exception:
            pass
        return []

    @staticmethod
    def submit_kyc(user_id, kyc_data: dict) -> dict:
        user = OrganizerRepository.update_organizer_kyc(user_id, kyc_data)
        if not user:
            return {"success": False, "message": "User not found"}
        return {"success": True, "message": "KYC submitted successfully", "status": user.kyc_status}
