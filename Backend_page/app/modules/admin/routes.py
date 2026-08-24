from flask import Blueprint, request, jsonify
from app.modules.admin.service import AdminService
from app.middleware.role_required import role_required

admin_module_bp = Blueprint("admin_module", __name__)

@admin_module_bp.route("/events", methods=["GET"])
def get_admin_events():
    res = AdminService.get_events(request.host_url)
    return jsonify(res)

@admin_module_bp.route("/events/<int:event_id>/status", methods=["PUT"])
def update_event_status(event_id):
    data = request.json or {}
    status = data.get("status")
    res, status_code = AdminService.update_event_status(event_id, status)
    return jsonify(res), status_code

@admin_module_bp.route("/categories", methods=["GET"])
def get_categories():
    res = AdminService.get_categories()
    return jsonify(res)

@admin_module_bp.route("/organizers/kyc-pending", methods=["GET"])
def get_pending_organizers():
    res = AdminService.get_pending_organizers()
    return jsonify(res)

@admin_module_bp.route("/organizers/<int:user_id>/kyc-status", methods=["PUT"])
def update_organizer_kyc_status(user_id):
    data = request.json or {}
    status = data.get("status", "VERIFIED")
    res, status_code = AdminService.update_organizer_kyc_status(user_id, status)
    return jsonify(res), status_code


