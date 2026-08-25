from fastapi import APIRouter, Depends
from app.modules.events.controllers.event_controller import EventController
from app.modules.events.schemas.event_schema import CreateEventSchema, UpdateEventSchema
from app.middleware.auth import get_current_user

event_router = APIRouter(prefix="/api/v1/events", tags=["Events"])

@event_router.get("/")
def get_all_events():
    return EventController.get_all_events()

@event_router.get("/summary")
def get_events_summary():
    return EventController.get_events_summary()

@event_router.get("/{event_id}")
def get_event(event_id: int):
    return EventController.get_event(event_id)

@event_router.post("/", status_code=201)
def create_event(payload: CreateEventSchema, current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("user_id") or current_user.get("id")
    return EventController.create_event(payload.dict(), user_id)

@event_router.put("/{event_id}")
def update_event(event_id: int, payload: UpdateEventSchema, current_user: dict = Depends(get_current_user)):
    return EventController.update_event(event_id, payload.dict())

@event_router.delete("/{event_id}")
def delete_event(event_id: int, current_user: dict = Depends(get_current_user)):
    return EventController.delete_event(event_id)
