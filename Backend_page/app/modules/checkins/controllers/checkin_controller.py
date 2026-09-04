from typing import Optional
from app.modules.checkins.services.checkin_service import CheckinService

class CheckinController:
    @staticmethod
    def checkin_attendee(
        code_or_id: str | int,
        action: str = "CHECK_IN",
        scanner_id: Optional[str] = None,
        gate_name: Optional[str] = None
    ):
        result = CheckinService.checkin_attendee(
            code_or_id=code_or_id,
            action=action,
            scanner_id=scanner_id,
            gate_name=gate_name
        )
        return {
            "success": True,
            "data": result
        }

    @staticmethod
    def get_events_summary(organizer_id: Optional[str] = None):
        result = CheckinService.get_events_summary(organizer_id=organizer_id)
        return {
            "success": True,
            "data": result
        }

    @staticmethod
    def get_event_attendees(event_id: str):
        result = CheckinService.get_event_attendees(event_id)
        return {
            "success": True,
            "data": result
        }

    @staticmethod
    def get_food_summary(organizer_id: Optional[str] = None):
        result = CheckinService.get_food_summary(organizer_id=organizer_id)
        return {
            "success": True,
            "data": result
        }

    @staticmethod
    def redeem_food_token(code_or_id: str):
        result = CheckinService.redeem_food_token(code_or_id)
        return {
            "success": True,
            "data": result
        }

    @staticmethod
    def get_addons(organizer_id: Optional[str] = None):
        result = CheckinService.get_addons(organizer_id=organizer_id)
        return {
            "success": True,
            "data": result
        }

