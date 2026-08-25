from pydantic import BaseModel, Field
from typing import Optional

class ChatMessageSchema(BaseModel):
    message: str = Field(..., min_length=1)
    user_id: Optional[int] = None
