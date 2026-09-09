from pydantic import BaseModel, Field
from typing import Optional

class BookEventSchema(BaseModel):
    event_id: str
    user_id: Optional[str] = None
    name: str = Field(..., min_length=1)
    email: str
    phone: Optional[str] = None
    quantity: Optional[int] = 1
    pass_type: Optional[str] = "Single Pass"
    group_size: Optional[int] = 1
    food_preference: Optional[str] = "None"
    food_details: Optional[str] = None
    vehicle_details: Optional[str] = None
    vehicle_number: Optional[str] = None
    subtotal_amount: Optional[float] = 0.0
    tax_amount: Optional[float] = 0.0
    amount_paid: Optional[float] = 0.0
    currency_code: Optional[str] = "INR"
    payment_id: Optional[str] = None
    razorpay_order_id: Optional[str] = None
    razorpay_signature: Optional[str] = None

class UpdateProfileSchema(BaseModel):
    name: Optional[str] = None
    mobile: Optional[str] = None
    profile_image: Optional[str] = None
    address: Optional[str] = None
    country: Optional[str] = None
    state: Optional[str] = None
    city: Optional[str] = None

