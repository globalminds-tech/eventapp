import re
from app.modules.chatbot.repository import ChatbotRepository

INTENT_PATTERNS = {
    "greeting":      r"\b(hello|hi|hey|good\s*(morning|afternoon|evening)|howdy|sup)\b",
    "farewell":      r"\b(bye|goodbye|see\s*you|exit|quit|thanks?\s*bye)\b",
    "thanks":        r"\b(thank(s| you)|appreciate|cheers)\b",
    "help":          r"\b(help|what can you|capabilities|what do you do)\b",
    "all_events":    r"\b(all|every|list|show|total|how many)\b.*\bevents?\b|\bevents?\b.*\b(all|list|total|count|how many)\b",
    "upcoming":      r"\b(upcoming|next|future|scheduled|coming)\b.*\bevents?\b|\bevents?\b.*\b(upcoming|coming|next)\b",
    "free_events":   r"\b(free|no.?charge|no.?cost|zero.?cost|complimentary)\b.*\bevents?\b|\bevents?\b.*\bfree\b",
    "venue":         r"\b(venue|location|place|where|address|reach|direction|map)\b",
    "timing":        r"\b(time|timing|schedule|when|start.?time|end.?time|duration|hours?)\b",
}

class ChatbotService:
    @staticmethod
    def detect_intent(message: str) -> list:
        m = message.lower().strip()
        return [intent for intent, pattern in INTENT_PATTERNS.items() if re.search(pattern, m)]

    @staticmethod
    def handle_chat(user_message: str, user_id=None):
        intents = ChatbotService.detect_intent(user_message)
        events = ChatbotRepository.get_approved_events()

        if "greeting" in intents:
            reply = "Hello! I'm EventBot 👋 — your event management assistant. What would you like to know?"
        elif not events:
            reply = "No approved events are currently scheduled."
        else:
            event_list = [f"• {e.event_name} ({e.category}) on {e.start_date} at {e.venue}" for e in events[:5]]
            reply = f"Here are the upcoming events:\n" + "\n".join(event_list)

        ChatbotRepository.save_chat_history(user_id, user_message, reply)
        return {"reply": reply, "intents": intents}
