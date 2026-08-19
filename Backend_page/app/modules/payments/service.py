class PaymentService:
    @staticmethod
    def process_payment(amount: float, currency: str = "INR"):
        return {"status": True, "message": "Payment verified", "transaction_id": "tx_123456"}
