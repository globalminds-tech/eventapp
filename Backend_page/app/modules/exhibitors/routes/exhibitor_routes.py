from typing import Optional
from fastapi import APIRouter, Depends, Request, UploadFile, File, Form
from app.modules.exhibitors.controllers.exhibitor_controller import ExhibitorController
from app.middleware.auth import get_current_user
from app.modules.exhibitors.schemas.exhibitor_schema import CreateLeadSchema

exhibitor_router = APIRouter(prefix="/api/v1/exhibitors", tags=["Exhibitors"])

@exhibitor_router.post("/leads", status_code=201)
async def add_visitor_lead(
    payload: CreateLeadSchema,
    current_user: dict = Depends(get_current_user)
):
    data = payload.dict()
    data["user_id"] = str(current_user.get("user_id") or current_user.get("id"))
    return ExhibitorController.add_visitor_lead(data)

@exhibitor_router.get("/leads/{event_id}")
def get_visitor_leads(event_id: str, request: Request, current_user: dict = Depends(get_current_user)):
    user_id = str(current_user.get("user_id") or current_user.get("id"))
    search = request.query_params.get("search")
    return ExhibitorController.get_visitor_leads(event_id, user_id, search=search)

@exhibitor_router.post("/book-stall", status_code=201)
async def book_stall(
    request: Request,
    event_id: str = Form(...),
    email: str = Form(...),
    title: Optional[str] = Form(None),
    firstName: Optional[str] = Form(None),
    lastName: Optional[str] = Form(None),
    mobile: Optional[str] = Form(None),
    companyName: Optional[str] = Form(None),
    companyType: Optional[str] = Form(None),
    company_type: Optional[str] = Form(None),
    industryType: Optional[str] = Form(None),
    industry_type: Optional[str] = Form(None),
    companyWebsite: Optional[str] = Form(None),
    company_website: Optional[str] = Form(None),
    website: Optional[str] = Form(None),
    businessDescription: Optional[str] = Form(None),
    business_description: Optional[str] = Form(None),
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
        "title": title or "Mr.",
        "first_name": firstName,
        "last_name": lastName,
        "mobile": mobile,
        "company_name": companyName,
        "company_type": companyType or company_type,
        "industry_type": industryType or industry_type or products,
        "company_website": companyWebsite or company_website or website,
        "business_description": businessDescription or business_description,
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
def get_user_bookings(request: Request):
    user_id = request.query_params.get("user_id") or request.query_params.get("uid")
    status = request.query_params.get("status")
    search = request.query_params.get("search")
    if not user_id:
        try:
            from app.middleware.auth import get_current_user
            current_user = get_current_user(request)
            if current_user:
                user_id = current_user.get("user_id") or current_user.get("id")
        except Exception:
            pass
    host_url = str(request.base_url)
    return ExhibitorController.get_user_bookings(user_id, host_url, status=status, search=search)

from app.modules.admin.routes.admin_routes import root_admin_router

@exhibitor_router.get("/events/{event_id}/booking-status")
@root_admin_router.get("/api/v1/exhibitor/events/{event_id}/booking-status")
@root_admin_router.get("/api/v1/exhibitors/events/{event_id}/booking-status")
def get_event_booking_status(event_id: str, request: Request):
    user_id = request.query_params.get("user_id") or request.query_params.get("uid")
    email = request.query_params.get("email")
    if not user_id:
        try:
            auth_header = request.headers.get("Authorization")
            if auth_header and auth_header.startswith("Bearer "):
                from app.utils.jwt_utils import decode_access_token
                token = auth_header.split(" ")[1]
                payload = decode_access_token(token)
                if payload:
                    user_id = payload.get("user_id") or payload.get("id") or payload.get("sub")
                    if not email:
                        email = payload.get("email")
        except Exception:
            pass
    return ExhibitorController.get_event_booking_status(event_id, user_id, email)

@root_admin_router.get("/exhibitor/api/my-bookings/{user_id}")
@root_admin_router.get("/exhibitor/api/my-bookings")
@root_admin_router.get("/api/v1/exhibitor/my-bookings/{user_id}")
@root_admin_router.get("/api/v1/exhibitor/my-bookings")
@root_admin_router.get("/api/v1/exhibitors/my-bookings/{user_id}")
@root_admin_router.get("/api/v1/exhibitors/my-bookings")
def get_user_bookings_alias(user_id: Optional[str] = None, uid: Optional[str] = None, request: Request = None):
    target_id = user_id or uid
    if not target_id and request:
        target_id = request.query_params.get("user_id") or request.query_params.get("uid")
    if not target_id and request:
        try:
            auth_header = request.headers.get("Authorization")
            if auth_header and auth_header.startswith("Bearer "):
                from app.utils.jwt_utils import decode_access_token
                token = auth_header.split(" ")[1]
                payload = decode_access_token(token)
                if payload:
                    target_id = payload.get("user_id") or payload.get("id") or payload.get("sub")
        except Exception:
            pass

    status = request.query_params.get("status") if request else None
    search = request.query_params.get("search") if request else None
    host_url = str(request.base_url) if request else "http://localhost:5001/"
    return ExhibitorController.get_user_bookings(target_id, host_url, status=status, search=search)

@root_admin_router.get("/exhibitor/api/booking/{booking_id}")
@root_admin_router.get("/api/v1/exhibitor/booking/{booking_id}")
@root_admin_router.get("/api/v1/exhibitors/booking/{booking_id}")
def get_booking_by_id_alias(booking_id: str, request: Request = None):
    host_url = str(request.base_url) if request else "http://localhost:5001/"
    return ExhibitorController.get_booking_by_id(booking_id, host_url)

@root_admin_router.put("/exhibitor/api/update-booking/{booking_id}")
@root_admin_router.put("/api/v1/exhibitor/update-booking/{booking_id}")
@root_admin_router.put("/api/v1/exhibitors/update-booking/{booking_id}")
async def update_booking_alias(booking_id: str, request: Request = None):
    from app.modules.exhibitors.repository.exhibitor_repository import ExhibitorRepository
    body = await request.json() if request else {}
    booking = ExhibitorRepository.get_booking_by_id(booking_id)
    if not booking:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Booking not found")
    for k, v in body.items():
        if hasattr(booking, k):
            setattr(booking, k, v)
    from app.extensions.database import db
    db.session.commit()
    return {"success": True, "message": "Booking updated successfully", "data": {"id": str(booking.id)}}

@root_admin_router.get("/superadmin/api/organizer/exhibitor-applications")
@root_admin_router.get("/api/v1/organizer/exhibitor-applications")
@root_admin_router.get("/superadmin/api/exhibitor/bookings_details")
def get_all_exhibitor_applications():
    from app.modules.exhibitors.repository.exhibitor_repository import ExhibitorRepository
    rows = ExhibitorRepository.get_all_applications()
    res = []
    for row in rows:
        # get_all_applications returns (ExhibitorStallBooking, event_name, event_status)
        b = row[0]
        evt_name = row[1] if len(row) > 1 else None
        d = b.to_dict() if hasattr(b, "to_dict") else {
            "id": str(b.id), "event_id": str(b.event_id) if b.event_id else None,
            "company_name": getattr(b, "company_name", ""),
            "first_name": getattr(b, "first_name", ""),
            "last_name": getattr(b, "last_name", ""),
            "email": b.email, "mobile": getattr(b, "mobile", ""),
            "stall_area": getattr(b, "stall_area", ""),
            "status": getattr(b, "status", "Pending"),
            "created_at": str(b.created_at) if getattr(b, "created_at", None) else None,
        }
        d["event_name"] = evt_name or "Exhibition Show"
        res.append(d)
    return {"success": True, "data": res}

@root_admin_router.put("/superadmin/api/organizer/exhibitor-applications/{application_id}/status")
@root_admin_router.put("/api/v1/organizer/exhibitor-applications/{application_id}/status")
async def update_exhibitor_application_status(application_id: str, request: Request):
    from app.modules.exhibitors.repository.exhibitor_repository import ExhibitorRepository
    body = await request.json()
    status_val = body.get("status", "Approved")
    rejection_reason = body.get("rejection_reason", "")
    booking = ExhibitorRepository.update_application_status(application_id, status_val, rejection_reason)
    if not booking:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail=f"Application {application_id} not found")
    return {"success": True, "message": f"Stall application {status_val.lower()} successfully", "data": booking.to_dict() if hasattr(booking, 'to_dict') else None}
