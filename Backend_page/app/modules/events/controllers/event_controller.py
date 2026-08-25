from app.modules.events.services.event_service import EventService

class EventController:
    @staticmethod
    def get_all_events():
        events = EventService.get_all_events()
        return {
            "success": True,
            "data": events
        }

    @staticmethod
    def get_events_summary():
        summaries = EventService.get_events_summary()
        return {
            "success": True,
            "data": summaries
        }

    @staticmethod
    def get_event(event_id: int):
        event = EventService.get_event_detail(event_id)
        return {
            "success": True,
            "data": event
        }

    @staticmethod
    def create_event(raw_data: dict, user_id: int = None):
        event = EventService.create_event(raw_data, user_id)
        return {
            "success": True,
            "data": event
        }

    @staticmethod
    def update_event(event_id: int, raw_data: dict):
        event = EventService.update_event(event_id, raw_data)
        return {
            "success": True,
            "data": event
        }

    @staticmethod
    def delete_event(event_id: int):
        result = EventService.delete_event(event_id)
        return {
            "success": True,
            "data": result
        }
