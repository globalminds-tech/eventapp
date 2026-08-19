from flask import Blueprint, request, jsonify
from app.modules.payments.service import PaymentService

payments_module_bp = Blueprint("payments_module", __name__)

@payments_module_bp.route("/verify", methods=["POST"])
def verify_payment():
    data = request.json or {}
    amount = data.get("amount", 0)
    currency = data.get("currency", "INR")
    res = PaymentService.process_payment(amount, currency)
    return jsonify(res)
