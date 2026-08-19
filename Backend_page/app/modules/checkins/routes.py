from flask import Blueprint, jsonify
from app.modules.checkins.service import CheckinService

checkins_module_bp = Blueprint("checkins_module", __name__)

@checkins_module_bp.route("/<int:booking_id>", methods=["POST"])
def checkin(booking_id):
    res, status_code = CheckinService.checkin_attendee(booking_id)
    return jsonify(res), status_code
