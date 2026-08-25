from sqlalchemy import select, desc
from app.extensions.database import db
from app.models.event import EventDetails
from app.models.support import ChatHistory

class ChatbotRepository:
    @staticmethod
    def get_approved_events() -> list[EventDetails]:
        stmt = select(EventDetails).where(
            (EventDetails.status == 'APPROVED') | (EventDetails.status == 'Published')
        ).order_by(desc(EventDetails.id))
        return list(db.session.scalars(stmt).all())

    @staticmethod
    def save_chat_history(user_id: int | None, user_msg: str, bot_reply: str) -> ChatHistory:
        chat = ChatHistory(
            user_id=user_id,
            message=user_msg,
            response=bot_reply
        )
        db.session.add(chat)
        db.session.commit()
        return chat
