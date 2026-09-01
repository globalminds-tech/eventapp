import io
import base64
from typing import Optional
from app.exceptions.api_error import ApiError
from app.Services.otp_service import is_verified, clear_verified
from app.Services.mail_service import send_booking_email
from app.modules.users.repository.user_repository import UserRepository
from app.modules.users.schemas.user_schema import BookEventSchema, UpdateProfileSchema

try:
    import qrcode
except ImportError:
    qrcode = None

class UserService:
    @staticmethod
    def get_profile(user_id: int) -> dict:
        user = UserRepository.get_user_by_id(user_id)
        if not user:
            raise ApiError("User not found", 404)
        return user.to_dict()

    @staticmethod
    def update_profile(user_id: int, raw_data: dict) -> dict:
        data = UpdateProfileSchema(**raw_data)
        updated_user = UserRepository.update_user_profile(user_id, data.dict(exclude_unset=True))
        if not updated_user:
            raise ApiError("User not found", 404)
        return updated_user.to_dict()

    @staticmethod
    def book_event(raw_data: dict) -> dict:
        data = BookEventSchema(**raw_data)
        email_clean = data.email.strip().lower()

        event = UserRepository.get_event_by_id(data.event_id)
        if not event:
            raise ApiError("Event not found", 404)

        booking = UserRepository.create_booking(
            event_id=data.event_id,
            user_id=data.user_id,
            name=data.name,
            email=email_clean,
            phone=data.phone,
            food_preference=data.food_preference
        )
        booking_id = booking.id

        formatted_date = str(event.start_date)
        if event.start_date:
            try:
                formatted_date = event.start_date.strftime("%d/%m/%Y")
            except Exception:
                pass

        qr_text = (
            f"Event: {event.event_name}\n"
            f"Date: {formatted_date}\n"
            f"Food: {data.food_preference}\n"
            f"Verify: https://events.sportalytics.in/validate-booking/{booking_id}"
        )

        UserRepository.update_qr_data(booking_id, qr_text)

        qr_base64 = ""
        if qrcode is not None:
            try:
                qr = qrcode.QRCode(version=1, box_size=10, border=4)
                qr.add_data(qr_text)
                qr.make(fit=True)
                img = qr.make_image(fill_color="black", back_color="white")

                buffered = io.BytesIO()
                img.save(buffered)
                qr_base64 = base64.b64encode(buffered.getvalue()).decode()
            except Exception as qr_err:
                print(f"QR code generation error: {qr_err}")

        try:
            event_dict = {
                "event_name": event.event_name,
                "venue": event.venue,
                "address": event.address,
                "start_date": formatted_date,
                "start_time": str(event.start_time or "N/A")
            }
            send_booking_email(email_clean, data.name, event_dict, qr_base64, data.food_preference)
        except Exception as mail_err:
            print(f"⚠️ Email failed but booking was saved: {mail_err}")

        clear_verified(email_clean)

        return {
            "booking_id": booking_id,
            "qr_code": qr_base64,
            "event_details": {
                "name": event.event_name,
                "venue": event.venue,
                "address": event.address,
                "date": formatted_date,
                "time": str(event.start_time or 'N/A'),
                "food": data.food_preference
            }
        }

    @staticmethod
    def validate_qr(booking_id: int) -> dict:
        result = UserRepository.get_booking_with_event(booking_id)
        if not result:
            raise ApiError("Invalid Ticket / Booking not found", 404)

        booking, event = result
        if booking.is_scanned:
            status_text = "already_scanned"
            message_text = "This ticket has already been used"
        else:
            UserRepository.mark_booking_scanned(booking_id)
            status_text = "success"
            message_text = "Ticket Verified Successfully"

        return {
            "status": status_text,
            "message": message_text,
            "details": {
                "visitor_name": getattr(booking, "name", "Attendee"),
                "event_name": getattr(event, "event_name", getattr(event, "name", "Event")),
                "venue": getattr(event, "venue", getattr(event, "city", "Main Venue")),
                "date": str(getattr(event, "start_date", getattr(event, "event_date", ""))),
                "time": str(getattr(event, "start_time", "10:00 AM")),
                "food": getattr(booking, "food_preference", "Veg"),
                "include_food": True,
                "scanned_at": str(getattr(booking, "scanned_at", "")) if getattr(booking, "scanned_at", None) else None
            },
            "user_name": getattr(booking, "name", "Attendee"),
            "user_email": getattr(booking, "email", ""),
            "user_phone": getattr(booking, "phone", ""),
            "food_preference": getattr(booking, "food_preference", "Veg"),
            "event_name": getattr(event, "event_name", getattr(event, "name", "Event")),
            "event_venue": getattr(event, "venue", getattr(event, "city", "Main Venue")),
            "event_date": str(getattr(event, "start_date", getattr(event, "event_date", "")))
        }

    @staticmethod
    def get_my_bookings(email: Optional[str] = None, user_id: Optional[int] = None) -> list[dict]:
        return UserRepository.get_user_bookings(email=email, user_id=user_id)
