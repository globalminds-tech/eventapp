from fastapi import APIRouter, Depends, Request
from app.modules.events.controllers.event_controller import EventController
from app.modules.admin.controllers.admin_controller import AdminController
from app.modules.events.schemas.event_schema import CreateEventSchema, UpdateEventSchema
from app.middleware.auth import get_current_user

event_router = APIRouter(prefix="/api/v1/events", tags=["Events"])
root_events_router = APIRouter(prefix="", tags=["Event Aliases"])

@event_router.get("/")
def get_all_events():
    return EventController.get_all_events()

@event_router.get("/summary")
def get_events_summary():
    return EventController.get_events_summary()

@event_router.get("/search")
@root_events_router.get("/api/events/search")
def search_events(
    request: Request,
    search: str = None,
    category: str = None,
    city: str = None,
    location: str = None,
    page: int = None,
    limit: int = None,
    sort_by: str = "created_at",
    sort_order: str = "desc"
):
    host_url = str(request.base_url)
    req_params = request.query_params
    q_search = search if search is not None else req_params.get("search")
    q_category = category if category is not None else req_params.get("category")
    q_city = city if city is not None else req_params.get("city")
    q_location = location if location is not None else (req_params.get("location") or q_city)
    q_page = page if page is not None else req_params.get("page")
    q_limit = limit if limit is not None else req_params.get("limit")

    return AdminController.get_events(
        host_url=host_url,
        organizer_id=None,
        only_approved=True,
        search=q_search,
        category=q_category,
        city=q_city,
        location=q_location,
        page=int(q_page) if q_page is not None else None,
        limit=int(q_limit) if q_limit is not None else None,
        sort_by=sort_by,
        sort_order=sort_order
    )

@event_router.get("/{event_id}")
@root_events_router.get("/superadmin/booking/event/{event_id}")
@root_events_router.get("/booking/event/{event_id}")
def get_event(event_id: str):
    return EventController.get_event(event_id)

@event_router.post("/", status_code=201)
def create_event(payload: CreateEventSchema, current_user: dict = Depends(get_current_user)):
    user_roles = [r.lower() for r in (current_user.get("roles") or [])]
    active_role = str(current_user.get("role") or "").lower()
    if active_role in ["superuser", "superadmin", "admin"] or any(r in ["superuser", "superadmin", "admin"] for r in user_roles):
        from fastapi import HTTPException, status
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Super administrators cannot create or edit events. Platform governance and approvals only."
        )
    user_id = current_user.get("user_id") or current_user.get("id")
    return EventController.create_event(payload.dict(), user_id)

@event_router.put("/{event_id}")
def update_event(event_id: str, payload: UpdateEventSchema, current_user: dict = Depends(get_current_user)):
    user_roles = [r.lower() for r in (current_user.get("roles") or [])]
    active_role = str(current_user.get("role") or "").lower()
    if active_role in ["superuser", "superadmin", "admin"] or any(r in ["superuser", "superadmin", "admin"] for r in user_roles):
        from fastapi import HTTPException, status
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Super administrators cannot create or edit events. Platform governance and approvals only."
        )
    return EventController.update_event(event_id, payload.dict())

@event_router.delete("/{event_id}")
def delete_event(event_id: str, current_user: dict = Depends(get_current_user)):
    user_roles = [r.lower() for r in (current_user.get("roles") or [])]
    active_role = str(current_user.get("role") or "").lower()
    if active_role in ["superuser", "superadmin", "admin"] or any(r in ["superuser", "superadmin", "admin"] for r in user_roles):
        from fastapi import HTTPException, status
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Super administrators cannot delete organizer events directly. Platform governance and approvals only."
        )
    return EventController.delete_event(event_id)
