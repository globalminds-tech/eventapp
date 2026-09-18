from typing import Optional
from app.modules.checkins.services.checkin_service import CheckinService

class CheckinController:
    @staticmethod
    def checkin_attendee(
        code_or_id: str | int,
        action: str = "CHECK_IN",
        scanner_id: Optional[str] = None,
        gate_name: Optional[str] = None,
        event_id: Optional[str] = None,
        override_duplicate: bool = False
    ):
        result = CheckinService.checkin_attendee(
            code_or_id=code_or_id,
            action=action,
            scanner_id=scanner_id,
            gate_name=gate_name,
            event_id=event_id,
            override_duplicate=override_duplicate
        )
        return {
            "success": True,
            "data": result
        }

    @staticmethod
    def get_event_checkin_logs(event_id: str):
        result = CheckinService.get_event_checkin_logs(event_id)
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
    def get_event_attendees(
        event_id: str,
        search: Optional[str] = None,
        status: Optional[str] = None,
        page: Optional[int] = None,
        limit: Optional[int] = None
    ):
        result = CheckinService.get_event_attendees(
            event_id,
            search=search,
            status=status,
            page=page,
            limit=limit
        )
        if isinstance(result, dict):
            return {
                "success": True,
                "data": result.get("attendees", []),
                "counts": result.get("counts", {}),
                "total": result.get("total", 0)
            }
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
    def redeem_food_token(code_or_id: str, event_id: Optional[str] = None, counter_name: Optional[str] = None):
        result = CheckinService.redeem_food_token(code_or_id, event_id=event_id, counter_name=counter_name)
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

    @staticmethod
    def get_gate_presets(organizer_id: str):
        result = CheckinService.get_gate_presets(organizer_id)
        return {
            "success": True,
            "data": result
        }

    @staticmethod
    def add_gate_preset(name: str, organizer_id: str):
        result = CheckinService.add_gate_preset(name, organizer_id)
        return {
            "success": True,
            "data": result
        }

    @staticmethod
    def delete_gate_preset(gate_id: str, organizer_id: str):
        result = CheckinService.delete_gate_preset(gate_id, organizer_id)
        return {
            "success": True,
            "message": "Gate deleted successfully"
        }

    @staticmethod
    def get_food_counter_presets(organizer_id: str):
        result = CheckinService.get_food_counter_presets(organizer_id)
        return {
            "success": True,
            "data": result
        }

    @staticmethod
    def add_food_counter_preset(name: str, organizer_id: str):
        result = CheckinService.add_food_counter_preset(name, organizer_id)
        return {
            "success": True,
            "data": result
        }

    @staticmethod
    def delete_food_counter_preset(counter_id: str, organizer_id: str):
        result = CheckinService.delete_food_counter_preset(counter_id, organizer_id)
        return {
            "success": True,
            "message": "Food counter deleted successfully"
        }

