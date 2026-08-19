from sqlalchemy import select, or_
from app.extensions.database import db
from app.models.event import EventDetails, EventBookingDetails
from app.models.support import ChatHistory, FAQ

class ChatbotRepository:
    @staticmethod
    def get_approved_events():
        stmt = select(EventDetails).where(EventDetails.status == 'APPROVED').order_by(EventDetails.start_date.asc())
        return db.session.scalars(stmt).all()

    @staticmethod
    def get_events_with_booking():
        stmt = select(EventDetails, EventBookingDetails).outerjoin(
            EventBookingDetails, EventDetails.id == EventBookingDetails.event_id
        ).where(EventDetails.status == 'APPROVED')
        return db.session.execute(stmt).all()

    @staticmethod
    def search_faqs(keywords: list):
        if not keywords:
            return []
        conditions = []
        for kw in keywords:
            pattern = f"%{kw}%"
            conditions.append(FAQ.question.like(pattern))
            conditions.append(FAQ.answer.like(pattern))
        stmt = select(FAQ).where(or_(*conditions)).limit(5)
        return db.session.scalars(stmt).all()

    @staticmethod
    def save_chat_history(user_id: str, message: str, response: str):
        record = ChatHistory(
            user_id=str(user_id) if user_id else "Guest",
            message=message,
            response=response
        )
        db.session.add(record)
        db.session.commit()
        return record
