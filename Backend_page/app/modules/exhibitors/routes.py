from flask import Blueprint, request, jsonify, current_app
from app.modules.exhibitors.service import ExhibitorService

exhibitors_module_bp = Blueprint("exhibitors_module", __name__)

@exhibitors_module_bp.route("/book-stall", methods=["POST"])
def book_stall():
    form_data = request.form.to_dict()
    file_obj = request.files.get("visiting_card")
    upload_folder = current_app.config.get("UPLOAD_FOLDER", "app/uploads")

    res = ExhibitorService.book_stall(form_data, file_obj, upload_folder)
    return jsonify(res), res.get("code", 200)

@exhibitors_module_bp.route("/bookings/<int:user_id>", methods=["GET"])
def get_user_bookings(user_id):
    res = ExhibitorService.get_user_bookings(user_id, request.host_url)
    return jsonify(res)
