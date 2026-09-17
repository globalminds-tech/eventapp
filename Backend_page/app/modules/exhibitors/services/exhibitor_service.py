import os
from werkzeug.utils import secure_filename
from app.exceptions.api_error import ApiError
from app.modules.exhibitors.repository.exhibitor_repository import ExhibitorRepository

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

        if ExhibitorRepository.get_existing_booking(email, event_id):
            raise ApiError("You have already booked a stall for this event", 400)

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
            "title": form_data.get("title"),
            "first_name": form_data.get("firstName") or form_data.get("first_name"),
            "last_name": form_data.get("lastName") or form_data.get("last_name"),
            "email": email,
            "mobile": form_data.get("mobile"),
            "designation": form_data.get("designation"),
            "company_name": form_data.get("companyName") or form_data.get("company_name"),
            "country": form_data.get("country"),
            "state": form_data.get("state"),
            "city": form_data.get("city"),
            "address": form_data.get("address"),
            "pin_code": form_data.get("pinCode") or form_data.get("pin_code"),
            "stall_area": form_data.get("stallArea") or form_data.get("stall_area"),
            "products": form_data.get("products"),
            "messages": form_data.get("message"),
            "visiting_card": visiting_card_path
        }

        booking = ExhibitorRepository.create_stall_booking(data_dict)
        return {
            "message": "Stall booked successfully!",
            "booking_id": str(booking.id)
        }

    @staticmethod
    def get_user_bookings(user_id, host_url: str = "") -> list[dict]:
        rows = ExhibitorRepository.get_user_bookings(user_id)
        data = []
        base_url = host_url.rstrip("/")

        for row in rows:
            booking = row[0]
            event_name = row[1] if len(row) > 1 else ""
            ev_status = row[2] if len(row) > 2 else "ACTIVE"
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
                "mobile": booking.mobile,
                "designation": booking.designation,
                "company_name": booking.company_name,
                "country": booking.country,
                "state": booking.state,
                "city": booking.city,
                "address": booking.address,
                "pin_code": booking.pin_code,
                "stall_area": booking.stall_area,
                "products": booking.products,
                "messages": booking.messages,
                "status": booking.status,
                "visiting_card": booking.visiting_card,
                "price_paid": getattr(booking, "price_paid", 45000),
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
        
        event = None
        if booking.event_id:
            event = db.session.get(EventDetails, booking.event_id)
            
        b_dict = {
            "id": str(booking.id),
            "event_id": str(booking.event_id) if booking.event_id else None,
            "user_id": str(booking.user_id) if booking.user_id else None,
            "eventName": event.event_name if event else getattr(booking, "event_name", ""),
            "event_name": event.event_name if event else getattr(booking, "event_name", ""),
            "event_status": (event.status or "ACTIVE").upper() if event else "ACTIVE",
            "is_suspended": ((event.status or "").upper() == "SUSPENDED") if event else False,
            "event_code": event.event_code if event else None,
            "title": booking.title,
            "first_name": booking.first_name,
            "last_name": booking.last_name,
            "email": booking.email,
            "mobile": booking.mobile,
            "designation": booking.designation,
            "company_name": booking.company_name,
            "company_type": getattr(booking, "company_type", ""),
            "industry_type": getattr(booking, "industry_type", ""),
            "company_website": getattr(booking, "company_website", ""),
            "business_description": getattr(booking, "business_description", ""),
            "country": booking.country,
            "state": booking.state,
            "city": booking.city,
            "address": booking.address,
            "pin_code": booking.pin_code,
            "postal_code": booking.pin_code,
            "stall_area": booking.stall_area,
            "products": booking.products,
            "messages": booking.messages,
            "price_paid": getattr(booking, "price_paid", 45000),
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
        lead = ExhibitorRepository.create_lead(data)
        return {
            "message": "Visitor lead added successfully!",
            "lead_id": str(lead.id)
        }

    @staticmethod
    def get_visitor_leads(event_id: str, user_id: str) -> list[dict]:
        leads = ExhibitorRepository.get_leads_by_event(event_id, user_id)
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
