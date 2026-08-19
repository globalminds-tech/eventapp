from typing import Optional
from datetime import datetime
from sqlalchemy import String, Text, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from app.extensions.database import db

class UserBookingDetails(db.Model):
    __tablename__ = 'user_booking_details'

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    event_id: Mapped[int] = mapped_column(ForeignKey('event_details_table.id', ondelete='CASCADE'), nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(150), nullable=False)
    phone: Mapped[Optional[str]] = mapped_column(String(15), nullable=True)
    food_preference: Mapped[Optional[str]] = mapped_column(String(50), default='None')
    qr_data: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_scanned: Mapped[Optional[bool]] = mapped_column(Boolean, default=False)
    scanned_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[Optional[datetime]] = mapped_column(DateTime, default=datetime.utcnow)
