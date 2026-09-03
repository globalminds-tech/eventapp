import uuid as uuid_pkg
from typing import Optional
from datetime import datetime
from sqlalchemy import String, Text, Boolean, ForeignKey, DateTime, Integer, Numeric, func
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column
from app.extensions.database import db


class UserBookingDetails(db.Model):
    __tablename__ = 'user_booking_details'

    id: Mapped[uuid_pkg.UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid_pkg.uuid4)
    event_id: Mapped[uuid_pkg.UUID] = mapped_column(PG_UUID(as_uuid=True), ForeignKey('event_details_table.id', ondelete='CASCADE'), nullable=False)
    user_id: Mapped[Optional[uuid_pkg.UUID]] = mapped_column(PG_UUID(as_uuid=True), nullable=True)
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

    # Multi-currency & payment snapshot
    currency_code: Mapped[Optional[str]] = mapped_column(String(3), default='INR')
    amount_paid: Mapped[Optional[float]] = mapped_column(Numeric(12, 2), nullable=True)

    created_at: Mapped[Optional[datetime]] = mapped_column(DateTime, server_default=func.now())


class AttendeeCheckinLog(db.Model):
    __tablename__ = 'attendee_checkin_logs'

    id: Mapped[uuid_pkg.UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid_pkg.uuid4)
    booking_id: Mapped[uuid_pkg.UUID] = mapped_column(PG_UUID(as_uuid=True), ForeignKey('user_booking_details.id', ondelete='CASCADE'), nullable=False, index=True)
    ticket_code: Mapped[Optional[str]] = mapped_column(String(60), nullable=True)
    event_id: Mapped[uuid_pkg.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False, index=True)
    action: Mapped[str] = mapped_column(String(20), nullable=False)  # 'CHECK_IN' or 'CHECK_OUT'
    gate_name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    scanner_id: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
