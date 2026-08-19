from pydantic import BaseModel
from typing import Optional

class ChatMessageSchema(BaseModel):
    message: str
    user_id: Optional[str] = None
