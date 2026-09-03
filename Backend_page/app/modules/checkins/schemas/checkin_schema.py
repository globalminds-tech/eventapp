from pydantic import BaseModel, Field
from typing import Optional

class CheckinRequestSchema(BaseModel):
    ticket_code: Optional[str] = None
    booking_id: Optional[str] = None
    action: Optional[str] = "CHECK_IN" # "CHECK_IN" or "CHECK_OUT"
    gate_name: Optional[str] = None
    scanner_id: Optional[str] = None
