from flask import Blueprint, jsonify
from app.modules.events.service import EventService

events_module_bp = Blueprint("events_module", __name__)

@events_module_bp.route("/summary", methods=["GET"])
def get_events_summary():
    res = EventService.get_events_summary()
    return jsonify(res)

@events_module_bp.route("/<int:event_id>", methods=["GET"])
def get_event_detail(event_id):
    res, status_code = EventService.get_event_detail(event_id)
    return jsonify(res), status_code
