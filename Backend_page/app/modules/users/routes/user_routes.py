from typing import Optional
from fastapi import APIRouter, Depends, Query, UploadFile, File, HTTPException, Request
from app.modules.users.controllers.user_controller import UserController
from app.modules.users.schemas.user_schema import BookEventSchema, UpdateProfileSchema
from app.middleware.auth import get_current_user
from app.extensions.storage import StorageService

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

@users_router.put("/profile/avatar")
@root_users_router.put("/user/profile/avatar")
async def upload_avatar(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("user_id") or current_user.get("id")
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file must be an image (JPEG, PNG, WEBP, GIF)")

    contents = await file.read()
    if len(contents) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Profile image size must not exceed 5MB")

    avatar_url = StorageService.upload_file_bytes(
        file_bytes=contents,
        filename=file.filename or "avatar.jpg",
        mime_type=file.content_type or "image/jpeg",
        folder="avatars"
    )

    result = UserController.update_profile(user_id, {"profile_image": avatar_url})
    return {
        "success": True,
        "message": "Profile avatar uploaded successfully",
        "data": {
            "profile_image": avatar_url,
            "user": result
        }
    }


@users_router.post("/book-event", status_code=201)
@root_users_router.post("/user/book-event", status_code=201)
@root_users_router.post("/api/v1/user/book-event", status_code=201)
def book_event(payload: BookEventSchema, request: Request):
    data = payload.dict()
    if not data.get("user_id"):
        from app.middleware.auth import get_current_user
        try:
            current_user = get_current_user(request)
            if current_user and isinstance(current_user, dict):
                data["user_id"] = current_user.get("user_id") or current_user.get("id")
        except Exception:
            pass
    if not data.get("user_id") and data.get("email"):
        from app.modules.auth.repository.auth_repository import AuthRepository
        try:
            existing_user = AuthRepository.get_user_by_email(data["email"])
            if existing_user:
                data["user_id"] = str(existing_user.id)
        except Exception:
            pass

    if not data.get("user_id"):
        raise HTTPException(
            status_code=401,
            detail="Authentication required: You must be signed in with a valid account to book an event pass."
        )

    return UserController.book_event(data)

@users_router.get("/validate-booking/{code_or_id}")
@users_router.get("/validate-qr/{code_or_id}")
@root_users_router.get("/user/validate-booking/{code_or_id}")
@root_users_router.get("/user/validate-qr/{code_or_id}")
@root_users_router.get("/api/v1/user/validate-qr/{code_or_id}")
@root_users_router.get("/superadmin/api/user/validate-qr/{code_or_id}")
def validate_qr(code_or_id: str):
    return UserController.validate_qr(code_or_id)

@users_router.get("/my-bookings")
@root_users_router.get("/user/my-bookings")
def get_my_bookings(
    email: Optional[str] = Query(None),
    user_id: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user)
):
    uid = user_id or (current_user.get("user_id") if isinstance(current_user, dict) else None) or (current_user.get("id") if isinstance(current_user, dict) else None)
    uemail = email or (current_user.get("email") if isinstance(current_user, dict) else None)
    return UserController.get_my_bookings(email=uemail, user_id=uid)

