from fastapi import APIRouter, Depends
from app.modules.checkins.controllers.checkin_controller import CheckinController
from app.middleware.auth import get_current_user

checkin_router = APIRouter(prefix="/api/v1/checkins", tags=["Checkins"])

@checkin_router.post("/{booking_id}")
def checkin_attendee(booking_id: int, current_user: dict = Depends(get_current_user)):
    return CheckinController.checkin_attendee(booking_id)
