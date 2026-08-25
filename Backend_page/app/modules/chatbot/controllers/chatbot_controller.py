from app.modules.chatbot.services.chatbot_service import ChatbotService

class ChatbotController:
    @staticmethod
    def chat(raw_data: dict, auth_user_id: int = None):
        result = ChatbotService.handle_chat(raw_data, auth_user_id)
        return {
            "success": True,
            "data": result
        }
