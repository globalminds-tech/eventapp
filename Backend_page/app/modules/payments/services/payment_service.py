from app.exceptions.api_error import ApiError
from app.modules.payments.services.razorpay_service import RazorpayService
from app.modules.payments.schemas.payment_schema import (
    CreateOrderSchema, VerifySignatureSchema, RefundSchema
)

class PaymentService:
    @staticmethod
    def create_order(raw_data: dict) -> dict:
        data = CreateOrderSchema(**raw_data)
        try:
            order = RazorpayService.create_order(
                amount=data.amount,
                currency=data.currency,
                organizer_account_id=data.organizer_account_id,
                commission_percent=data.commission_percent,
                receipt=data.receipt,
                notes=data.notes or {}
            )
            return {
                "order": order,
                "key_id": order.get("key_id")
            }
        except ApiError:
            raise
        except Exception as e:
            raise ApiError(f"Razorpay order creation failed: {str(e)}", 400)

    @staticmethod
    def verify_signature(raw_data: dict) -> dict:
        data = VerifySignatureSchema(**raw_data)
        is_valid = RazorpayService.verify_signature(
            data.razorpay_order_id,
            data.razorpay_payment_id,
            data.razorpay_signature
        )
        if not is_valid:
            raise ApiError("Invalid payment signature", 400)

        return {
            "message": "Payment signature verified successfully",
            "payment_id": data.razorpay_payment_id,
            "order_id": data.razorpay_order_id
        }

    @staticmethod
    def process_refund(raw_data: dict) -> dict:
        data = RefundSchema(**raw_data)
        try:
            refund = RazorpayService.process_refund(
                data.payment_id,
                amount=data.amount,
                reverse_all=True
            )
            return {
                "message": "Refund processed successfully",
                "refund": refund
            }
        except ApiError:
            raise
        except Exception as e:
            raise ApiError(f"Refund processing failed: {str(e)}", 400)

    @staticmethod
    def handle_webhook(payload_body: str, signature_header: str) -> dict:
        if signature_header and not RazorpayService.verify_webhook_signature(payload_body, signature_header):
            raise ApiError("Invalid webhook signature", 400)
        return {"status": "ok"}
