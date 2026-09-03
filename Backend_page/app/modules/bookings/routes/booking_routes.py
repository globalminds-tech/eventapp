from typing import Optional
from fastapi import APIRouter, Depends, Query
from app.modules.bookings.controllers.booking_controller import BookingController
from app.middleware.auth import get_current_user

booking_router = APIRouter(prefix="/api/v1/bookings", tags=["Bookings"])

@booking_router.get("/my-bookings")
def get_my_bookings(email: Optional[str] = Query(None), current_user: dict = Depends(get_current_user)):
    user_email = email or current_user.get("email")
    return BookingController.get_my_bookings(user_email)

@booking_router.get("/{booking_id}")
def get_booking(booking_id: str, current_user: dict = Depends(get_current_user)):
    return BookingController.get_booking(booking_id)
