from app.modules.stalls.services.stall_service import StallService

class StallController:
    @staticmethod
    def get_event_stalls(event_id: int):
        data = StallService.get_event_stalls(event_id)
        return {
            "success": True,
            "data": data
        }
