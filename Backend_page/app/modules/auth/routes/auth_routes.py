from fastapi import APIRouter, Depends, Request, Response, HTTPException
from app.modules.auth.controllers.auth_controller import AuthController
from app.modules.auth.schemas.auth_schema import (
    RegisterSchema, OrganizerRegisterSchema, ExhibitorRegisterSchema,
    LoginSchema, SendOTPSchema, VerifyOTPSchema, ResetPasswordSchema
)
from app.middleware.auth import get_current_user
from app.utils.jwt_utils import decode_token, generate_access_token, generate_refresh_token
from app.modules.auth.repository.auth_repository import AuthRepository

auth_router = APIRouter(prefix="/api/v1/auth", tags=["Auth"])
legacy_auth_router = APIRouter(prefix="/auth/api", tags=["Legacy Auth"])
root_auth_router = APIRouter(prefix="", tags=["Root Auth Aliases"])

def _attach_refresh_cookie(response: Response, res_data: dict):
    if isinstance(res_data, dict) and "data" in res_data and isinstance(res_data["data"], dict):
        ref_token = res_data["data"].get("refresh_token")
        if ref_token:
            response.set_cookie(
                key="refresh_token",
                value=ref_token,
                httponly=True,
                max_age=7 * 24 * 3600,
                samesite="lax"
            )

@auth_router.post("/register", status_code=201)
@legacy_auth_router.post("/register", status_code=201)
@root_auth_router.post("/register", status_code=201)
def register(payload: RegisterSchema, response: Response):
    res = AuthController.register(payload.dict())
    _attach_refresh_cookie(response, res)
    return res

@auth_router.post("/register/organizer", status_code=201)
@root_auth_router.post("/register/organizer", status_code=201)
def register_organizer(payload: OrganizerRegisterSchema, response: Response):
    res = AuthController.register_organizer(payload.dict())
    _attach_refresh_cookie(response, res)
    return res

@auth_router.post("/register/exhibitor", status_code=201)
@root_auth_router.post("/register/exhibitor", status_code=201)
def register_exhibitor(payload: ExhibitorRegisterSchema, response: Response):
    res = AuthController.register_exhibitor(payload.dict())
    _attach_refresh_cookie(response, res)
    return res

@auth_router.post("/login")
@legacy_auth_router.post("/login")
@root_auth_router.post("/login")
def login(payload: LoginSchema, response: Response):
    res = AuthController.login(payload.dict())
    _attach_refresh_cookie(response, res)
    return res

@auth_router.post("/refresh")
@legacy_auth_router.post("/refresh")
@root_auth_router.post("/refresh")
def refresh_token(request: Request, response: Response):
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(status_code=401, detail="Refresh token missing in request cookies")

    try:
        payload = decode_token(refresh_token)
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type for refresh")

        user_id = payload.get("user_id") or payload.get("id")
        user = AuthRepository.get_user_by_id(user_id)
        if not user:
            raise HTTPException(status_code=401, detail="User not found")

        new_access_token = generate_access_token(user.id, user.role)
        new_refresh_token = generate_refresh_token(user.id, user.role)

        response.set_cookie(
            key="refresh_token",
            value=new_refresh_token,
            httponly=True,
            max_age=7 * 24 * 3600,
            samesite="lax"
        )
        return {
            "success": True,
            "data": {
                "token": new_access_token,
                "access_token": new_access_token,
                "user": user.to_dict()
            }
        }
    except Exception as err:
        raise HTTPException(status_code=401, detail=f"Invalid or expired refresh token: {err}")

@auth_router.post("/logout")
@root_auth_router.post("/logout")
def logout(response: Response):
    response.delete_cookie("refresh_token")
    return {"success": True, "message": "Logged out successfully"}

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
