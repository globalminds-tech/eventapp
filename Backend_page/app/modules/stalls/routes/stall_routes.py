from fastapi import APIRouter
from app.modules.stalls.controllers.stall_controller import StallController

stall_router = APIRouter(prefix="/api/v1/stalls", tags=["Stalls"])

@stall_router.get("/event/{event_id}")
def get_event_stalls(event_id: str):
    return StallController.get_event_stalls(event_id)
