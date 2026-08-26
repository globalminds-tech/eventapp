from fastapi import APIRouter, Depends, Request
from app.modules.auth.controllers.auth_controller import AuthController
from app.modules.auth.schemas.auth_schema import (
    RegisterSchema, OrganizerRegisterSchema, ExhibitorRegisterSchema,
    LoginSchema, SendOTPSchema, VerifyOTPSchema, ResetPasswordSchema
)
from app.middleware.auth import get_current_user

auth_router = APIRouter(prefix="/api/v1/auth", tags=["Auth"])
legacy_auth_router = APIRouter(prefix="/auth/api", tags=["Legacy Auth"])
root_auth_router = APIRouter(prefix="", tags=["Root Auth Aliases"])

@auth_router.post("/register", status_code=201)
@legacy_auth_router.post("/register", status_code=201)
@root_auth_router.post("/register", status_code=201)
def register(payload: RegisterSchema):
    return AuthController.register(payload.dict())

@auth_router.post("/register/organizer", status_code=201)
@root_auth_router.post("/register/organizer", status_code=201)
def register_organizer(payload: OrganizerRegisterSchema):
    return AuthController.register_organizer(payload.dict())

@auth_router.post("/register/exhibitor", status_code=201)
@root_auth_router.post("/register/exhibitor", status_code=201)
def register_exhibitor(payload: ExhibitorRegisterSchema):
    return AuthController.register_exhibitor(payload.dict())

@auth_router.post("/login")
@legacy_auth_router.post("/login")
@root_auth_router.post("/login")
def login(payload: LoginSchema):
    return AuthController.login(payload.dict())

@auth_router.get("/me")
def me(current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("user_id") or current_user.get("id")
    return AuthController.me(user_id)

@auth_router.get("/profile/{user_id}")
@auth_router.get("/user/profile/{user_id}")
@root_auth_router.get("/superadmin/api/user/profile/{user_id}")
@root_auth_router.get("/api/v1/auth/user/profile/{user_id}")
def get_user_profile(user_id: int):
    return AuthController.me(user_id)

@auth_router.post("/otp/send")
@auth_router.post("/otp/send-otp")
@legacy_auth_router.post("/otp/send")
@legacy_auth_router.post("/otp/send-otp")
@root_auth_router.post("/otp/send")
@root_auth_router.post("/otp/send-otp")
@root_auth_router.post("/otp/reset/send-otp")
def send_otp(payload: SendOTPSchema):
    return AuthController.send_otp(payload.dict())

@auth_router.post("/otp/resend")
@auth_router.post("/otp/resend-otp")
@legacy_auth_router.post("/otp/resend")
@legacy_auth_router.post("/otp/resend-otp")
@root_auth_router.post("/otp/resend")
@root_auth_router.post("/otp/resend-otp")
@root_auth_router.post("/otp/reset/resend-otp")
def resend_otp(payload: SendOTPSchema):
    return AuthController.resend_otp(payload.dict())

@auth_router.post("/otp/verify")
@auth_router.post("/otp/verify-otp")
@legacy_auth_router.post("/otp/verify")
@legacy_auth_router.post("/otp/verify-otp")
@root_auth_router.post("/otp/verify")
@root_auth_router.post("/otp/verify-otp")
@root_auth_router.post("/otp/reset/verify-otp")
def verify_otp(payload: VerifyOTPSchema):
    return AuthController.verify_otp(payload.dict())

@auth_router.post("/reset-password")
@root_auth_router.post("/otp/reset-password")
def reset_password(payload: ResetPasswordSchema):
    return AuthController.reset_password(payload.dict())
