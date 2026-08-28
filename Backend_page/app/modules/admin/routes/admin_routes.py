from fastapi import APIRouter, Depends, Request, HTTPException
from app.modules.admin.controllers.admin_controller import AdminController
from app.modules.admin.schemas.admin_schema import (
    UpdateEventStatusSchema, CategorySchema, UpdateKycStatusSchema
)
from app.middleware.auth import require_roles
from app.models.event import EventDetails
from app.extensions.database import db

admin_router = APIRouter(prefix="/api/v1/admin", tags=["Admin"])
root_admin_router = APIRouter(prefix="", tags=["Root Admin Aliases"])
admin_auth = Depends(require_roles(["admin", "superuser"]))

@admin_router.get("/events")
@root_admin_router.get("/superadmin/api/events_detail")
@root_admin_router.get("/superadmin/home/get-events")
@root_admin_router.get("/superadmin/api/get-events")
@root_admin_router.get("/superadmin/get-events")
def get_events(request: Request, organizer: str = None):
    host_url = str(request.base_url)
    return AdminController.get_events(host_url=host_url, organizer_id=organizer)

from fastapi import UploadFile, File
from app.extensions.storage import StorageService
from app.modules.events.controllers.event_controller import EventController

@root_admin_router.post("/api/upload-image")
@root_admin_router.post("/superadmin/upload/all-docs")
async def upload_image_alias(file: UploadFile = File(...)):
    contents = await file.read()
    public_url = StorageService.upload_file_bytes(contents, file.filename, file.content_type or "image/jpeg", folder="banners")
    return {"success": True, "url": public_url, "file_path": public_url}

@root_admin_router.post("/superadmin/api/complete-event")
@root_admin_router.post("/superadmin/event/final-submit")
async def complete_event_alias(request: Request):
    try:
        body = await request.json()
        user_id = None
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            try:
                from app.utils.jwt_utils import decode_token
                tok = auth_header.split(" ")[1]
                payload = decode_token(tok)
                user_id = payload.get("user_id") or payload.get("id")
            except Exception:
                pass
        return EventController.create_event(body, user_id=user_id)
    except HTTPException as http_err:
        raise http_err
    except Exception as err:
        print("Database Save Error:", str(err))
        raise HTTPException(status_code=500, detail=f"Database Save Failed: {str(err)}")

@root_admin_router.get("/superadmin/api/event-detail/{event_id}")
@root_admin_router.get("/superadmin/get-event/{event_id}")
@root_admin_router.get("/superadmin/api/event-full-details/{event_id}")
@root_admin_router.get("/superuser/event-full-details/{event_id}")
def get_event_detail_alias(event_id: str):
    return EventController.get_event(event_id)

@root_admin_router.put("/superadmin/api/update-event/{event_id}")
@root_admin_router.patch("/superadmin/api/update-event/{event_id}")
@root_admin_router.put("/superadmin/api/update_event/{event_id}")
@root_admin_router.patch("/superadmin/api/update_event/{event_id}")
@root_admin_router.post("/superadmin/api/update_event/{event_id}")
async def update_event_alias(event_id: str, request: Request):
    body = await request.json()
    return EventController.update_event(event_id, body)

@root_admin_router.get("/superadmin/api/venues_details")
def get_venues_details_alias(organizer_id: int = None):
    return [
        { "id": 1, "venue_name": "Grand Convention Center", "city_name": "Chennai", "address": "123 MRC Nagar, Chennai" },
        { "id": 2, "venue_name": "Cyber City Auditorium", "city_name": "Bangalore", "address": "100 Innovation Way, Cyber City, Bangalore" },
        { "id": 3, "venue_name": "International Expo Center", "city_name": "Hyderabad", "address": "HITEC City Main Road, Hyderabad" },
        { "id": 4, "venue_name": "Royal Palace Grounds", "city_name": "Mumbai", "address": "BKC Complex, Bandra East, Mumbai" },
    ]

@root_admin_router.get("/superadmin/api/venuedetail/{venue_id}")
def get_single_venue_detail_alias(venue_id: int):
    venues = [
        { "id": 1, "venue_name": "Grand Convention Center", "city_name": "Chennai", "address": "123 MRC Nagar, Chennai" },
        { "id": 2, "venue_name": "Cyber City Auditorium", "city_name": "Bangalore", "address": "100 Innovation Way, Cyber City, Bangalore" },
        { "id": 3, "venue_name": "International Expo Center", "city_name": "Hyderabad", "address": "HITEC City Main Road, Hyderabad" },
        { "id": 4, "venue_name": "Royal Palace Grounds", "city_name": "Mumbai", "address": "BKC Complex, Bandra East, Mumbai" },
    ]
    matched = next((v for v in venues if v["id"] == venue_id), venues[0])
    return matched

@root_admin_router.get("/superadmin/api/get-vendor-types")
def get_vendor_types_alias():
    return [
        { "vendor_type": "Catering & Beverages" },
        { "vendor_type": "Audio & Visual Systems" },
        { "vendor_type": "Security & Bouncers" },
        { "vendor_type": "Stage & Decoration" },
        { "vendor_type": "Lighting & Power Backup" },
        { "vendor_type": "Photography & Videography" },
    ]

@root_admin_router.get("/superadmin/api/get-sponsor-names")
def get_sponsor_names_alias():
    return [
        { "sponsor_name": "Red Bull Energy" },
        { "sponsor_name": "Tech Corp Global" },
        { "sponsor_name": "Monster Energy" },
        { "sponsor_name": "Samsung Electronics" },
        { "sponsor_name": "Intel Corporation" },
    ]

@root_admin_router.get("/superadmin/api/get-vendor-names/{vendor_type}")
def get_vendor_names_by_type(vendor_type: str):
    """Return demo vendor names for any vendor category type."""
    return [
        { "vendor_name": "Apex Event Services" },
        { "vendor_name": "SoundCraft Pro Systems" },
        { "vendor_name": "Guardian Security Services" },
        { "vendor_name": "Starlight Decorators" },
        { "vendor_name": "PowerGrid Electricals" },
    ]

@root_admin_router.post("/superadmin/api/create_vendor")
async def create_vendor_stub(request: Request):
    """Stub: create a new vendor record."""
    data = await request.json()
    return { "success": True, "message": "Vendor created successfully", "data": data }

@root_admin_router.post("/superadmin/api/sponsorship")
async def create_sponsor_stub(request: Request):
    """Stub: create a new sponsor record."""
    data = await request.json()
    return { "success": True, "message": "Sponsor created successfully", "data": data }

@root_admin_router.get("/superadmin/api/all-policies/{organizer_id}")
@root_admin_router.get("/superadmin/api/all-policies")
def get_policies_alias(organizer_id: int = None):
    return [
        {
            "id": 1,
            "policy_group": "Cancellation Policy",
            "policy_type": "General Cancellation",
            "policy_name": "Standard 48-Hour Refund Policy",
            "description": "Full refund available up to 48 hours before event start date."
        },
        {
            "id": 2,
            "policy_group": "Cancellation Policy",
            "policy_type": "General Cancellation",
            "policy_name": "Non-Refundable Ticket",
            "description": "Tickets are strictly non-refundable once purchased."
        },
        {
            "id": 3,
            "policy_group": "Refund Policy",
            "policy_type": "Payment Return",
            "policy_name": "5-7 Business Days Payout",
            "description": "Refunds will be credited to original payment method within 5-7 business days."
        },
        {
            "id": 4,
            "policy_group": "Safety Policy",
            "policy_type": "Venue Security",
            "policy_name": "Mandatory Government ID Verification",
            "description": "All attendees must present a valid government-issued photo ID at entry."
        }
    ]

@admin_router.put("/events/{event_id}/status")
def update_event_status(event_id: int, payload: UpdateEventStatusSchema, user: dict = admin_auth):
    return AdminController.update_event_status(event_id, payload.dict())

@admin_router.get("/categories")
def get_categories():
    return AdminController.get_categories()

@admin_router.post("/categories", status_code=201)
def create_category(payload: CategorySchema, user: dict = admin_auth):
    return AdminController.create_category(payload.dict())

@admin_router.get("/organizers/pending")
def get_pending_organizers(user: dict = admin_auth):
    return AdminController.get_pending_organizers()

@admin_router.put("/organizers/{user_id}/kyc-status")
def update_organizer_kyc_status(user_id: int, payload: UpdateKycStatusSchema, user: dict = admin_auth):
    return AdminController.update_organizer_kyc_status(user_id, payload.dict())
