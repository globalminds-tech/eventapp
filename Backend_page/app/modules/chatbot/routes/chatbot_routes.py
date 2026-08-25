from fastapi import APIRouter
from app.modules.chatbot.controllers.chatbot_controller import ChatbotController
from app.modules.chatbot.schemas.chatbot_schema import ChatMessageSchema

chatbot_router = APIRouter(prefix="/api/v1/chatbot", tags=["Chatbot"])

@chatbot_router.post("/message")
def chat(payload: ChatMessageSchema):
    return ChatbotController.chat(payload.dict())
