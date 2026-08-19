from flask import Blueprint, request, jsonify
from app.modules.chatbot.service import ChatbotService

chatbot_module_bp = Blueprint("chatbot_module", __name__)

@chatbot_module_bp.route("/chat", methods=["POST"])
def chat():
    data = request.json or {}
    user_message = data.get("message", "")
    user_id = data.get("user_id")

    if not user_message:
        return jsonify({"error": "Message is required"}), 400

    res = ChatbotService.handle_chat(user_message, user_id)
    return jsonify(res)
