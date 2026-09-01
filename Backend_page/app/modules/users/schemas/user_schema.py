from pydantic import BaseModel, Field
from typing import Optional

class BookEventSchema(BaseModel):
    event_id: int
    user_id: Optional[int] = None
    name: str = Field(..., min_length=1)
    email: str
    phone: Optional[str] = None
    food_preference: Optional[str] = "None"

class UpdateProfileSchema(BaseModel):
    name: Optional[str] = None
    mobile: Optional[str] = None
    profile_image: Optional[str] = None
