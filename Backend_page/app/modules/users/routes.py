from flask import Blueprint, request, jsonify
from app.modules.users.service import UserService

users_module_bp = Blueprint("users_module", __name__)

@users_module_bp.route("/book-event", methods=["POST"])
def book_event():
    data = request.json or {}
    event_id = data.get("event_id")
    name = data.get("name")
    email = data.get("email")
    phone = data.get("phone")
    food_preference = data.get("food_preference", "None")

    if not event_id or not name or not email:
        return jsonify({"status": False, "error": "Missing required fields"}), 400

    result = UserService.book_event(event_id, name, email, phone, food_preference)
    if result["status"]:
        return jsonify(result["data"]), result["code"]
    return jsonify({"status": False, "error": result.get("error", "Booking failed")}), result["code"]

@users_module_bp.route("/validate-booking/<int:booking_id>", methods=["GET"])
def validate_booking(booking_id):
    result = UserService.validate_qr(booking_id)
    if result["status"]:
        return jsonify(result["data"]), result["code"]
    return jsonify({"status": False, "error": result.get("error", "Validation failed")}), result["code"]
