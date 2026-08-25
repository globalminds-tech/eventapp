from app.modules.checkins.services.checkin_service import CheckinService

class CheckinController:
    @staticmethod
    def checkin_attendee(booking_id: int):
        result = CheckinService.checkin_attendee(booking_id)
        return {
            "success": True,
            "data": result
        }
