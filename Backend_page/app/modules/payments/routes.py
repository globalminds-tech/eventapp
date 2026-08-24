import json
import logging
from flask import Blueprint, request, jsonify
from app.modules.payments.razorpay_service import RazorpayService

logger = logging.getLogger(__name__)

payments_module_bp = Blueprint("payments_module", __name__)

@payments_module_bp.route("/create-order", methods=["POST"])
def create_order():
    """
    Creates a Razorpay Order.
    Payload: { "amount": 1000, "currency": "INR", "organizer_account_id": "acc_xxx", "receipt": "..." }
    """
    data = request.json or {}
    amount = data.get("amount")
    if not amount or float(amount) <= 0:
        return jsonify({"success": False, "message": "Invalid amount"}), 400

    currency = data.get("currency", "INR")
    organizer_account_id = data.get("organizer_account_id")
    commission_percent = data.get("commission_percent", 5.0)
    receipt = data.get("receipt")
    notes = data.get("notes", {})

    try:
        order = RazorpayService.create_order(
            amount=amount,
            currency=currency,
            organizer_account_id=organizer_account_id,
            commission_percent=commission_percent,
            receipt=receipt,
            notes=notes
        )
        return jsonify({
            "success": True,
            "order": order,
            "key_id": order.get("key_id")
        }), 200
    except Exception as e:
        logger.error(f"Error in create_order route: {str(e)}")
        return jsonify({"success": False, "message": str(e)}), 500


@payments_module_bp.route("/verify-signature", methods=["POST"])
def verify_signature():
    """
    Verifies HMAC-SHA256 signature from Razorpay checkout.
    Payload: { "razorpay_order_id": "...", "razorpay_payment_id": "...", "razorpay_signature": "..." }
    """
    data = request.json or {}
    order_id = data.get("razorpay_order_id")
    payment_id = data.get("razorpay_payment_id")
    signature = data.get("razorpay_signature")

    if not order_id or not payment_id or not signature:
        return jsonify({"success": False, "message": "Missing required signature fields"}), 400

    is_valid = RazorpayService.verify_signature(order_id, payment_id, signature)
    if is_valid:
        return jsonify({
            "success": True,
            "message": "Payment signature verified successfully",
            "payment_id": payment_id,
            "order_id": order_id
        }), 200
    else:
        return jsonify({
            "success": False,
            "message": "Invalid payment signature"
        }), 400


@payments_module_bp.route("/refund", methods=["POST"])
def process_refund():
    """
    Processes a refund with automatic Route reversal (reverse_all=True).
    Payload: { "payment_id": "pay_xxx", "amount": 1000 }
    """
    data = request.json or {}
    payment_id = data.get("payment_id")
    amount = data.get("amount")

    if not payment_id:
        return jsonify({"success": False, "message": "payment_id is required"}), 400

    try:
        refund = RazorpayService.process_refund(payment_id, amount=amount, reverse_all=True)
        return jsonify({
            "success": True,
            "message": "Refund processed successfully",
            "refund": refund
        }), 200
    except Exception as e:
        logger.error(f"Error in process_refund route: {str(e)}")
        return jsonify({"success": False, "message": str(e)}), 500


@payments_module_bp.route("/webhook", methods=["POST"])
def razorpay_webhook():
    """
    Listens for async webhook callbacks from Razorpay.
    """
    payload_body = request.get_data(as_text=True)
    signature_header = request.headers.get("X-Razorpay-Signature")

    # Verify signature if webhook secret is configured
    if signature_header and not RazorpayService.verify_webhook_signature(payload_body, signature_header):
        logger.warning("Razorpay Webhook signature verification failed")
        return jsonify({"status": "invalid_signature"}), 400

    try:
        event_data = json.loads(payload_body)
        event_name = event_data.get("event")
        logger.info(f"Received Razorpay Webhook Event: {event_name}")

        payload = event_data.get("payload", {})

        if event_name == "payment.captured":
            payment_entity = payload.get("payment", {}).get("entity", {})
            payment_id = payment_entity.get("id")
            order_id = payment_entity.get("order_id")
            logger.info(f"Payment Captured Callback: {payment_id} for Order {order_id}")
            # Handle payment success DB updates if needed

        elif event_name == "refund.processed":
            refund_entity = payload.get("refund", {}).get("entity", {})
            refund_id = refund_entity.get("id")
            payment_id = refund_entity.get("payment_id")
            logger.info(f"Refund Processed Callback: {refund_id} for Payment {payment_id}")

        return jsonify({"status": "ok"}), 200
    except Exception as e:
        logger.error(f"Error processing webhook: {str(e)}")
        return jsonify({"status": "error", "message": str(e)}), 500
