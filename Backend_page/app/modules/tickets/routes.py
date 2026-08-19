from flask import Blueprint, jsonify
from app.modules.tickets.service import TicketService

tickets_module_bp = Blueprint("tickets_module", __name__)

@tickets_module_bp.route("/generate/<int:booking_id>", methods=["POST"])
def generate_ticket(booking_id):
    res = TicketService.generate_ticket(booking_id)
    return jsonify(res)
