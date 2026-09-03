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
