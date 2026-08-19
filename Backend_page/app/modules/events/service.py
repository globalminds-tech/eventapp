from app.modules.events.repository import EventRepository

class EventService:
    @staticmethod
    def get_events_summary():
        events = EventRepository.get_all_event_summaries()
        return {"status": True, "data": events}

    @staticmethod
    def get_event_detail(event_id: int):
        event = EventRepository.get_event_by_id(event_id)
        if not event:
            return {"status": False, "message": "Event not found"}, 404
        return {"status": True, "data": event}, 200
