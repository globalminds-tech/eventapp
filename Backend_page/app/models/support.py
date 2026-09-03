import uuid as uuid_pkg
from typing import Optional
from datetime import datetime, date
from sqlalchemy import String, Text, Integer, ForeignKey, DateTime, Date, func
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column
from app.extensions.database import db


class FeedbackEvent(db.Model):
    __tablename__ = 'feedback_event'

    id: Mapped[uuid_pkg.UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid_pkg.uuid4)
    feedback_code: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    event_id: Mapped[uuid_pkg.UUID] = mapped_column(PG_UUID(as_uuid=True), ForeignKey('event_details_table.id', ondelete='CASCADE'), nullable=False)
    event_name: Mapped[str] = mapped_column(String(255), nullable=False)
    explanation: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[Optional[str]] = mapped_column(String(20), default='Active')
    created_at: Mapped[Optional[datetime]] = mapped_column(DateTime, server_default=func.now())
    modified_on: Mapped[Optional[date]] = mapped_column(Date, nullable=True)


class Complaint(db.Model):
    __tablename__ = 'complaint'

    id: Mapped[uuid_pkg.UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid_pkg.uuid4)
    complaint_code: Mapped[Optional[str]] = mapped_column(String(20), unique=True, nullable=True)
    event_id: Mapped[Optional[uuid_pkg.UUID]] = mapped_column(PG_UUID(as_uuid=True), ForeignKey('event_details_table.id', ondelete='SET NULL'), nullable=True)
    event_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    infrastructure_rating: Mapped[Optional[int]] = mapped_column(Integer, default=0)
    amenities_rating: Mapped[Optional[int]] = mapped_column(Integer, default=0)
    overall_experience_rating: Mapped[Optional[int]] = mapped_column(Integer, default=0)
    venue_locations_rating: Mapped[Optional[int]] = mapped_column(Integer, default=0)
    transportation_rating: Mapped[Optional[int]] = mapped_column(Integer, default=0)
    convenience_rating: Mapped[Optional[int]] = mapped_column(Integer, default=0)
    explanation: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[Optional[str]] = mapped_column(String(20), default='Active')
    created_on: Mapped[Optional[datetime]] = mapped_column(DateTime, server_default=func.now())


class ChatHistory(db.Model):
    __tablename__ = 'chat_history'

    id: Mapped[uuid_pkg.UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid_pkg.uuid4)
    user_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    response: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[Optional[datetime]] = mapped_column(DateTime, server_default=func.now())


class FAQ(db.Model):
    __tablename__ = 'faq'

    id: Mapped[uuid_pkg.UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid_pkg.uuid4)
    question: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    answer: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    category: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    created_at: Mapped[Optional[datetime]] = mapped_column(DateTime, server_default=func.now())
