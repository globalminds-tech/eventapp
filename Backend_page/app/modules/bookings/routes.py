from flask import Blueprint, request, jsonify
from app.modules.bookings.service import BookingService

bookings_module_bp = Blueprint("bookings_module", __name__)

@bookings_module_bp.route("/user", methods=["GET"])
def get_user_bookings():
    email = request.args.get("email", "")
    res = BookingService.get_user_bookings(email)
    return jsonify(res)
