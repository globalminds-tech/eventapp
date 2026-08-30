from typing import Optional
from fastapi import APIRouter, Depends, Request, UploadFile, File, Form
from app.modules.exhibitors.controllers.exhibitor_controller import ExhibitorController
from app.middleware.auth import get_current_user

exhibitor_router = APIRouter(prefix="/api/v1/exhibitors", tags=["Exhibitors"])

@exhibitor_router.post("/book-stall", status_code=201)
async def book_stall(
    request: Request,
    event_id: int = Form(...),
    email: str = Form(...),
    firstName: Optional[str] = Form(None),
    lastName: Optional[str] = Form(None),
    mobile: Optional[str] = Form(None),
    companyName: Optional[str] = Form(None),
    designation: Optional[str] = Form(None),
    country: Optional[str] = Form(None),
    state: Optional[str] = Form(None),
    city: Optional[str] = Form(None),
    address: Optional[str] = Form(None),
    pinCode: Optional[str] = Form(None),
    stallArea: Optional[str] = Form(None),
    products: Optional[str] = Form(None),
    message: Optional[str] = Form(None),
    visiting_card: Optional[UploadFile] = File(None),
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user.get("user_id") or current_user.get("id")
    form_data = {
        "user_id": user_id,
        "event_id": event_id,
        "email": email,
        "first_name": firstName,
        "last_name": lastName,
        "mobile": mobile,
        "company_name": companyName,
        "designation": designation,
        "country": country,
        "state": state,
        "city": city,
        "address": address,
        "pin_code": pinCode,
        "stall_area": stallArea,
        "products": products,
        "message": message
    }
    return ExhibitorController.book_stall(form_data, visiting_card, "uploads")

@exhibitor_router.get("/my-bookings")
def get_user_bookings(request: Request, current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("user_id") or current_user.get("id")
    host_url = str(request.base_url)
    return ExhibitorController.get_user_bookings(user_id, host_url)

from app.modules.admin.routes.admin_routes import root_admin_router

@root_admin_router.get("/exhibitor/api/my-bookings/{user_id}")
@root_admin_router.get("/api/v1/exhibitor/my-bookings")
def get_user_bookings_alias(user_id: Optional[int] = None, request: Request = None):
    uid = user_id or 1
    host_url = str(request.base_url) if request else "http://localhost:5001/"
    return ExhibitorController.get_user_bookings(uid, host_url)
