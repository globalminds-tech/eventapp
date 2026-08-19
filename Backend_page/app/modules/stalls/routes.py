from flask import Blueprint, jsonify
from app.modules.stalls.service import StallService

stalls_module_bp = Blueprint("stalls_module", __name__)

@stalls_module_bp.route("/event/<int:event_id>", methods=["GET"])
def get_event_stalls(event_id):
    res = StallService.get_event_stalls(event_id)
    return jsonify(res)
