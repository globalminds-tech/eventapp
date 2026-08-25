from app.extensions.database import db

class PaymentRepository:
    @staticmethod
    def log_payment(order_id: str, payment_id: str, amount: float, status: str) -> None:
        # Repository layer placeholder for persistent DB payment logging if needed
        pass
