import os
import hmac
import hashlib
import logging
from app.exceptions.api_error import ApiError

logger = logging.getLogger(__name__)

try:
    import razorpay
except ImportError:
    razorpay = None

class RazorpayService:
    @staticmethod
    def get_client(key_id: str = None, key_secret: str = None):
        if razorpay is None:
            raise ApiError("Razorpay SDK is not installed", 500)
        kid = key_id or os.getenv("RAZORPAY_KEY_ID")
        ksecret = key_secret or os.getenv("RAZORPAY_KEY_SECRET")
        if not kid or not ksecret:
            raise ApiError("Razorpay credentials missing in environment config", 500)
        return razorpay.Client(auth=(kid, ksecret))

    @staticmethod
    def create_order(amount: float, currency: str = "INR", organizer_account_id: str = None, commission_percent: float = 5.0, receipt: str = None, notes: dict = None) -> dict:
        client = RazorpayService.get_client()
        amount_paise = int(round(amount * 100))

        order_payload = {
            "amount": amount_paise,
            "currency": currency,
            "receipt": receipt or "receipt_1",
            "notes": notes or {}
        }

        if organizer_account_id:
            organizer_share = int(round(amount_paise * (1 - (commission_percent / 100.0))))
            order_payload["transfers"] = [
                {
                    "account": organizer_account_id,
                    "amount": organizer_share,
                    "currency": currency,
                    "notes": {"transfer_type": "organizer_payout"},
                    "on_hold": 0
                }
            ]

        try:
            order = client.order.create(data=order_payload)
            order["key_id"] = os.getenv("RAZORPAY_KEY_ID")
            return order
        except Exception as e:
            logger.error(f"Razorpay Order creation error: {str(e)}")
            raise ApiError(f"Razorpay order failed: {str(e)}", 400)

    @staticmethod
    def verify_signature(order_id: str, payment_id: str, signature: str) -> bool:
        client = RazorpayService.get_client()
        params_dict = {
            "razorpay_order_id": order_id,
            "razorpay_payment_id": payment_id,
            "razorpay_signature": signature
        }
        try:
            client.utility.verify_payment_signature(params_dict)
            return True
        except Exception as e:
            logger.warning(f"Razorpay signature verification failed: {str(e)}")
            return False

    @staticmethod
    def process_refund(payment_id: str, amount: float = None, reverse_all: bool = True) -> dict:
        client = RazorpayService.get_client()
        refund_data = {"reverse_all": 1 if reverse_all else 0}
        if amount and amount > 0:
            refund_data["amount"] = int(round(amount * 100))
        try:
            return client.payment.refund(payment_id, refund_data)
        except Exception as e:
            logger.error(f"Razorpay refund error: {str(e)}")
            raise ApiError(f"Razorpay refund failed: {str(e)}", 400)

    @staticmethod
    def verify_webhook_signature(body: str, signature: str) -> bool:
        secret = os.getenv("RAZORPAY_WEBHOOK_SECRET")
        if not secret:
            return True
        expected_sig = hmac.new(secret.encode(), body.encode(), hashlib.sha256).hexdigest()
        return hmac.compare_digest(expected_sig, signature)
