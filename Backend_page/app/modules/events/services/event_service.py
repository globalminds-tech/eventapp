from app.exceptions.api_error import ApiError
from app.extensions.redis import redis_cache
from app.modules.events.repository.event_repository import EventRepository
from app.modules.events.schemas.event_schema import CreateEventSchema, UpdateEventSchema

CACHE_KEY_EVENTS_ALL = "events:all"

class EventService:
    @staticmethod
    def get_all_events() -> list[dict]:
        # Try fetching from Redis cache
        cached_events = redis_cache.get_json(CACHE_KEY_EVENTS_ALL)
        if cached_events is not None:
            return cached_events

        # Fallback to DB
        events = EventRepository.get_all()
        result = [e.to_dict() if hasattr(e, "to_dict") else {"id": e.id, "event_name": e.event_name} for e in events]
        
        # Save to Redis cache for 5 minutes (300s)
        redis_cache.set_json(CACHE_KEY_EVENTS_ALL, result, expire_seconds=300)
        return result

    @staticmethod
    def get_events_summary() -> list[dict]:
        return EventRepository.get_all_event_summaries()

    @staticmethod
    def get_event_detail(event_id: int) -> dict:
        cache_key = f"events:detail:{event_id}"
        cached_event = redis_cache.get_json(cache_key)
        if cached_event is not None:
            return cached_event

        event = EventRepository.get_by_id(event_id)
        if not event:
            raise ApiError("Event not found", 404)
        result = event.to_dict() if hasattr(event, "to_dict") else {"id": event.id, "event_name": event.event_name}
        
        redis_cache.set_json(cache_key, result, expire_seconds=300)
        return result

    @staticmethod
    def create_event(raw_data: dict, user_id: int = None) -> dict:
        data = CreateEventSchema(**raw_data)
        event_dict = data.dict(exclude_unset=True)
        if user_id:
            event_dict["created_by"] = user_id

        event = EventRepository.create(event_dict)
        redis_cache.clear_pattern("events:*")
        return event.to_dict() if hasattr(event, "to_dict") else {"id": event.id, "event_name": event.event_name}

    @staticmethod
    def update_event(event_id: int, raw_data: dict) -> dict:
        data = UpdateEventSchema(**raw_data)
        event = EventRepository.update(event_id, data.dict(exclude_unset=True))
        if not event:
            raise ApiError("Event not found", 404)
        redis_cache.clear_pattern("events:*")
        return event.to_dict() if hasattr(event, "to_dict") else {"id": event.id, "event_name": event.event_name}

    @staticmethod
    def delete_event(event_id: int) -> dict:
        success = EventRepository.delete(event_id)
        if not success:
            raise ApiError("Event not found", 404)
        redis_cache.clear_pattern("events:*")
        return {"message": "Event deleted successfully"}
