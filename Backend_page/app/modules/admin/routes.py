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
