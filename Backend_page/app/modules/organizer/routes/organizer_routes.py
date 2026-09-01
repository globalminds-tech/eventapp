from fastapi import APIRouter, Depends, Request, UploadFile, File, HTTPException
from app.modules.organizer.controllers.organizer_controller import OrganizerController

organizer_router = APIRouter(prefix="/api/v1/organizer", tags=["Organizer Portal"])
root_organizer_router = APIRouter(prefix="", tags=["Organizer Aliases"])

# ── ORGANIZER FILE UPLOADS ──

@root_organizer_router.post("/api/upload-image")
@root_organizer_router.post("/superadmin/upload/all-docs")
async def upload_image_alias(file: UploadFile = File(...)):
    contents = await file.read()
    return OrganizerController.upload_banner(contents, file.filename, file.content_type or "image/jpeg")

# ── ORGANIZER EVENT CREATION & WIZARD ──

@root_organizer_router.post("/superadmin/api/complete-event")
@root_organizer_router.post("/superadmin/event/final-submit")
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
        return OrganizerController.create_event(body, user_id=user_id)
    except HTTPException as http_err:
        raise http_err
    except Exception as err:
        print("Database Save Error:", str(err))
        raise HTTPException(status_code=500, detail=f"Database Save Failed: {str(err)}")

@root_organizer_router.get("/superadmin/api/event-detail/{event_id}")
@root_organizer_router.get("/superadmin/get-event/{event_id}")
@root_organizer_router.get("/superadmin/api/event-full-details/{event_id}")
@root_organizer_router.get("/superuser/event-full-details/{event_id}")
def get_event_detail_alias(event_id: str):
    return OrganizerController.get_event(event_id)

@root_organizer_router.put("/superadmin/api/update-event/{event_id}")
@root_organizer_router.patch("/superadmin/api/update-event/{event_id}")
@root_organizer_router.put("/superadmin/api/update_event/{event_id}")
@root_organizer_router.patch("/superadmin/api/update_event/{event_id}")
@root_organizer_router.post("/superadmin/api/update_event/{event_id}")
async def update_event_alias(event_id: str, request: Request):
    body = await request.json()
    return OrganizerController.update_event(event_id, body)

# ── ORGANIZER VENUES & MASTERS ──

@root_organizer_router.get("/superadmin/api/venues_details")
def get_venues_details_alias(organizer_id: int = None):
    return OrganizerController.get_venues(organizer_id)

@root_organizer_router.get("/superadmin/api/venuedetail/{venue_id}")
def get_single_venue_detail_alias(venue_id: int):
    venues = OrganizerController.get_venues()
    matched = next((v for v in venues if v["id"] == venue_id), venues[0])
    return matched

@root_organizer_router.post("/superadmin/api/create_venue")
async def create_venue_route(request: Request):
    data = await request.json()
    user_id = data.get("organizer_id")
    result = OrganizerController.create_venue(data, user_id)
    return { "success": True, "message": "Venue created successfully", "data": result }

# ── ORGANIZER VENDORS & SPONSORS ──

@root_organizer_router.get("/superadmin/api/get-vendor-types")
def get_vendor_types_alias():
    return OrganizerController.get_vendor_types()

@root_organizer_router.get("/superadmin/api/get-sponsor-names")
def get_sponsor_names_alias():
    return OrganizerController.get_sponsors()

@root_organizer_router.get("/superadmin/api/get-vendor-names/{vendor_type}")
def get_vendor_names_by_type(vendor_type: str):
    return OrganizerController.get_vendor_names(vendor_type)

@root_organizer_router.post("/superadmin/api/create_vendor")
async def create_vendor_route(request: Request):
    data = await request.json()
    user_id = data.get("organizer_id")
    result = OrganizerController.create_vendor(data, user_id)
    return { "success": True, "message": "Vendor created successfully", "data": result }

@root_organizer_router.post("/superadmin/api/sponsorship")
async def create_sponsor_route(request: Request):
    data = await request.json()
    user_id = data.get("organizer_id")
    result = OrganizerController.create_sponsor(data, user_id)
    return { "success": True, "message": "Sponsor created successfully", "data": result }

# ── ORGANIZER POLICIES ──

@root_organizer_router.get("/superadmin/api/all-policies/{organizer_id}")
@root_organizer_router.get("/superadmin/api/all-policies")
def get_policies_alias(organizer_id: int = None):
    return OrganizerController.get_policies(organizer_id)

# ── ORGANIZER ONBOARDING & KYC ──

@organizer_router.post("/kyc-submit")
async def submit_kyc(request: Request):
    data = await request.json()
    user_id = data.get("user_id", 1)
    return OrganizerController.submit_kyc(user_id, data)
