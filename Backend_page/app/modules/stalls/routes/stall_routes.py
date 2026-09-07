from fastapi import APIRouter
from app.modules.stalls.controllers.stall_controller import StallController
from app.modules.admin.routes.admin_routes import root_admin_router

stall_router = APIRouter(prefix="/api/v1/stalls", tags=["Stalls"])

@stall_router.get("/event/{event_id}")
@stall_router.get("/{event_id}")
@root_admin_router.get("/api/v1/exhibitor/events/{event_id}/stalls")
def get_event_stalls(event_id: str):
    return StallController.get_event_stalls(event_id)

