from pydantic import BaseModel, Field
from typing import Optional

class CheckinRequestSchema(BaseModel):
    booking_id: int
    gate_id: Optional[str] = None
    scanner_id: Optional[str] = None
