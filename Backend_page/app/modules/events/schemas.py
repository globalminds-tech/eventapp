from pydantic import BaseModel
from typing import Optional

class EventCreateSchema(BaseModel):
    event_name: str
    category: Optional[str] = None
    description: Optional[str] = None
    venue: Optional[str] = None
    status: Optional[str] = "PENDING"
