from app.exceptions.api_error import ApiError
from app.modules.checkins.repository.checkin_repository import CheckinRepository
from app.modules.checkins.schemas.checkin_schema import CheckinRequestSchema

class CheckinService:
    @staticmethod
    def checkin_attendee(booking_id: int) -> dict:
        success, booking = CheckinRepository.mark_scanned(booking_id)
        if not booking:
            raise ApiError("Booking not found", 404)
        if not success:
            raise ApiError("Ticket has already been scanned/checked in", 400)
        return {"message": "Check-in successful", "booking_id": booking_id}
