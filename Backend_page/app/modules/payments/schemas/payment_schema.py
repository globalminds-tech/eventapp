from pydantic import BaseModel, Field
from typing import Optional, Dict, Any

class CreateOrderSchema(BaseModel):
    amount: float = Field(..., gt=0.0)
    currency: Optional[str] = "INR"
    organizer_account_id: Optional[str] = None
    commission_percent: Optional[float] = 5.0
    receipt: Optional[str] = None
    notes: Optional[Dict[str, Any]] = None

class VerifySignatureSchema(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str

class RefundSchema(BaseModel):
    payment_id: str
    amount: Optional[float] = None
