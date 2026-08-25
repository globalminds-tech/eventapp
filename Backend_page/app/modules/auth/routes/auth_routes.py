from fastapi import APIRouter, Depends, Request
from app.modules.auth.controllers.auth_controller import AuthController
from app.modules.auth.schemas.auth_schema import (
    RegisterSchema, LoginSchema, SendOTPSchema, VerifyOTPSchema, ResetPasswordSchema
)
from app.middleware.auth import get_current_user

auth_router = APIRouter(prefix="/api/v1/auth", tags=["Auth"])

@auth_router.post("/register", status_code=201)
def register(payload: RegisterSchema):
    return AuthController.register(payload.dict())

@auth_router.post("/login")
def login(payload: LoginSchema):
    return AuthController.login(payload.dict())

@auth_router.get("/me")
def me(current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("user_id") or current_user.get("id")
    return AuthController.me(user_id)

@auth_router.post("/otp/send")
def send_otp(payload: SendOTPSchema):
    return AuthController.send_otp(payload.dict())

@auth_router.post("/otp/resend")
def resend_otp(payload: SendOTPSchema):
    return AuthController.resend_otp(payload.dict())

@auth_router.post("/otp/verify")
def verify_otp(payload: VerifyOTPSchema):
    return AuthController.verify_otp(payload.dict())

@auth_router.post("/reset-password")
def reset_password(payload: ResetPasswordSchema):
    return AuthController.reset_password(payload.dict())
