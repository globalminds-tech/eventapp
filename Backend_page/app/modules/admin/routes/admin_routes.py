from fastapi import APIRouter, Depends, Request
from app.modules.admin.controllers.admin_controller import AdminController
from app.modules.admin.schemas.admin_schema import (
    UpdateEventStatusSchema, CategorySchema, UpdateKycStatusSchema
)
from app.middleware.auth import require_roles

admin_router = APIRouter(prefix="/api/v1/admin", tags=["Admin"])
admin_auth = Depends(require_roles(["admin", "superuser"]))

@admin_router.get("/events")
def get_events(request: Request, user: dict = admin_auth):
    host_url = str(request.base_url)
    return AdminController.get_events(host_url)

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
