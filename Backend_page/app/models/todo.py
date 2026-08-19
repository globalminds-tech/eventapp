from typing import Optional
from datetime import datetime, date
from sqlalchemy import String, Text, Integer, ForeignKey, DateTime, Date
from sqlalchemy.orm import Mapped, mapped_column
from app.extensions.database import db

class TodoTask(db.Model):
    __tablename__ = 'todo_tasks'

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    task_name: Mapped[str] = mapped_column(String(255), nullable=False)
    task_description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    todo_list_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    start_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    end_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    assigned_to: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    status: Mapped[Optional[str]] = mapped_column(String(50), default='In-Progress')
    complete_percent: Mapped[Optional[int]] = mapped_column(Integer, default=0)
    remarks: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[Optional[datetime]] = mapped_column(DateTime, default=datetime.utcnow)


class MessageGreeting(db.Model):
    __tablename__ = 'messages_greetings_table'

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    event_id: Mapped[int] = mapped_column(ForeignKey('event_details_table.id', ondelete='CASCADE'), nullable=False)
    type: Mapped[str] = mapped_column(String(20), default='Messages', nullable=False)
    message_group: Mapped[str] = mapped_column(String(255), nullable=False)
    topics: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    sub_topics: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    image_path: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[Optional[datetime]] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[Optional[datetime]] = mapped_column(DateTime, default=datetime.utcnow)


class Contact(db.Model):
    __tablename__ = 'my_contacts'

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    mobile: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    user_type: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    group_name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    created_at: Mapped[Optional[datetime]] = mapped_column(DateTime, default=datetime.utcnow)
