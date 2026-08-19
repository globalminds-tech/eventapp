from typing import Optional
from datetime import datetime
from sqlalchemy import String, Text, Integer, Numeric, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from app.extensions.database import db

class EventProgram(db.Model):
    __tablename__ = 'event_programs'

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    event_id: Mapped[Optional[int]] = mapped_column(ForeignKey('event_details_table.id', ondelete='CASCADE'))
    program_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    program_code: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    category: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    type: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    start_date: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    end_date: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    venue: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    max_participants: Mapped[Optional[int]] = mapped_column(Integer, default=0)
    budget: Mapped[Optional[float]] = mapped_column(Numeric(10, 2), default=0.0)
    coordinator_name: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    coordinator_email: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[Optional[str]] = mapped_column(String(50), default='Active')
    created_at: Mapped[Optional[datetime]] = mapped_column(DateTime, default=datetime.utcnow)
