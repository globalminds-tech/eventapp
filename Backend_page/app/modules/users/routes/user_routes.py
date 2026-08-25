from typing import Optional
from fastapi import APIRouter, Depends, Query
from app.modules.users.controllers.user_controller import UserController
from app.modules.users.schemas.user_schema import BookEventSchema, UpdateProfileSchema
from app.middleware.auth import get_current_user

users_router = APIRouter(prefix="/api/v1/users", tags=["Users"])

@users_router.get("/profile")
def get_profile(current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("user_id") or current_user.get("id")
    return UserController.get_profile(user_id)

@users_router.put("/profile")
def update_profile(payload: UpdateProfileSchema, current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("user_id") or current_user.get("id")
    return UserController.update_profile(user_id, payload.dict())

@users_router.post("/book-event", status_code=201)
def book_event(payload: BookEventSchema):
    return UserController.book_event(payload.dict())

@users_router.get("/validate-booking/{booking_id}")
def validate_qr(booking_id: int):
    return UserController.validate_qr(booking_id)

@users_router.get("/my-bookings")
def get_my_bookings(email: Optional[str] = Query(None), current_user: dict = Depends(get_current_user)):
    user_email = email or current_user.get("email")
    if not user_email:
        return {"success": False, "message": "Email is required"}
    return UserController.get_my_bookings(user_email)
