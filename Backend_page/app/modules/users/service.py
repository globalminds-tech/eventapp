import qrcode
import io
import base64
from app.Services.otp_service import is_verified, clear_verified
from app.Services.mail_service import send_booking_email
from app.modules.users.repository import UserRepository

class UserService:
    @staticmethod
    def book_event(event_id: int, name: str, email: str, phone: str = None, food_preference: str = "None"):
        email_clean = email.strip().lower()
        if not is_verified(email_clean):
            return {"status": False, "error": "Please verify OTP first", "code": 403}

        event = UserRepository.get_event_by_id(event_id)
        if not event:
            return {"status": False, "error": "Event not found", "code": 404}

        booking = UserRepository.create_booking(event_id, name, email_clean, phone, food_preference)
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
            f"Food: {food_preference}\n"
            f"Verify: https://events.sportalytics.in/validate-booking/{booking_id}"
        )

        UserRepository.update_qr_data(booking_id, qr_text)

        qr = qrcode.QRCode(version=1, box_size=10, border=4)
        qr.add_data(qr_text)
        qr.make(fit=True)
        img = qr.make_image(fill_color="black", back_color="white")

        buffered = io.BytesIO()
        img.save(buffered, format="PNG")
        qr_base64 = base64.b64encode(buffered.getvalue()).decode()

        try:
            event_dict = {
                "event_name": event.event_name,
                "venue": event.venue,
                "address": event.address,
                "start_date": formatted_date,
                "start_time": str(event.start_time or "N/A")
            }
            send_booking_email(email_clean, name, event_dict, qr_base64, food_preference)
        except Exception as mail_err:
            print(f"⚠️ Email failed but booking was saved: {mail_err}")

        clear_verified(email_clean)

        return {
            "status": True,
            "code": 200,
            "data": {
                "message": "Booking successful",
                "booking_id": booking_id,
                "qr_code": qr_base64,
                "event_details": {
                    "name": event.event_name,
                    "venue": event.venue,
                    "address": event.address,
                    "date": formatted_date,
                    "time": str(event.start_time or 'N/A'),
                    "food": food_preference
                }
            }
        }

    @staticmethod
    def validate_qr(booking_id: int):
        result = UserRepository.get_booking_with_event(booking_id)
        if not result:
            return {"status": False, "error": "Invalid Ticket / Booking not found", "code": 404}

        booking, event = result

        if booking.is_scanned:
            status_text = "already_scanned"
            message_text = "This ticket has already been used"
        else:
            UserRepository.mark_booking_scanned(booking_id)
            status_text = "success"
            message_text = "Ticket Verified Successfully"

        return {
            "status": True,
            "code": 200,
            "data": {
                "status": status_text,
                "message": message_text,
                "user_name": booking.name,
                "user_email": booking.email,
                "user_phone": booking.phone,
                "food_preference": booking.food_preference,
                "event_name": event.event_name,
                "event_venue": event.venue,
                "event_date": str(event.start_date)
            }
        }
