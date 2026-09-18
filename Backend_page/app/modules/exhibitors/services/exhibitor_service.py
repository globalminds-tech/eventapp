import os
from werkzeug.utils import secure_filename
from app.exceptions.api_error import ApiError
from app.modules.exhibitors.repository.exhibitor_repository import ExhibitorRepository
from app.utils.security_crypto import decrypt_field, mask_pan_number

class ExhibitorService:
    @staticmethod
    def book_stall(form_data: dict, file_obj=None, upload_folder: str = "uploads") -> dict:
        email = form_data.get("email")
        event_id = form_data.get("event_id")

        if not email or not event_id:
            raise ApiError("Email and Event ID are required", 400)

        from app.modules.users.repository.user_repository import UserRepository
        event = UserRepository.get_event_by_id(event_id)
        if not event:
            raise ApiError("Event not found", 404)

        event_status = (getattr(event, "status", None) or "Active").strip().upper()
        if event_status == "SUSPENDED":
            raise ApiError("This event is currently suspended. Stall booking is temporarily unavailable.", 400)
        if event_status not in ["APPROVED", "ACTIVE", "LIVE", "PUBLISHED"]:
            raise ApiError(f"This event is currently in '{event_status}' status and not open for stall reservations.", 400)

        from app.modules.users.services.user_service import check_event_concluded
        if check_event_concluded(event):
            raise ApiError("This event has already concluded. Stall reservations are closed.", 400)

        # Enforce Exhibitor KYC Verification Check
        user_id = form_data.get("user_id")
        from app.models.exhibitor_profile import ExhibitorProfile
        from app.models.user import User
        from app.extensions.database import db
        from sqlalchemy import select
        import uuid

        exh_p = None
        if user_id:
            try:
                uid = uuid.UUID(str(user_id)) if isinstance(user_id, str) else user_id
                exh_p = db.session.scalar(select(ExhibitorProfile).where(ExhibitorProfile.user_id == uid))
            except Exception:
                pass
        if not exh_p and email:
            u = db.session.scalar(select(User).where(User.email == email))
            if u:
                exh_p = db.session.scalar(select(ExhibitorProfile).where(ExhibitorProfile.user_id == u.id))

        if exh_p and (exh_p.kyc_status or "").strip().upper() != "VERIFIED":
            raise ApiError(
                "Stall booking locked: Your Exhibitor business KYC is currently pending verification. "
                "Stall reservations will unlock once your KYC application is approved by Super Admin.",
                403
            )

        existing_booking = ExhibitorRepository.get_existing_booking(
            email=email,
            event_id=event_id,
            user_id=user_id,
            active_only=True
        )
        if existing_booking:
            st = (existing_booking.status or "Pending").title()
            raise ApiError(
                f"You already have an active stall reservation for this event (Current Status: {st}). "
                "Multiple applications for the same event are not permitted.",
                400
            )

        # Check total configured stall inventory capacity
        from app.models.stall import EventStall
        from app.models.exhibitor import ExhibitorStallBooking
        from sqlalchemy import func
        stalls = list(db.session.scalars(select(EventStall).where(EventStall.event_id == event.id, EventStall.deleted_at.is_(None))).all())
        total_event_stalls = sum(int(s.quantity or 1) for s in stalls)
        if total_event_stalls > 0:
            booked_count = db.session.scalar(select(func.count(ExhibitorStallBooking.id)).where(
                ExhibitorStallBooking.event_id == event.id,
                func.lower(ExhibitorStallBooking.status).in_(["approved", "confirmed", "paid", "pending"])
            )) or 0
            if booked_count >= total_event_stalls:
                raise ApiError("All exhibition stalls for this event have been fully booked.", 400)

        visiting_card_path = None
        if file_obj:
            os.makedirs(upload_folder, exist_ok=True)
            filename = secure_filename(file_obj.filename)
            visiting_card_path = os.path.join(upload_folder, filename)
            try:
                content = file_obj.file.read()
                with open(visiting_card_path, "wb") as buffer:
                    buffer.write(content)
            except Exception as e:
                print(f"Warning: Failed to write visiting card file: {e}")
                visiting_card_path = None

        data_dict = {
            "user_id": form_data.get("user_id"),
            "event_id": event_id,
            "event_name": form_data.get("eventName"),
            "title": form_data.get("title") or "",
            "first_name": form_data.get("firstName") or form_data.get("first_name") or "",
            "last_name": form_data.get("lastName") or form_data.get("last_name") or "",
            "email": email,
            "mobile": form_data.get("mobile") or "",
            "designation": form_data.get("designation") or "",
            "company_name": form_data.get("companyName") or form_data.get("company_name") or "",
            "company_type": form_data.get("company_type") or form_data.get("companyType") or "",
            "industry_type": form_data.get("industry_type") or form_data.get("industryType") or form_data.get("products") or "",
            "company_website": form_data.get("company_website") or form_data.get("companyWebsite") or form_data.get("website") or "",
            "business_description": form_data.get("business_description") or form_data.get("businessDescription") or "",
            "country": form_data.get("country") or "",
            "state": form_data.get("state") or "",
            "city": form_data.get("city") or "",
            "address": form_data.get("address") or "",
            "pin_code": form_data.get("pinCode") or form_data.get("pin_code") or "",
            "stall_area": form_data.get("stallArea") or form_data.get("stall_area") or "",
            "products": form_data.get("products") or "",
            "messages": form_data.get("message") or "",
            "visiting_card": visiting_card_path
        }

        booking = ExhibitorRepository.create_stall_booking(data_dict)
        return {
            "message": "Stall booked successfully!",
            "booking_id": str(booking.id)
        }

    @staticmethod
    def get_user_bookings(user_id, host_url: str = "", status: str = None, search: str = None) -> list[dict]:
        rows = ExhibitorRepository.get_user_bookings(user_id, status=status, search=search)
        data = []
        base_url = host_url.rstrip("/")

        for row in rows:
            booking = row[0]
            event_name = row[1] if len(row) > 1 else ""
            ev_status = row[2] if len(row) > 2 else "ACTIVE"
            # Extract stall pricing from configured EventStall
            pricing = ExhibitorRepository.get_stall_pricing(booking)
            raw_price = pricing.get("total_price", 0.0)

            comp_type = getattr(booking, "company_type", None) or ""
            ind_type = getattr(booking, "industry_type", None) or getattr(booking, "products", "") or ""
            comp_web = getattr(booking, "company_website", None) or ""
            biz_desc = getattr(booking, "business_description", None) or ""

            b_dict = {
                "id": str(booking.id),
                "event_id": str(booking.event_id) if booking.event_id else None,
                "user_id": str(booking.user_id) if booking.user_id else None,
                "eventName": event_name or getattr(booking, "event_name", ""),
                "event_name": event_name,
                "event_status": (ev_status or "ACTIVE").upper(),
                "is_suspended": (ev_status or "").upper() == "SUSPENDED",
                "title": booking.title,
                "first_name": booking.first_name,
                "last_name": booking.last_name,
                "email": booking.email,
                "email_id": booking.email,
                "mobile": booking.mobile,
                "mobile_number": booking.mobile,
                "designation": booking.designation,
                "company_name": booking.company_name,
                "company_type": comp_type,
                "industry_type": ind_type,
                "company_website": comp_web,
                "business_description": biz_desc,
                "country": booking.country,
                "state": booking.state,
                "city": booking.city,
                "address": booking.address,
                "pin_code": booking.pin_code,
                "postal_code": booking.pin_code,
                "stall_area": booking.stall_area,
                "stall_size": pricing.get("stall_size", ""),
                "products": booking.products,
                "messages": booking.messages,
                "status": booking.status,
                "visiting_card": booking.visiting_card,
                "price_paid": raw_price,
                "price": raw_price,
                "rental_price": raw_price,
                "base_price": pricing.get("base_price", 0.0),
                "prime_price": pricing.get("prime_price", 0.0),
                "total_price": raw_price,
                "created_at": str(booking.created_at) if booking.created_at else None
            }

            if booking.visiting_card:
                file_path = booking.visiting_card.replace("\\", "/")
                relative_path = file_path.split("/uploads/")[-1] if "/uploads/" in file_path else os.path.basename(file_path)
                b_dict["visiting_card_url"] = f"{base_url}/uploads/{relative_path}"
            else:
                b_dict["visiting_card_url"] = None

            data.append(b_dict)

        return data

    @staticmethod
    def get_booking_by_id(booking_id, host_url: str = "") -> dict:
        booking = ExhibitorRepository.get_booking_by_id(booking_id)
        if not booking:
            raise ApiError("Booking not found", 404)
        
        base_url = host_url.rstrip("/")
        from app.models.event import EventDetails
        from app.extensions.database import db
        
        event = db.session.get(EventDetails, booking.event_id) if booking.event_id else None

        # Resolve associated exhibitor profile for rich enrichments
        exh_p = None
        if booking.user_id:
            from app.models.exhibitor_profile import ExhibitorProfile
            exh_p = db.session.query(ExhibitorProfile).filter(ExhibitorProfile.user_id == booking.user_id).first()
        if not exh_p and booking.email:
            from app.models.user import User
            from app.models.exhibitor_profile import ExhibitorProfile
            u = db.session.query(User).filter(User.email == booking.email).first()
            if u:
                exh_p = db.session.query(ExhibitorProfile).filter(ExhibitorProfile.user_id == u.id).first()

        # Parse exact stall configuration from EventStall
        pricing = ExhibitorRepository.get_stall_pricing(booking)
        raw_price = pricing.get("total_price", 0.0)

        # Parse exhibitor notes from messages
        notes = ""
        if booking.messages:
            import re
            nm = re.search(r'\[Exhibitor Notes\]:\s*(.*)', booking.messages)
            if nm:
                notes = nm.group(1).strip()

        comp_type = getattr(booking, "company_type", None) or (getattr(exh_p, "company_type", "") if exh_p else "") or ""
        ind_type = getattr(booking, "industry_type", None) or getattr(booking, "products", "") or (getattr(exh_p, "vendor_category", "") if exh_p else "") or ""
        comp_web = getattr(booking, "company_website", None) or (getattr(exh_p, "website_url", "") if exh_p else "") or ""
        biz_desc = getattr(booking, "business_description", None) or (getattr(exh_p, "business_description", "") if exh_p else "") or ""
            
        b_dict = {
            "id": str(booking.id),
            "event_id": str(booking.event_id) if booking.event_id else None,
            "user_id": str(booking.user_id) if booking.user_id else None,
            "eventName": event.event_name if event else getattr(booking, "event_name", ""),
            "event_name": event.event_name if event else getattr(booking, "event_name", ""),
            "event_status": (event.status or "ACTIVE").upper() if event else "ACTIVE",
            "is_suspended": ((event.status or "").upper() == "SUSPENDED") if event else False,
            "event_code": event.event_code if (event and event.event_code) else (f"EVT-{str(event.id)[:8].upper()}" if event else ""),
            "title": booking.title or "",
            "first_name": booking.first_name or "",
            "last_name": booking.last_name or "",
            "email": booking.email or "",
            "email_id": booking.email or "",
            "mobile": booking.mobile or "",
            "mobile_number": booking.mobile or "",
            "designation": booking.designation or "",
            "company_name": booking.company_name or "",
            "company_type": comp_type,
            "industry_type": ind_type,
            "company_website": comp_web,
            "business_description": biz_desc,
            "exhibitor_notes": notes,
            "gstin": exh_p.gstin if exh_p else None,
            "pan_number": mask_pan_number(decrypt_field(exh_p.pan_number)) if exh_p else None,
            "country": booking.country or "",
            "state": booking.state or "",
            "city": booking.city or "",
            "address": booking.address or "",
            "pin_code": booking.pin_code or "",
            "postal_code": booking.pin_code or "",
            "stall_area": booking.stall_area,
            "stall_size": pricing.get("stall_size", ""),
            "products": booking.products,
            "messages": booking.messages,
            "price_paid": raw_price,
            "price": raw_price,
            "rental_price": raw_price,
            "base_price": pricing.get("base_price", 0.0),
            "prime_price": pricing.get("prime_price", 0.0),
            "total_price": raw_price,
            "status": booking.status,
            "visiting_card": booking.visiting_card,
            "created_at": str(booking.created_at) if booking.created_at else None
        }

        if booking.visiting_card:
            file_path = booking.visiting_card.replace("\\", "/")
            relative_path = file_path.split("/uploads/")[-1] if "/uploads/" in file_path else os.path.basename(file_path)
            b_dict["visiting_card_url"] = f"{base_url}/uploads/{relative_path}"
        else:
            b_dict["visiting_card_url"] = None

        return b_dict

    @staticmethod
    def add_visitor_lead(data: dict) -> dict:
        # Build enriched notes if extra fields are present
        notes_parts = []
        if data.get("designation"):
            notes_parts.append(f"[Designation: {data['designation']}]")
        if data.get("products_interested"):
            notes_parts.append(f"[Interested In: {data['products_interested']}]")
        if data.get("notes"):
            notes_parts.append(data["notes"])

        if notes_parts:
            data["notes"] = " ".join(notes_parts)

        lead = ExhibitorRepository.create_lead(data)
        return {
            "message": "Visitor lead added successfully!",
            "lead_id": str(lead.id)
        }

    @staticmethod
    def get_visitor_leads(event_id: str, user_id: str, search: str = None) -> list[dict]:
        leads = ExhibitorRepository.get_leads_by_event(event_id, user_id, search=search)
        data = []
        for lead in leads:
            data.append({
                "id": str(lead.id),
                "event_id": str(lead.event_id) if lead.event_id else None,
                "user_id": str(lead.user_id) if lead.user_id else None,
                "visitor_name": lead.visitor_name,
                "company_name": lead.company_name,
                "email": lead.email,
                "mobile": lead.mobile,
                "buying_intent": lead.buying_intent,
                "notes": lead.notes,
                "created_at": str(lead.created_at) if lead.created_at else None
            })
        return data

    @staticmethod
    def get_event_booking_status(event_id: str, user_id: str = None, email: str = None) -> dict:
        existing = ExhibitorRepository.get_existing_booking(
            email=email,
            event_id=event_id,
            user_id=user_id,
            active_only=True
        )
        if not existing:
            return {"has_booking": False, "booking": None}
        return {
            "has_booking": True,
            "booking": {
                "id": str(existing.id),
                "event_id": str(existing.event_id) if existing.event_id else None,
                "status": existing.status or "pending",
                "stall_area": existing.stall_area,
                "company_name": existing.company_name,
                "price_paid": getattr(existing, "price_paid", 10000),
                "created_at": str(existing.created_at) if existing.created_at else None,
            }
        }
