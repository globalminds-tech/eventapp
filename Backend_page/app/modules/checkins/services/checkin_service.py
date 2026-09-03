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
        gate_name: Optional[str] = None
    ) -> dict:
        is_checkout = str(action).upper() in ["CHECK_OUT", "CHECKOUT", "OUT"]

        if is_checkout:
            success, booking, message = UserRepository.mark_booking_checkout(code_or_id, scanner_id=scanner_id, gate_name=gate_name)
        else:
            success, booking, message = UserRepository.mark_booking_checkin(code_or_id, scanner_id=scanner_id, gate_name=gate_name)

        if not booking:
            raise ApiError("Invalid Ticket / Booking not found", 404)
        if not success:
            raise ApiError(message or ("Already checked in" if not is_checkout else "Already checked out"), 400)

        return {
            "message": message,
            "action": "CHECK_OUT" if is_checkout else "CHECK_IN",
            "booking_id": str(booking.id),
            "ticket_code": getattr(booking, "ticket_code", str(booking.id)),
            "is_checked_in": getattr(booking, "is_checked_in", True),
            "is_checked_out": getattr(booking, "is_checked_out", False),
            "timestamp": str(booking.checkout_at if is_checkout else booking.checkin_at or "")
        }
