from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List

class CreateBookingSchema(BaseModel):
    event_id: int
    user_id: Optional[int] = None
    seat_ids: Optional[List[int]] = []
    amount: float = Field(..., ge=0.0)

class CancelBookingSchema(BaseModel):
    booking_id: int
    reason: Optional[str] = None
