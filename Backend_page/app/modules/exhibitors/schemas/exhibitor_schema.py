from pydantic import BaseModel, Field
from typing import Optional

class BookStallSchema(BaseModel):
    user_id: Optional[int] = None
    event_id: int
    eventName: Optional[str] = None
    title: Optional[str] = None
    first_name: str = Field(..., min_length=1)
    last_name: str = Field(..., min_length=1)
    email: str
    mobile: str
    designation: Optional[str] = None
    company_name: str = Field(..., min_length=1)
    country: Optional[str] = None
    state: Optional[str] = None
    city: Optional[str] = None
    address: Optional[str] = None
    pin_code: Optional[str] = None
    stall_area: Optional[str] = None
    products: Optional[str] = None
    message: Optional[str] = None

class RegisterStaffPassSchema(BaseModel):
    booking_id: int
    staff_name: str
    staff_email: str
    staff_phone: str
    role: Optional[str] = "Booth Staff"
