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

        if ExhibitorRepository.get_existing_booking(email, event_id):
            raise ApiError("You have already booked a stall for this event", 400)

        visiting_card_path = None
        if file_obj:
            filename = secure_filename(file_obj.filename)
            visiting_card_path = os.path.join(upload_folder, filename)
            file_obj.save(visiting_card_path)

        data_dict = {
            "user_id": form_data.get("user_id"),
            "event_id": event_id,
            "eventName": form_data.get("eventName"),
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
            "booking_id": booking.id
        }

    @staticmethod
    def get_user_bookings(user_id: int, host_url: str = "") -> list[dict]:
        rows = ExhibitorRepository.get_user_bookings(user_id)
        data = []
        base_url = host_url.rstrip("/")

        for booking, event_name in rows:
            b_dict = {
                "id": booking.id,
                "event_id": booking.event_id,
                "user_id": booking.user_id,
                "eventName": event_name or booking.eventName,
                "event_name": event_name,
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
    def get_booking_by_id(booking_id: int, host_url: str = "") -> dict:
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
            "id": booking.id,
            "event_id": booking.event_id,
            "user_id": booking.user_id,
            "eventName": event.event_name if event else getattr(booking, "eventName", ""),
            "event_name": event.event_name if event else getattr(booking, "eventName", ""),
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
