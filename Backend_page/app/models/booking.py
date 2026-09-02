from typing import Optional
from datetime import datetime
from sqlalchemy import String, Text, Boolean, ForeignKey, DateTime, Integer
from sqlalchemy.orm import Mapped, mapped_column
from app.extensions.database import db

class UserBookingDetails(db.Model):
    __tablename__ = 'user_booking_details'

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    event_id: Mapped[int] = mapped_column(ForeignKey('event_details_table.id', ondelete='CASCADE'), nullable=False)
    user_id: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(150), nullable=False)
    phone: Mapped[Optional[str]] = mapped_column(String(15), nullable=True)
    food_preference: Mapped[Optional[str]] = mapped_column(String(50), default='None')
    qr_data: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    ticket_code: Mapped[Optional[str]] = mapped_column(String(60), unique=True, index=True, nullable=True)
    scanner_id: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    is_scanned: Mapped[Optional[bool]] = mapped_column(Boolean, default=False)
    scanned_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    # Check-in & Check-out tracking fields
    is_checked_in: Mapped[Optional[bool]] = mapped_column(Boolean, default=False)
    checkin_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    checkin_scanner_id: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)

    is_checked_out: Mapped[Optional[bool]] = mapped_column(Boolean, default=False)
    checkout_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    checkout_scanner_id: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)

    total_checkins: Mapped[Optional[int]] = mapped_column(Integer, default=0)
    total_checkouts: Mapped[Optional[int]] = mapped_column(Integer, default=0)

    created_at: Mapped[Optional[datetime]] = mapped_column(DateTime, default=datetime.utcnow)


class AttendeeCheckinLog(db.Model):
    __tablename__ = 'attendee_checkin_logs'

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    booking_id: Mapped[int] = mapped_column(ForeignKey('user_booking_details.id', ondelete='CASCADE'), nullable=False)
    ticket_code: Mapped[Optional[str]] = mapped_column(String(60), nullable=True)
    event_id: Mapped[int] = mapped_column(Integer, nullable=False)
    action: Mapped[str] = mapped_column(String(20), nullable=False) # 'CHECK_IN' or 'CHECK_OUT'
    gate_name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    scanner_id: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
