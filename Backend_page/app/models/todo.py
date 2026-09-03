import uuid as uuid_pkg
from typing import Optional
from datetime import datetime, date
from sqlalchemy import String, Text, Integer, ForeignKey, DateTime, Date, func
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column
from app.extensions.database import db


class TodoTask(db.Model):
    __tablename__ = 'todo_tasks'

    id: Mapped[uuid_pkg.UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid_pkg.uuid4)
    task_name: Mapped[str] = mapped_column(String(255), nullable=False)
    task_description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    todo_list_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    start_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    end_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    assigned_to: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    status: Mapped[Optional[str]] = mapped_column(String(50), default='In-Progress')
    complete_percent: Mapped[Optional[int]] = mapped_column(Integer, default=0)
    remarks: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[Optional[datetime]] = mapped_column(DateTime, server_default=func.now())


class MessageGreeting(db.Model):
    __tablename__ = 'messages_greetings_table'

    id: Mapped[uuid_pkg.UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid_pkg.uuid4)
    event_id: Mapped[uuid_pkg.UUID] = mapped_column(PG_UUID(as_uuid=True), ForeignKey('event_details_table.id', ondelete='CASCADE'), nullable=False)
    type: Mapped[str] = mapped_column(String(20), default='Messages', nullable=False)
    message_group: Mapped[str] = mapped_column(String(255), nullable=False)
    topics: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    sub_topics: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    image_path: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[Optional[datetime]] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[Optional[datetime]] = mapped_column(DateTime, onupdate=func.now(), nullable=True)


class Contact(db.Model):
    __tablename__ = 'my_contacts'

    id: Mapped[uuid_pkg.UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid_pkg.uuid4)
    name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    mobile: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    user_type: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    group_name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    created_at: Mapped[Optional[datetime]] = mapped_column(DateTime, server_default=func.now())
