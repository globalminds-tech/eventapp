from fastapi import APIRouter, Depends, Request, Response, HTTPException
from app.exceptions.api_error import ApiError
from app.modules.auth.controllers.auth_controller import AuthController
from app.modules.auth.services.auth_service import AuthService
from app.modules.auth.schemas.auth_schema import (
    RegisterSchema, OrganizerRegisterSchema, ExhibitorRegisterSchema,
    UpgradeOrganizerStep1Schema, UpgradeOrganizerCompleteSchema,
    UpgradeExhibitorStep1Schema, UpgradeExhibitorCompleteSchema,
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

@auth_router.patch("/upgrade/organizer/step/1")
@auth_router.post("/upgrade/organizer/step/1")
@root_auth_router.post("/user/upgrade/organizer/step/1")
def upgrade_organizer_step1(payload: UpgradeOrganizerStep1Schema, current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("user_id") or current_user.get("id")
    return AuthController.upgrade_organizer_step1(user_id, payload.dict())

@auth_router.post("/upgrade/organizer/complete")
@auth_router.post("/upgrade/organizer")
@root_auth_router.post("/user/upgrade/organizer")
def upgrade_organizer(payload: UpgradeOrganizerCompleteSchema, response: Response, current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("user_id") or current_user.get("id")
    res = AuthController.upgrade_organizer(user_id, payload.dict())
    _attach_refresh_cookie(response, res)
    return res

@auth_router.post("/register/exhibitor", status_code=201)
@root_auth_router.post("/register/exhibitor", status_code=201)
def register_exhibitor(payload: ExhibitorRegisterSchema, response: Response):
    res = AuthController.register_exhibitor(payload.dict())
    _attach_refresh_cookie(response, res)
    return res

@auth_router.patch("/upgrade/exhibitor/step/1")
@auth_router.post("/upgrade/exhibitor/step/1")
@root_auth_router.post("/user/upgrade/exhibitor/step/1")
def upgrade_exhibitor_step1(payload: UpgradeExhibitorStep1Schema, current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("user_id") or current_user.get("id")
    return AuthController.upgrade_exhibitor_step1(user_id, payload.dict())

@auth_router.post("/upgrade/exhibitor/complete")
@auth_router.post("/upgrade/exhibitor")
@root_auth_router.post("/user/upgrade/exhibitor")
def upgrade_exhibitor(payload: UpgradeExhibitorCompleteSchema, response: Response, current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("user_id") or current_user.get("id")
    res = AuthController.upgrade_exhibitor(user_id, payload.dict())
    _attach_refresh_cookie(response, res)
    return res

@auth_router.post("/login")
@legacy_auth_router.post("/login")
@root_auth_router.post("/login")
def login(payload: LoginSchema, response: Response):
    res = AuthController.login(payload.dict())
    _attach_refresh_cookie(response, res)
    return res

@auth_router.post("/switch-role")
@root_auth_router.post("/auth/switch-role")
async def switch_role(request: Request, response: Response, current_user: dict = Depends(get_current_user)):
    body = await request.json()
    target_role = body.get("role") or body.get("target_role") or "user"
    user_id = current_user.get("user_id") or current_user.get("id")
    res = AuthController.switch_role(user_id, target_role)
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

        user_full = AuthService.get_current_user(user_id)
        user_roles = user_full.get("roles") or ["user"]
        active_role = user_full.get("active_role") or (user_roles[0] if user_roles else "user")
        new_access_token = generate_access_token(user.id, role=active_role, roles=user_roles)
        new_refresh_token = generate_refresh_token(user.id, role=active_role, roles=user_roles)

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
                "user": user_full
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
@auth_router.get("/profile")
@auth_router.get("/user/profile")
@root_auth_router.get("/superadmin/api/user/profile")
@root_auth_router.get("/superadmin/api/user/profile/me")
def me(current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("user_id") or current_user.get("id")
    return AuthController.me(user_id)

@auth_router.get("/profile/{user_id}")
@auth_router.get("/user/profile/{user_id}")
@root_auth_router.get("/superadmin/api/user/profile/{user_id}")
@root_auth_router.get("/api/v1/auth/user/profile/{user_id}")
def get_user_profile(user_id: str, request: Request):
    if str(user_id).lower() in ("undefined", "null", "me", "0", ""):
        # Extract JWT user_id if token present
        from app.middleware.auth import get_current_user
        try:
            current_user = get_current_user(request)
            uid = current_user.get("user_id") or current_user.get("id")
            return AuthController.me(uid)
        except Exception:
            raise ApiError("User ID missing and unauthenticated", 400)
    try:
        uid = int(user_id)
        return AuthController.me(uid)
    except ValueError:
        raise ApiError("Invalid user ID", 400)

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
