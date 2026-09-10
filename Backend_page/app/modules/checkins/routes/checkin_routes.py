from fastapi import APIRouter, Depends
from app.modules.checkins.controllers.checkin_controller import CheckinController
from app.middleware.auth import get_current_user

from app.modules.checkins.schemas.checkin_schema import CheckinRequestSchema

checkin_router = APIRouter(prefix="/api/v1/checkins", tags=["Checkins"])

@checkin_router.post("/verify")
def verify_checkin(payload: CheckinRequestSchema, current_user: dict = Depends(get_current_user)):
    code_or_id = payload.ticket_code or payload.booking_id
    action = payload.action or "CHECK_IN"
    staff_id = str(current_user.get("user_id") or current_user.get("id") or payload.scanner_id or "GATE_STAFF")
    return CheckinController.checkin_attendee(
        code_or_id,
        action=action,
        scanner_id=payload.scanner_id or staff_id,
        gate_name=payload.gate_name or "MAIN_GATE",
        event_id=payload.event_id,
        override_duplicate=bool(payload.override_duplicate)
    )

@checkin_router.get("/events")
def get_events_checkin_summary(current_user: dict = Depends(get_current_user)):
    user_id = str(current_user.get("user_id") or current_user.get("id") or "")
    roles = current_user.get("roles") or []
    is_super = "superuser" in roles or "superadmin" in roles
    organizer_id = None if is_super else user_id
    return CheckinController.get_events_summary(organizer_id=organizer_id)

@checkin_router.get("/events/{event_id}/attendees")
def get_event_attendees(event_id: str, current_user: dict = Depends(get_current_user)):
    return CheckinController.get_event_attendees(event_id=event_id)

@checkin_router.get("/events/{event_id}/logs")
def get_event_checkin_logs(event_id: str, current_user: dict = Depends(get_current_user)):
    return CheckinController.get_event_checkin_logs(event_id=event_id)


@checkin_router.get("/food/summary")
def get_food_checkin_summary(current_user: dict = Depends(get_current_user)):
    user_id = str(current_user.get("user_id") or current_user.get("id") or "")
    roles = current_user.get("roles") or []
    is_super = "superuser" in roles or "superadmin" in roles
    organizer_id = None if is_super else user_id
    return CheckinController.get_food_summary(organizer_id=organizer_id)

@checkin_router.post("/food/redeem")
def redeem_food_token(payload: dict, current_user: dict = Depends(get_current_user)):
    token = payload.get("token") or payload.get("code") or payload.get("ticket_code") or ""
    event_id = payload.get("event_id")
    return CheckinController.redeem_food_token(token, event_id=event_id)

@checkin_router.get("/addons")
def get_addons_checkin(current_user: dict = Depends(get_current_user)):
    user_id = str(current_user.get("user_id") or current_user.get("id") or "")
    roles = current_user.get("roles") or []
    is_super = "superuser" in roles or "superadmin" in roles
    organizer_id = None if is_super else user_id
    return CheckinController.get_addons(organizer_id=organizer_id)

@checkin_router.get("/gates")
def get_gate_presets(current_user: dict = Depends(get_current_user)):
    user_id = str(current_user.get("user_id") or current_user.get("id") or "")
    return CheckinController.get_gate_presets(organizer_id=user_id)

@checkin_router.post("/gates")
def add_gate_preset(payload: dict, current_user: dict = Depends(get_current_user)):
    user_id = str(current_user.get("user_id") or current_user.get("id") or "")
    name = payload.get("name")
    return CheckinController.add_gate_preset(name=name, organizer_id=user_id)

@checkin_router.delete("/gates/{gate_id}")
def delete_gate_preset(gate_id: str, current_user: dict = Depends(get_current_user)):
    user_id = str(current_user.get("user_id") or current_user.get("id") or "")
    return CheckinController.delete_gate_preset(gate_id=gate_id, organizer_id=user_id)

@checkin_router.post("/{code_or_id}")
def checkin_attendee(code_or_id: str, current_user: dict = Depends(get_current_user)):
    return CheckinController.checkin_attendee(code_or_id, action="CHECK_IN")
