from app.modules.payments.services.payment_service import PaymentService

class PaymentController:
    @staticmethod
    def create_order(raw_data: dict):
        result = PaymentService.create_order(raw_data)
        return {
            "success": True,
            "data": result
        }

    @staticmethod
    def verify_signature(raw_data: dict):
        result = PaymentService.verify_signature(raw_data)
        return {
            "success": True,
            "data": result
        }

    @staticmethod
    def process_refund(raw_data: dict):
        result = PaymentService.process_refund(raw_data)
        return {
            "success": True,
            "data": result
        }

    @staticmethod
    def webhook(payload_body: str, signature_header: str):
        result = PaymentService.handle_webhook(payload_body, signature_header)
        return {
            "success": True,
            "data": result
        }
