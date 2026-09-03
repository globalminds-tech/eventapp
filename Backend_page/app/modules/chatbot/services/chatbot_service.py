import re
from app.exceptions.api_error import ApiError
from app.modules.chatbot.repository.chatbot_repository import ChatbotRepository
from app.modules.chatbot.schemas.chatbot_schema import ChatMessageSchema

import os
import google.generativeai as genai

class ChatbotService:
    @staticmethod
    def detect_intent(message: str) -> list:
        # Intent detection is now handled by the LLM natively, but we return a generic intent for backward compatibility
        return ["gemini_handled"]

    @staticmethod
    def handle_chat(raw_data: dict, auth_user_id: int = None) -> dict:
        data = ChatMessageSchema(**raw_data)
        user_id = auth_user_id or data.user_id

        # 1. Fetch live events from the database
        events = ChatbotRepository.get_approved_events()
        
        # 2. Format the events into a context string for the AI
        if not events:
            context = "Currently, there are no approved events scheduled."
        else:
            event_details = []
            for e in events:
                evt_str = f"- Event: {e.event_name}\n  Category: {e.category}\n  Date: {e.start_date}\n  Venue: {e.venue}"
                if getattr(e, 'price', None) or getattr(e, 'pass_fee', None):
                    price = getattr(e, 'price', None) or getattr(e, 'pass_fee', None)
                    evt_str += f"\n  Price: ₹{price}"
                else:
                    evt_str += f"\n  Price: Free"
                event_details.append(evt_str)
            context = "Here are the currently approved and upcoming events:\n" + "\n\n".join(event_details)

        # 3. Initialize Gemini
        gemini_api_key = os.environ.get("GEMINI_API_KEY", "").strip()
        if not gemini_api_key:
            reply = "I am EventBot! However, my AI brain is currently offline because the GEMINI_API_KEY is not configured in the backend environment."
            intents = ["error"]
        else:
            try:
                genai.configure(api_key=gemini_api_key)
                # You can choose gemini-1.5-flash for fast responses
                model = genai.GenerativeModel("gemini-1.5-flash")
                
                # 4. Construct the prompt
                system_prompt = (
                    "You are EventBot, a helpful, friendly, and concise event management assistant for 'Book My Event'.\n"
                    "Your job is to answer user queries based strictly on the provided event data context.\n"
                    "If the user asks something completely unrelated to events or ticketing, politely decline to answer.\n"
                    "If the user greets you, greet them back enthusiastically as EventBot.\n\n"
                    f"--- EVENT DATABASE CONTEXT ---\n{context}\n------------------------------\n"
                )
                
                full_prompt = f"{system_prompt}\nUser: {data.message}\nEventBot:"
                
                # 5. Generate response
                response = model.generate_content(full_prompt)
                reply = response.text.strip()
                intents = ["gemini_handled"]
            except Exception as e:
                reply = f"Sorry, I encountered an error connecting to my AI brain: {str(e)}"
                intents = ["error"]

        # 6. Save history & return
        ChatbotRepository.save_chat_history(user_id, data.message, reply)
        return {"reply": reply, "intents": intents}
