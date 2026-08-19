from app.modules.checkins.repository import CheckinRepository

class CheckinService:
    @staticmethod
    def checkin_attendee(booking_id: int):
        success, booking = CheckinRepository.mark_scanned(booking_id)
        if not booking:
            return {"status": False, "message": "Booking not found"}, 404
        if not success:
            return {"status": False, "message": "Already checked in"}, 400
        return {"status": True, "message": "Check-in successful"}, 200
