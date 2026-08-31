from typing import Optional
from fastapi import APIRouter, Depends, Query
from app.modules.users.controllers.user_controller import UserController
from app.modules.users.schemas.user_schema import BookEventSchema, UpdateProfileSchema
from app.middleware.auth import get_current_user

users_router = APIRouter(prefix="/api/v1/users", tags=["Users"])
root_users_router = APIRouter(prefix="", tags=["Users Root Aliases"])

@users_router.get("/profile")
def get_profile(current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("user_id") or current_user.get("id")
    return UserController.get_profile(user_id)

@users_router.put("/profile")
def update_profile(payload: UpdateProfileSchema, current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("user_id") or current_user.get("id")
    return UserController.update_profile(user_id, payload.dict())

@users_router.post("/book-event", status_code=201)
@root_users_router.post("/user/book-event", status_code=201)
@root_users_router.post("/api/v1/user/book-event", status_code=201)
def book_event(payload: BookEventSchema):
    return UserController.book_event(payload.dict())

@users_router.get("/validate-booking/{booking_id}")
@users_router.get("/validate-qr/{booking_id}")
@root_users_router.get("/user/validate-booking/{booking_id}")
@root_users_router.get("/user/validate-qr/{booking_id}")
@root_users_router.get("/api/v1/user/validate-qr/{booking_id}")
@root_users_router.get("/superadmin/api/user/validate-qr/{booking_id}")
def validate_qr(booking_id: int):
    return UserController.validate_qr(booking_id)

@users_router.get("/my-bookings")
@root_users_router.get("/user/my-bookings")
def get_my_bookings(
    email: Optional[str] = Query(None),
    user_id: Optional[int] = Query(None),
    current_user: dict = Depends(get_current_user)
):
    uid = user_id or (current_user.get("user_id") if isinstance(current_user, dict) else None) or (current_user.get("id") if isinstance(current_user, dict) else None)
    uemail = email or (current_user.get("email") if isinstance(current_user, dict) else None)
    return UserController.get_my_bookings(email=uemail, user_id=uid)

