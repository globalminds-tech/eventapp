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
            stmt = select(Venue)
            if organizer_id:
                try:
                    import uuid as uuid_mod
                    org_uuid = uuid_mod.UUID(str(organizer_id))
                    stmt = stmt.where(Venue.organizer_id == org_uuid)
                except Exception:
                    pass
            stmt = stmt.order_by(Venue.created_at.desc())
            venues = db.session.scalars(stmt).all()
            result = []
            if venues:
                from app.models.venue import VenueDocument
                for v in venues:
                    v_dict = v.to_dict()
                    doc_stmt = select(VenueDocument).where(VenueDocument.venue_id == v.id)
                    docs = db.session.scalars(doc_stmt).all()
                    v_dict["documents"] = [{
                        "document_type": d.document_type,
                        "document_number": d.document_number,
                        "document_file": d.document_file
                    } for d in docs]
                    result.append(v_dict)
            return result
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
                try:
                    import uuid as uuid_mod
                    org_uuid = uuid_mod.UUID(str(organizer_id))
                    stmt = stmt.where(SponsorDetails.organizer_id == org_uuid)
                except Exception:
                    pass
            stmt = stmt.order_by(SponsorDetails.created_at.desc())
            sponsors = db.session.scalars(stmt).all()
            result = []
            for s in sponsors:
                if not s.sponsor_name:
                    continue
                # Fetch documents
                from app.models.sponsor import SponsorDocument
                doc_stmt = select(SponsorDocument).where(SponsorDocument.sponsor_id == s.id)
                docs = db.session.scalars(doc_stmt).all()
                docs_list = [{
                    "document_type": d.document_type,
                    "document_number": d.document_number,
                    "document_file": d.document_file
                } for d in docs]
                
                result.append({
                    "id": str(s.id),
                    "sponsor_name": s.sponsor_name,
                    "primary_contact": s.primary_contact,
                    "secondary_contact": s.secondary_contact,
                    "mail_id": s.mail_id,
                    "address": s.address,
                    "status": s.status,
                    "documents": docs_list,
                    "created_at": str(s.created_at) if s.created_at else None
                })
            return result
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
                try:
                    import uuid as uuid_mod
                    org_uuid = uuid_mod.UUID(str(organizer_id))
                    stmt = stmt.where(VendorDetails.organizer_id == org_uuid)
                except Exception:
                    pass
            stmt = stmt.order_by(VendorDetails.created_at.desc())
            vendors = db.session.scalars(stmt).all()
            result = []
            for v in vendors:
                # Fetch documents
                from app.models.vendor import VendorDocument
                doc_stmt = select(VendorDocument).where(VendorDocument.vendor_id == v.id)
                docs = db.session.scalars(doc_stmt).all()
                docs_list = [{
                    "document_type": d.document_type,
                    "document_number": d.document_number,
                    "document_file": d.document_file
                } for d in docs]
                
                result.append({
                    "id": str(v.id),
                    "vendor_type": v.vendor_type,
                    "vendor_name": v.vendor_name,
                    "company_name": v.company_name,
                    "primary_contact": v.primary_contact,
                    "secondary_contact": v.secondary_contact,
                    "mail_id": v.mail_id,
                    "country": v.country,
                    "state": v.state,
                    "city": v.city,
                    "address": v.address,
                    "bank_name": v.bank_name,
                    "account_holder": v.account_holder,
                    "ifsc_code": v.ifsc_code,
                    "account_number": v.account_number,
                    "status": v.status,
                    "bank_passbook": v.bank_passbook,
                    "documents": docs_list,
                    "created_at": str(v.created_at) if v.created_at else None
                })
            return result
        except Exception:
            return []

    @staticmethod
    def create_vendor(vendor_data: dict, user_id = None) -> dict:
        import uuid as uuid_mod
        from app.extensions.database import db
        from app.models.vendor import VendorDetails
        try:
            raw_org_id = user_id or vendor_data.get("organizer_id")
            org_uuid = None
            if raw_org_id:
                try:
                    org_uuid = uuid_mod.UUID(str(raw_org_id))
                except Exception:
                    org_uuid = None

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
                organizer_id=org_uuid
            )
            db.session.add(new_vendor)
            db.session.flush()

            documents = vendor_data.get("documents", [])
            if documents:
                from app.models.vendor import VendorDocument
                for doc in documents:
                    doc_file_url = doc.get("document_file", "") or doc.get("file_url", "")
                    if doc.get("document_type") or doc.get("document_number") or doc_file_url:
                        new_doc = VendorDocument(
                            vendor_id=new_vendor.id,
                            document_type=doc.get("document_type", ""),
                            document_number=doc.get("document_number", ""),
                            document_file=doc_file_url
                        )
                        db.session.add(new_doc)
            db.session.commit()
            return {"vendor_name": new_vendor.vendor_name, "vendor_type": new_vendor.vendor_type, "id": str(new_vendor.id)}
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
            stmt = stmt.order_by(Policy.created_at.desc())
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
                    "file_path": p.file_path,
                    "created_at": str(p.created_at) if p.created_at else None
                } for p in policies]
        except Exception:
            pass
        return []

    @staticmethod
    def get_policy_types() -> list[dict]:
        from sqlalchemy import select
        from app.extensions.database import db
        from app.models.policy import Policy
        try:
            stmt = select(Policy.policy_type).distinct()
            types = db.session.scalars(stmt).all()
            
            # Filter out the old hardcoded default values
            hardcoded_types = ["Cancellation", "Refund", "Privacy", "Terms of Service", "Security & Entry", "Code of Conduct"]
            
            result = [{"policy_type": t} for t in types if t and t not in hardcoded_types]
            return result
        except Exception:
            return []

    @staticmethod
    def get_policy_groups() -> list[dict]:
        from sqlalchemy import select
        from app.extensions.database import db
        from app.models.policy import Policy
        try:
            stmt = select(Policy.policy_group).distinct()
            groups = db.session.scalars(stmt).all()
            
            # Filter out the old hardcoded default values
            hardcoded_groups = ["General", "Ticketing", "Exhibitor", "Sponsor"]
            
            result = [{"policy_group": g} for g in groups if g and g not in hardcoded_groups]
            return result
        except Exception:
            return []

    @staticmethod
    def submit_kyc(user_id, kyc_data: dict) -> dict:
        user = OrganizerRepository.update_organizer_kyc(user_id, kyc_data)
        if not user:
            return {"success": False, "message": "User not found"}
        return {"success": True, "message": "KYC submitted successfully", "status": user.kyc_status}

    # ── VENDOR UPDATE & DELETE ──

    @staticmethod
    def update_vendor(vendor_id: str, vendor_data: dict) -> dict:
        from sqlalchemy import select
        from app.extensions.database import db
        from app.models.vendor import VendorDetails
        import uuid as uuid_mod
        try:
            vid = uuid_mod.UUID(str(vendor_id))
            vendor = db.session.scalars(select(VendorDetails).where(VendorDetails.id == vid)).first()
            if not vendor:
                return {"success": False, "message": "Vendor not found"}
            updatable = ["vendor_type", "vendor_name", "company_name", "primary_contact",
                         "secondary_contact", "mail_id", "country", "state", "city",
                         "address", "bank_name", "account_holder", "ifsc_code",
                         "account_number", "bank_passbook", "status"]
            for field in updatable:
                if field in vendor_data:
                    setattr(vendor, field, vendor_data[field])
            db.session.commit()
            return {"success": True, "message": "Vendor updated successfully"}
        except Exception as e:
            db.session.rollback()
            raise e

    @staticmethod
    def delete_vendor(vendor_id: str) -> dict:
        from sqlalchemy import select
        from app.extensions.database import db
        from app.models.vendor import VendorDetails
        import uuid as uuid_mod
        try:
            vid = uuid_mod.UUID(str(vendor_id))
            vendor = db.session.scalars(select(VendorDetails).where(VendorDetails.id == vid)).first()
            if not vendor:
                return {"success": False, "message": "Vendor not found"}
            db.session.delete(vendor)
            db.session.commit()
            return {"success": True, "message": "Vendor deleted successfully"}
        except Exception as e:
            db.session.rollback()
            raise e

    # ── VENUE UPDATE & DELETE ──

    @staticmethod
    def update_venue(venue_id: str, venue_data: dict) -> dict:
        from sqlalchemy import select
        from app.extensions.database import db
        from app.models.venue import Venue
        import uuid as uuid_mod
        try:
            vid = uuid_mod.UUID(str(venue_id))
            venue = db.session.scalars(select(Venue).where(Venue.id == vid)).first()
            if not venue:
                return {"success": False, "message": "Venue not found"}
            updatable = ["venue_name", "address", "country_name", "state_name", "city_name",
                         "pin_code", "latitude", "longitude", "google_place_id",
                         "venue_image", "status"]
            for field in updatable:
                if field in venue_data:
                    setattr(venue, field, venue_data[field])
            if "location_details" in venue_data:
                venue.google_place_id = venue_data["location_details"]
            db.session.commit()
            return {"success": True, "message": "Venue updated successfully"}
        except Exception as e:
            db.session.rollback()
            raise e

    @staticmethod
    def delete_venue(venue_id: str) -> dict:
        from sqlalchemy import select
        from app.extensions.database import db
        from app.models.venue import Venue
        import uuid as uuid_mod
        try:
            vid = uuid_mod.UUID(str(venue_id))
            venue = db.session.scalars(select(Venue).where(Venue.id == vid)).first()
            if not venue:
                return {"success": False, "message": "Venue not found"}
            db.session.delete(venue)
            db.session.commit()
            return {"success": True, "message": "Venue deleted successfully"}
        except Exception as e:
            db.session.rollback()
            raise e

    # ── POLICY UPDATE & DELETE ──

    @staticmethod
    def update_policy(policy_id: str, policy_data: dict) -> dict:
        from sqlalchemy import select
        from app.extensions.database import db
        from app.models.policy import Policy
        import uuid as uuid_mod
        try:
            pid = uuid_mod.UUID(str(policy_id))
            policy = db.session.scalars(select(Policy).where(Policy.id == pid)).first()
            if not policy:
                return {"success": False, "message": "Policy not found"}
            for field in ["policy_name", "policy_type", "policy_group", "description", "status"]:
                if field in policy_data:
                    setattr(policy, field, policy_data[field])
            db.session.commit()
            return {"success": True, "message": "Policy updated successfully"}
        except Exception as e:
            db.session.rollback()
            raise e

    @staticmethod
    def delete_policy(policy_id: str) -> dict:
        from sqlalchemy import select
        from app.extensions.database import db
        from app.models.policy import Policy
        import uuid as uuid_mod
        try:
            pid = uuid_mod.UUID(str(policy_id))
            policy = db.session.scalars(select(Policy).where(Policy.id == pid)).first()
            if not policy:
                return {"success": False, "message": "Policy not found"}
            db.session.delete(policy)
            db.session.commit()
            return {"success": True, "message": "Policy deleted successfully"}
        except Exception as e:
            db.session.rollback()
            raise e

    # ── SPONSOR UPDATE & DELETE ──

    @staticmethod
    def update_sponsor(sponsor_id: str, sponsor_data: dict) -> dict:
        from sqlalchemy import select
        from app.extensions.database import db
        from app.models.sponsor import SponsorDetails
        import uuid as uuid_mod
        try:
            sid = uuid_mod.UUID(str(sponsor_id))
            sponsor = db.session.scalars(select(SponsorDetails).where(SponsorDetails.id == sid)).first()
            if not sponsor:
                return {"success": False, "message": "Sponsor not found"}
            for field in ["sponsor_name", "mail_id", "primary_contact", "secondary_contact", "address", "status"]:
                if field in sponsor_data:
                    setattr(sponsor, field, sponsor_data[field])
            db.session.commit()
            return {"success": True, "message": "Sponsor updated successfully"}
        except Exception as e:
            db.session.rollback()
            raise e

    @staticmethod
    def delete_sponsor(sponsor_id: str) -> dict:
        from sqlalchemy import select
        from app.extensions.database import db
        from app.models.sponsor import SponsorDetails
        import uuid as uuid_mod
        try:
            sid = uuid_mod.UUID(str(sponsor_id))
            sponsor = db.session.scalars(select(SponsorDetails).where(SponsorDetails.id == sid)).first()
            if not sponsor:
                return {"success": False, "message": "Sponsor not found"}
            db.session.delete(sponsor)
            db.session.commit()
            return {"success": True, "message": "Sponsor deleted successfully"}
        except Exception as e:
            db.session.rollback()
            raise e
