from app.exceptions.api_error import ApiError
from app.modules.checkins.repository.checkin_repository import CheckinRepository
from app.modules.checkins.schemas.checkin_schema import CheckinRequestSchema

from typing import Optional

from app.modules.users.repository.user_repository import UserRepository

class CheckinService:
    @staticmethod
    def checkin_attendee(
        code_or_id: str,
        action: str = "CHECK_IN",
        scanner_id: Optional[str] = None,
        gate_name: Optional[str] = None,
        event_id: Optional[str] = None,
        override_duplicate: bool = False
    ) -> dict:
        from datetime import datetime
        from app.models.event import EventDetails
        from app.extensions.database import db

        is_checkout = str(action).upper() in ["CHECK_OUT", "CHECKOUT", "OUT"]

        if is_checkout:
            success, booking, message, status_code = UserRepository.mark_booking_checkout(
                code_or_id,
                scanner_id=scanner_id,
                gate_name=gate_name,
                expected_event_id=event_id
            )
        else:
            success, booking, message, status_code = UserRepository.mark_booking_checkin(
                code_or_id,
                scanner_id=scanner_id,
                gate_name=gate_name,
                expected_event_id=event_id,
                override_duplicate=override_duplicate
            )

        if not booking:
            raise ApiError("Invalid Ticket: Pass code not found in registry", 404)

        event = db.session.get(EventDetails, booking.event_id)

        attendee_data = {
            "id": str(booking.id),
            "booking_id": str(booking.id),
            "name": booking.name,
            "email": booking.email,
            "phone": booking.phone or "N/A",
            "ticket_code": booking.ticket_code or f"BME-{str(booking.id)[:8].upper()}",
            "food_preference": booking.food_preference or "None",
            "is_checked_in": bool(booking.is_checked_in),
            "is_checked_out": bool(booking.is_checked_out),
            "checkin_at": booking.checkin_at.isoformat() if booking.checkin_at else None,
            "checkout_at": booking.checkout_at.isoformat() if booking.checkout_at else None,
            "checkin_time": booking.checkin_at.strftime("%I:%M %p") if booking.checkin_at else "",
            "checkout_time": booking.checkout_at.strftime("%I:%M %p") if booking.checkout_at else "",
            "total_checkins": booking.total_checkins or 0,
            "total_checkouts": booking.total_checkouts or 0,
        }

        event_data = {
            "id": str(event.id) if event else str(booking.event_id),
            "name": event.event_name if event else "Event",
            "code": event.event_code if event else "",
            "venue": event.venue if event else "Venue",
        }

        payload = {
            "success": success,
            "status": status_code,
            "message": message,
            "action": "CHECK_OUT" if is_checkout else "CHECK_IN",
            "gate_name": gate_name or ("EXIT_GATE" if is_checkout else "MAIN_GATE"),
            "scanner_id": scanner_id or "GATE_SCANNER",
            "attendee": attendee_data,
            "event": event_data,
            "timestamp": (booking.checkout_at if is_checkout else booking.checkin_at or datetime.utcnow()).isoformat()
        }

        if not success:
            raise ApiError(message, 400, data=payload)

        return payload

    @staticmethod
    def get_events_summary(organizer_id: Optional[str] = None):
        return CheckinRepository.get_events_checkin_summary(organizer_id)

    @staticmethod
    def get_event_attendees(event_id: str):
        return CheckinRepository.get_event_attendees(event_id)

    @staticmethod
    def get_event_checkin_logs(event_id: str):
        return CheckinRepository.get_event_checkin_logs(event_id)

    @staticmethod
    def get_food_summary(organizer_id: Optional[str] = None):
        return CheckinRepository.get_food_checkin_summary(organizer_id)

    @staticmethod
    def redeem_food_token(code_or_id: str, event_id: Optional[str] = None):
        from app.extensions.database import db
        from app.models.booking import AttendeeCheckinLog
        from datetime import datetime
        
        result = UserRepository.get_booking_with_event(code_or_id)
        if not result:
            raise ApiError("Invalid Food Pass: Ticket code not found in registry", 404)
        booking, event = result

        if event_id:
            try:
                import uuid
                expected_uuid = uuid.UUID(str(event_id))
                if booking.event_id != expected_uuid:
                    raise ApiError("Wrong Event: Ticket belongs to a different event.", 400)
            except Exception:
                if str(booking.event_id) != str(event_id):
                    raise ApiError("Wrong Event: Ticket belongs to a different event.", 400)

        # Check if already redeemed
        existing_log = db.session.query(AttendeeCheckinLog).filter_by(
            booking_id=booking.id,
            action="FOOD_REDEEM"
        ).first()

        if existing_log:
            time_str = existing_log.timestamp.strftime("%I:%M %p") if existing_log.timestamp else "earlier"
            raise ApiError(f"Meal already redeemed at {time_str}!", 400)

        # Log food redemption
        try:
            log_entry = AttendeeCheckinLog(
                booking_id=booking.id,
                ticket_code=booking.ticket_code,
                event_id=booking.event_id,
                action="FOOD_REDEEM",
                gate_name="FOOD_COUNTER",
                scanner_id="FOOD_STAFF",
                timestamp=datetime.utcnow()
            )
            db.session.add(log_entry)
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            print(f"[WARN] Failed to write food redeem log: {e}")

        # The food scanner is designed to scan and view the food preference alone
        return {
            "success": True,
            "status": "FOOD_VERIFIED",
            "message": f"Food Preference: {booking.food_preference or 'None'} (Attendee: {booking.name})",
            "booking_id": str(booking.id),
            "ticket_code": booking.ticket_code or str(booking.id),
            "food_preference": booking.food_preference or "None",
            "name": booking.name
        }

    @staticmethod
    def get_addons(organizer_id: Optional[str] = None):
        return CheckinRepository.get_addon_checkins(organizer_id)


