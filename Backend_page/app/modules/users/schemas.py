from pydantic import BaseModel, EmailStr
from typing import Optional

class BookingRequestSchema(BaseModel):
    event_id: int
    name: str
    email: EmailStr
    phone: Optional[str] = None
    food_preference: Optional[str] = "None"
