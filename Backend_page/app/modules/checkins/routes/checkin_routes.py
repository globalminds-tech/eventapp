from fastapi import APIRouter, Depends
from app.modules.checkins.controllers.checkin_controller import CheckinController
from app.middleware.auth import get_current_user

from app.modules.checkins.schemas.checkin_schema import CheckinRequestSchema

checkin_router = APIRouter(prefix="/api/v1/checkins", tags=["Checkins"])

@checkin_router.post("/verify")
def verify_checkin(payload: CheckinRequestSchema, current_user: dict = Depends(get_current_user)):
    code_or_id = payload.ticket_code or payload.booking_id
    action = payload.action or "CHECK_IN"
    return CheckinController.checkin_attendee(
        code_or_id,
        action=action,
        scanner_id=payload.scanner_id,
        gate_name=payload.gate_name
    )

@checkin_router.post("/{code_or_id}")
def checkin_attendee(code_or_id: str, current_user: dict = Depends(get_current_user)):
    return CheckinController.checkin_attendee(code_or_id, action="CHECK_IN")
