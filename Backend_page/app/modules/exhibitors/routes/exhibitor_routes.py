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

@root_admin_router.get("/superadmin/api/organizer/exhibitor-applications")
@root_admin_router.get("/api/v1/organizer/exhibitor-applications")
def get_all_exhibitor_applications():
    from app.modules.exhibitors.repository.exhibitor_repository import ExhibitorRepository
    rows = ExhibitorRepository.get_all_applications()
    res = []
    for b, evt_name in rows:
        d = b.to_dict() if hasattr(b, "to_dict") else {
            "id": b.id, "event_id": b.event_id, "company_name": getattr(b, "company_name", ""),
            "email": b.email, "mobile": getattr(b, "mobile", ""), "stall_area": getattr(b, "stall_area", ""),
            "status": getattr(b, "status", "Pending")
        }
        d["event_name"] = evt_name or "Exhibition Show"
        res.append(d)
    return {"success": True, "data": res}

@root_admin_router.put("/superadmin/api/organizer/exhibitor-applications/{application_id}/status")
@root_admin_router.put("/api/v1/organizer/exhibitor-applications/{application_id}/status")
async def update_exhibitor_application_status(application_id: int, request: Request):
    from app.modules.exhibitors.repository.exhibitor_repository import ExhibitorRepository
    body = await request.json()
    status_val = body.get("status", "Approved")
    booking = ExhibitorRepository.update_application_status(application_id, status_val)
    return {"success": True, "message": f"Stall application {status_val.lower()} successfully", "data": booking.to_dict() if booking else None}
