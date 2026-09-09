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

def check_event_concluded(event) -> bool:
    """Returns True if the event end_date (or end_date + end_time) is in the past."""
    from datetime import datetime, date, time
    today = datetime.now().date()
    now_time = datetime.now().time()

    ev_end_date = getattr(event, "end_date", None) or getattr(event, "start_date", None)
    if not ev_end_date:
        return False
    if isinstance(ev_end_date, datetime):
        ev_end_date = ev_end_date.date()
    elif isinstance(ev_end_date, str):
        try:
            ev_end_date = datetime.strptime(ev_end_date.split("T")[0], "%Y-%m-%d").date()
        except Exception:
            return False

    if today > ev_end_date:
        return True
    elif today == ev_end_date:
        ev_end_time = getattr(event, "end_time", None)
        if ev_end_time:
            if isinstance(ev_end_time, str):
                try:
                    parts = ev_end_time.split(":")
                    ev_end_time = time(int(parts[0]), int(parts[1]))
                except Exception:
                    return False
            if isinstance(ev_end_time, time) and now_time > ev_end_time:
                return True
    return False

class UserService:
    @staticmethod
    def get_profile(user_id) -> dict:
        user = UserRepository.get_user_by_id(user_id)
        if not user:
            raise ApiError("User not found", 404)
        return user.to_dict()

    @staticmethod
    def update_profile(user_id, raw_data: dict) -> dict:
        data = UpdateProfileSchema(**raw_data)
        updated_user = UserRepository.update_user_profile(user_id, data.dict(exclude_unset=True))
        if not updated_user:
            raise ApiError("User not found", 404)
        return updated_user.to_dict()

    @staticmethod
    def book_event(raw_data: dict) -> dict:
        data = BookEventSchema(**raw_data)
        if not data.user_id:
            raise ApiError("Authentication required: Valid user ID is mandatory to book an event pass.", 401)

        email_clean = data.email.strip().lower()

        event = UserRepository.get_event_by_id(data.event_id)
        if not event:
            raise ApiError("Event not found", 404)

        event_status = (getattr(event, "status", None) or "Active").strip().upper()
        if event_status == "SUSPENDED":
            raise ApiError("This event is currently suspended by administration and cannot accept bookings.", 400)
        if event_status not in ["APPROVED", "ACTIVE", "LIVE", "PUBLISHED"]:
            raise ApiError(f"This event is currently in '{event_status}' status and not open for public booking.", 400)

        # 0. Validate Event Concluded / Date Over
        if check_event_concluded(event):
            raise ApiError("This event has already concluded. Ticket bookings are closed.", 400)

        booking_settings = UserRepository.get_event_booking_details(event.id)

        # 1. Validate Booking Date Window
        from datetime import datetime, date
        today = datetime.now().date()
        b_start_val = getattr(booking_settings, "booking_start_date", None) or getattr(event, "booking_start_date", None)
        if b_start_val:
            b_start = b_start_val.date() if isinstance(b_start_val, datetime) else b_start_val
            if today < b_start:
                raise ApiError(f"Bookings for this event will open on {b_start.strftime('%d/%m/%Y')}.", 400)

        b_end_val = getattr(booking_settings, "booking_end_date", None) or getattr(event, "booking_end_date", None)
        if b_end_val:
            b_end = b_end_val.date() if isinstance(b_end_val, datetime) else b_end_val
            if today > b_end:
                raise ApiError("Ticket bookings for this event are closed.", 400)

        # 2. Validate Capacity & Calculate Seats
        total_capacity = int(getattr(booking_settings, "capacity", 0) or getattr(event, "capacity", 0) or 0)
        qty = int(data.quantity or 1)
        grp_size = int(data.group_size or 1) if data.pass_type == "Group Pass" else 1
        requested_seats = grp_size * qty

        if total_capacity > 0:
            booked_seats = UserRepository.get_event_total_booked_seats(data.event_id)
            if booked_seats + requested_seats > total_capacity:
                remaining = max(0, total_capacity - booked_seats)
                if remaining == 0:
                    raise ApiError("This event is completely sold out.", 400)
                raise ApiError(f"Insufficient seats. Only {remaining} seat(s) available.", 400)

        # 3. Validate Max Pass Limit Per Booking
        max_pass = int(getattr(booking_settings, "max_pass", 0) or getattr(event, "max_pass", 0) or 0)
        if max_pass > 0 and qty > max_pass:
            raise ApiError(f"You can only book up to {max_pass} pass(es) per booking.", 400)

        # 4. Save Booking with full provision snapshots
        booking = UserRepository.create_booking(
            event_id=data.event_id,
            user_id=data.user_id,
            name=data.name,
            email=email_clean,
            phone=data.phone,
            food_preference=data.food_preference or "None",
            ticket_count=qty,
            pass_type=data.pass_type or "Single Pass",
            group_size=grp_size,
            food_details=data.food_details,
            vehicle_details=data.vehicle_details,
            vehicle_number=data.vehicle_number,
            subtotal_amount=float(data.subtotal_amount or 0),
            tax_amount=float(data.tax_amount or 0),
            amount_paid=float(data.amount_paid or 0),
            currency_code=data.currency_code or "INR"
        )
        booking_id = str(booking.id)
        ticket_code = booking.ticket_code or UserRepository.generate_ticket_code(data.event_id)

        formatted_date = str(event.start_date)
        if event.start_date:
            try:
                formatted_date = event.start_date.strftime("%d/%m/%Y")
            except Exception:
                pass

        # Production Standard QR Payload: Encode ONLY the secure ticket code (or verification URL)
        qr_text = ticket_code

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
                "category": getattr(event, "category", "") or "",
                "venue": event.venue,
                "address": event.address,
                "start_date": formatted_date,
                "start_time": str(event.start_time or "N/A"),
                "booking_id": booking_id,
                "ticket_code": ticket_code,
                "pass_type": data.pass_type or "Single Pass",
                "group_size": grp_size,
                "ticket_count": qty,
                "requested_seats": requested_seats,
                "phone": data.phone or "",
                "food_preference": data.food_preference or "None",
                "food_details": data.food_details,
                "vehicle_details": data.vehicle_details,
                "vehicle_number": data.vehicle_number or "",
                "subtotal_amount": float(data.subtotal_amount or 0),
                "tax_amount": float(data.tax_amount or 0),
                "amount_paid": float(data.amount_paid or 0),
                "currency_code": data.currency_code or "INR"
            }
            send_booking_email(email_clean, data.name, event_dict, qr_base64, data.food_preference)
        except Exception as mail_err:
            print(f"⚠️ Email failed but booking was saved: {mail_err}")

        clear_verified(email_clean)

        return {
            "booking_id": booking_id,
            "ticket_code": ticket_code,
            "qr_code": qr_base64,
            "ticket_count": qty,
            "pass_type": data.pass_type or "Single Pass",
            "group_size": grp_size,
            "amount_paid": float(data.amount_paid or 0),
            "food_details": data.food_details,
            "vehicle_details": data.vehicle_details,
            "vehicle_number": data.vehicle_number,
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
    def validate_qr(code_or_id: str) -> dict:
        result = UserRepository.get_booking_with_event(code_or_id)
        if not result:
            raise ApiError("Invalid Ticket / Booking not found", 404)

        booking, event = result

        if check_event_concluded(event):
            return {
                "status": "event_concluded",
                "message": "This event has already concluded. This pass is no longer valid for entry.",
                "details": {
                    "ticket_code": getattr(booking, "ticket_code", str(booking.id)),
                    "visitor_name": getattr(booking, "name", "Attendee"),
                    "event_name": getattr(event, "event_name", getattr(event, "name", "Event")),
                    "venue": getattr(event, "venue", getattr(event, "city", "Main Venue")),
                    "date": str(getattr(event, "start_date", getattr(event, "event_date", ""))),
                    "time": str(getattr(event, "start_time", "10:00 AM")),
                    "food": getattr(booking, "food_preference", "Veg"),
                    "include_food": False,
                    "scanned_at": None
                }
            }

        if booking.is_scanned:
            status_text = "already_scanned"
            message_text = "This ticket has already been used"
        else:
            UserRepository.mark_booking_scanned(code_or_id)
            status_text = "success"
            message_text = "Ticket Verified Successfully"

        return {
            "status": status_text,
            "message": message_text,
            "details": {
                "ticket_code": getattr(booking, "ticket_code", str(booking.id)),
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
    def get_my_bookings(email: Optional[str] = None, user_id: Optional[str] = None) -> list[dict]:
        return UserRepository.get_user_bookings(email=email, user_id=user_id)
