from pydantic import BaseModel, Field
from typing import Optional

class CreateEventSchema(BaseModel):
    event_name: str = Field(..., min_length=2)
    category_id: Optional[int] = None
    subcategory_id: Optional[int] = None
    custom_category: Optional[str] = None
    venue_id: Optional[int] = None
    venue: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    pincode: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    description: Optional[str] = None
    banner_image: Optional[str] = None
    event_type: Optional[str] = "Public"

class UpdateEventSchema(BaseModel):
    event_name: Optional[str] = None
    category_id: Optional[int] = None
    subcategory_id: Optional[int] = None
    venue_id: Optional[int] = None
    description: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
