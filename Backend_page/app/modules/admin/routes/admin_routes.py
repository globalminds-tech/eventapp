from datetime import datetime
from fastapi import APIRouter, Depends, Request, UploadFile, File
from app.modules.admin.controllers.admin_controller import AdminController
from app.modules.admin.schemas.admin_schema import (
    UpdateEventStatusSchema, CategorySchema, UpdateKycStatusSchema
)
from app.middleware.auth import require_roles

admin_router = APIRouter(prefix="/api/v1/admin", tags=["Super Admin Governance"])
root_admin_router = APIRouter(prefix="", tags=["Super Admin Aliases"])
admin_auth = Depends(require_roles(["admin", "superuser"]))

# ── SUPER ADMIN DASHBOARD EXECUTIVE STATS ──

@root_admin_router.get("/superuser/dashboard-stats")
@root_admin_router.get("/superadmin/api/dashboard-stats")
def get_dashboard_stats_alias(period: str = "30d"):
    return AdminController.get_dashboard_stats(period=period)

# ── SUPER ADMIN EVENTS & APPROVAL QUEUE ──

@admin_router.get("/events")
@admin_router.post("/events")
@root_admin_router.get("/superadmin/api/events_detail")
@root_admin_router.get("/superadmin/api/eventshow")
@root_admin_router.get("/superadmin/home/get-events")
@root_admin_router.post("/superadmin/home/get-events")
@root_admin_router.get("/superadmin/api/get-events")
@root_admin_router.post("/superadmin/api/get-events")
@root_admin_router.get("/superadmin/get-events")
@root_admin_router.get("/superuser/get-events")
def get_events(request: Request, organizer: str = None, organizer_id: str = None):
    try:
        host_url = str(request.base_url)
        target_organizer = organizer or organizer_id

        if not target_organizer:
            auth_header = request.headers.get("Authorization") or ""
            if auth_header.startswith("Bearer "):
                token = auth_header.split(" ")[1]
                try:
                    import jwt
                    from app.utils.jwt_utils import JWT_SECRET_KEY, JWT_ALGORITHM
                    payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
                    user_id = payload.get("user_id") or payload.get("id") or payload.get("sub")
                    if user_id:
                        target_organizer = str(user_id)
                except Exception:
                    pass

        return AdminController.get_events(host_url=host_url, organizer_id=target_organizer)
    except Exception as e:
        print("[get_events Exception]:", e)
        return {"success": True, "data": []}

@root_admin_router.put("/superuser/update-status/{event_id}")
@root_admin_router.put("/superadmin/api/update-status/{event_id}")
@root_admin_router.post("/superuser/update-status/{event_id}")
async def update_status_alias(event_id: str, request: Request):
    body = await request.json()
    return AdminController.update_event_status(event_id, body)

@admin_router.put("/events/{event_id}/status")
def update_event_status(event_id: str, payload: UpdateEventStatusSchema, user: dict = admin_auth):
    return AdminController.update_event_status(event_id, payload.dict())

# ── SUPER ADMIN CATEGORY MASTER & BULK IMPORT ──

@root_admin_router.get("/superadmin/api/categories")
@root_admin_router.get("/superuser/categories")
@admin_router.get("/categories")
def get_categories():
    return AdminController.get_categories()

@root_admin_router.post("/superadmin/api/categories")
@root_admin_router.post("/superuser/categories")
async def create_category_alias(request: Request):
    data = await request.json()
    return AdminController.create_category(data)

@admin_router.post("/categories", status_code=201)
def create_category(payload: CategorySchema, user: dict = admin_auth):
    return AdminController.create_category(payload.dict())

@root_admin_router.put("/superadmin/api/categories/{cat_id}")
@root_admin_router.put("/superuser/categories/{cat_id}")
async def update_category_alias(cat_id: str, request: Request):
    data = await request.json()
    return AdminController.update_category(cat_id, data)

@root_admin_router.delete("/superadmin/api/categories/{cat_id}")
@root_admin_router.delete("/superuser/categories/{cat_id}")
def delete_category_alias(cat_id: str):
    return AdminController.delete_category(cat_id)

@root_admin_router.post("/superadmin/api/upload-category-image")
@root_admin_router.post("/api/upload-category-image")
async def upload_category_image_to_supabase_endpoint(file: UploadFile = File(...)):
    import os, requests
    supabase_url = os.getenv("SUPABASE_URL", "https://oebnblvwjvtsngubzcic.supabase.co").rstrip("/")
    service_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    bucket = os.getenv("STORAGE_BUCKET", "event-assets")
    
    if not service_key:
        return {"success": False, "message": "Supabase credentials missing: SUPABASE_SERVICE_ROLE_KEY is not set."}
        
    file_content = await file.read()
    file_name = f"cat_{int(datetime.utcnow().timestamp())}_{file.filename.replace(' ', '_')}"
    upload_url = f"{supabase_url}/storage/v1/object/{bucket}/{file_name}"
    
    headers = {
        "Authorization": f"Bearer {service_key}",
        "apikey": service_key,
        "Content-Type": file.content_type or "image/jpeg"
    }
    
    try:
        res = requests.post(upload_url, data=file_content, headers=headers)
        if res.status_code in [200, 201]:
            public_url = f"{supabase_url}/storage/v1/object/public/{bucket}/{file_name}"
            return {"success": True, "url": public_url}
        else:
            return {"success": False, "message": f"Supabase Storage error ({res.status_code}): {res.text}"}
    except Exception as e:
        return {"success": False, "message": f"Upload network error: {str(e)}"}

@root_admin_router.post("/superuser/categories/bulk-import")
@root_admin_router.post("/superadmin/api/categories/bulk-import")
async def bulk_import_categories_alias(request: Request):
    data = await request.json()
    cats = data.get("categories", [])
    count = 0
    for c in cats:
        try:
            AdminController.create_category(c)
            count += 1
        except Exception:
            pass
    return {"success": True, "message": f"Successfully imported {count} categories", "count": count}

@root_admin_router.post("/superadmin/api/categories/seed-master")
@root_admin_router.post("/superuser/categories/seed-master")
def seed_master_categories():
    master_list = [
        {"name": "Tech & Innovation Expos", "subcategories": ["AI & Machine Learning", "Software & SaaS", "Web3 & Crypto", "Cybersecurity", "Robotics & IoT", "Startups"], "icon_name": "Cpu"},
        {"name": "Music & Performing Arts", "subcategories": ["Rock & Metal", "Pop & EDM", "Classical & Instrumental", "Standup Comedy", "Theatre & Drama", "Live Concerts"], "icon_name": "Music"},
        {"name": "Business & Trade Fairs", "subcategories": ["Industrial Machinery", "Real Estate & Architecture", "Import/Export", "B2B Networking", "Financial Services"], "icon_name": "Briefcase"},
        {"name": "Healthcare & Bio-Pharma", "subcategories": ["Medical Equipment Expo", "Dental & Pharma", "Wellness & Fitness", "Biotech Summit", "Ayurveda & Organic"], "icon_name": "HeartPulse"},
        {"name": "Fashion, Lifestyle & Luxury", "subcategories": ["Haute Couture", "Jewellery & Gems", "Bridal & Wedding Expo", "Footwear & Accessories", "Boutique Retail"], "icon_name": "ShoppingBag"},
        {"name": "Food, Beverage & Hospitality", "subcategories": ["Gourmet Food Fest", "Coffee & Craft Beer", "Hospitality Expo", "Catering & Culinary Workshops", "Bakery & Pastry"], "icon_name": "Utensils"},
        {"name": "Automotive & Clean Energy", "subcategories": ["Electric Vehicles (EV)", "Supercars & Biking", "Solar & Renewable Energy", "Auto Spare Parts", "Fleet Logistics"], "icon_name": "Zap"},
        {"name": "Education, Careers & EdTech", "subcategories": ["Higher Education Overseas", "Career Fairs", "EdTech & E-Learning", "School & University Summits", "Book Fairs"], "icon_name": "GraduationCap"},
        {"name": "Sports, Gaming & Esports", "subcategories": ["Esports Tournaments", "Marathon & Athletics", "Football & Cricket Leagues", "Gaming Hardware", "Fitness Expos"], "icon_name": "Trophy"},
        {"name": "Arts, Culture & Heritage", "subcategories": ["Art Gallery Exhibitions", "Handicrafts & Artisans", "Cultural Heritage Fests", "Photography Expos", "Film Festivals"], "icon_name": "Palette"}
    ]
    added = 0
    for cat in master_list:
        try:
            AdminController.create_category(cat)
            added += 1
        except Exception:
            pass
    return {"success": True, "message": f"Successfully seeded {added} Master Categories into Database", "count": added}

# ── ORGANIZER CATEGORY REQUESTS ──

@root_admin_router.get("/superadmin/api/category-requests")
@root_admin_router.get("/superuser/category-requests")
@admin_router.get("/category-requests")
def get_category_requests():
    return AdminController.get_category_requests()

@root_admin_router.post("/api/v1/organizer/category-requests")
@root_admin_router.post("/organizer/category-requests")
async def submit_category_request(request: Request):
    data = await request.json()
    return AdminController.submit_category_request(data)

@root_admin_router.put("/superadmin/api/category-requests/{request_id}")
@root_admin_router.put("/superuser/category-requests/{request_id}")
async def update_category_request_status(request_id: str, request: Request):
    data = await request.json()
    return AdminController.update_category_request_status(request_id, data)

# ── SUPER ADMIN ORGANIZER KYC AUDIT ──

@root_admin_router.get("/superuser/organizers/pending")
@root_admin_router.get("/superadmin/api/organizers/pending")
@admin_router.get("/organizers/pending")
def get_pending_organizers():
    return AdminController.get_pending_organizers()

@root_admin_router.get("/superuser/users")
@root_admin_router.get("/superadmin/api/users")
@admin_router.get("/users")
def get_all_users_alias():
    return AdminController.get_all_users()

@root_admin_router.put("/superuser/organizers/{user_id}/kyc-status")
@root_admin_router.put("/superadmin/api/organizers/{user_id}/kyc-status")
async def update_organizer_kyc_status_alias(user_id: str, request: Request):
    data = await request.json()
    return AdminController.update_organizer_kyc_status(user_id, data)

@admin_router.put("/organizers/{user_id}/kyc-status")
def update_organizer_kyc_status(user_id: str, payload: UpdateKycStatusSchema):
    return AdminController.update_organizer_kyc_status(user_id, payload.dict())

@root_admin_router.get("/superadmin/api/events-check-in")
@root_admin_router.get("/superuser/events-check-in")
def get_events_check_in():
    from app.extensions.database import db
    from app.models.event import EventDetails
    from app.models.booking import UserBookingDetails
    from sqlalchemy import select, func

    events = db.session.scalars(select(EventDetails).order_by(EventDetails.created_at.desc()).limit(20)).all()
    data = []
    for e in events:
        total_bookings = db.session.scalar(
            select(func.count(UserBookingDetails.id)).where(UserBookingDetails.event_id == e.id)
        ) or 0
        scanned_count = db.session.scalar(
            select(func.count(UserBookingDetails.id)).where(UserBookingDetails.event_id == e.id, UserBookingDetails.is_scanned == True)
        ) or 0
        data.append({
            "id": str(e.id),
            "event_name": e.event_name or "Live Event",
            "start_date": str(e.start_date) if e.start_date else "",
            "end_date": str(e.end_date) if e.end_date else "",
            "redemptions": f"{scanned_count}/{total_bookings}"
        })
    return {
        "success": True,
        "data": data
    }
