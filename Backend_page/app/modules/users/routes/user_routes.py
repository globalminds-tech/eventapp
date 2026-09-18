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

    # 1. Normalize and clean user_id
    raw_uid = data.get("user_id")
    if not raw_uid or str(raw_uid).strip().lower() in ["none", "null", "undefined", ""]:
        data["user_id"] = None
    else:
        data["user_id"] = str(raw_uid).strip()

    # 2. Extract user_id from Authorization Bearer token if not provided in payload
    if not data.get("user_id"):
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ", 1)[1].strip()
            try:
                import jwt
                from app.utils.jwt_utils import JWT_SECRET_KEY, JWT_ALGORITHM
                token_payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
                data["user_id"] = token_payload.get("user_id") or token_payload.get("id") or token_payload.get("sub")
            except Exception:
                pass

    # 3. Resolve or auto-link user account by email to prevent blocking attendees who just paid
    if not data.get("user_id") and data.get("email"):
        from app.modules.auth.repository.auth_repository import AuthRepository
        try:
            clean_email = data["email"].strip().lower()
            existing_user = AuthRepository.get_user_by_email(clean_email)
            if existing_user:
                data["user_id"] = str(existing_user.id)
            else:
                import secrets
                from werkzeug.security import generate_password_hash
                random_pw = secrets.token_urlsafe(12)
                new_user = AuthRepository.create_user(
                    name=data.get("name") or "Attendee",
                    email=clean_email,
                    password_hash=generate_password_hash(random_pw),
                    role="user",
                    mobile=data.get("phone")
                )
                if new_user:
                    data["user_id"] = str(new_user.id)
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
@root_users_router.get("/api/v1/user/my-bookings")
def get_my_bookings(
    request: Request,
    email: Optional[str] = Query(None),
    user_id: Optional[str] = Query(None),
    search: Optional[str] = Query(None)
):
    raw_uid = user_id
    uid = None
    if raw_uid and str(raw_uid).strip().lower() not in ["none", "null", "undefined", ""]:
        uid = str(raw_uid).strip()

    uemail = email.strip().lower() if email and str(email).strip().lower() not in ["none", "null", "undefined", ""] else None

    # Try extracting user info from Bearer token if available
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ", 1)[1].strip()
        try:
            import jwt
            from app.utils.jwt_utils import JWT_SECRET_KEY, JWT_ALGORITHM
            payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
            if not uid:
                uid = payload.get("user_id") or payload.get("id") or payload.get("sub")
            if not uemail:
                uemail = payload.get("email")
        except Exception:
            pass

    return UserController.get_my_bookings(email=uemail, user_id=uid, search=search)

