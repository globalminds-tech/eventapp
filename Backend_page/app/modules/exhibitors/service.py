import os
from app.modules.exhibitors.repository import ExhibitorRepository

class ExhibitorService:
    @staticmethod
    def book_stall(form_data: dict, file_obj, upload_folder: str):
        email = form_data.get("email")
        event_id = form_data.get("event_id")

        if ExhibitorRepository.get_existing_booking(email, event_id):
            return {"success": False, "message": "You have already booked this event!", "code": 400}

        visiting_card_path = None
        if file_obj:
            from werkzeug.utils import secure_filename
            filename = secure_filename(file_obj.filename)
            visiting_card_path = os.path.join(upload_folder, filename)
            file_obj.save(visiting_card_path)

        data_dict = {
            "user_id": form_data.get("user_id"),
            "event_id": event_id,
            "eventName": form_data.get("eventName"),
            "title": form_data.get("title"),
            "first_name": form_data.get("firstName"),
            "last_name": form_data.get("lastName"),
            "email": email,
            "mobile": form_data.get("mobile"),
            "designation": form_data.get("designation"),
            "company_name": form_data.get("companyName"),
            "country": form_data.get("country"),
            "state": form_data.get("state"),
            "city": form_data.get("city"),
            "address": form_data.get("address"),
            "pin_code": form_data.get("pinCode"),
            "stall_area": form_data.get("stallArea"),
            "products": form_data.get("products"),
            "messages": form_data.get("message"),
            "visiting_card": visiting_card_path
        }

        ExhibitorRepository.create_stall_booking(data_dict)
        return {"success": True, "message": "Stall booked successfully!", "code": 200}

    @staticmethod
    def get_user_bookings(user_id: int, host_url: str):
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
                b_dict["visiting_card_url"] = f"{base_url}/exhibitor/uploads/{relative_path}"
            else:
                b_dict["visiting_card_url"] = None

            data.append(b_dict)

        return {"success": True, "data": data}
