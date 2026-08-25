from pydantic import BaseModel, Field
from typing import Optional, List

class CreateStallSchema(BaseModel):
    event_id: int
    stall_number: str
    stall_type: Optional[str] = None
    price: float = Field(..., ge=0.0)
    size: Optional[str] = None
    status: Optional[str] = "Available"
