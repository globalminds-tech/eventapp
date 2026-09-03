import uuid as uuid_pkg
from typing import Optional
from datetime import datetime
from sqlalchemy import String, Integer, Boolean, ForeignKey, DateTime, func
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column
from app.extensions.database import db


class EventStall(db.Model):
    __tablename__ = 'event_stalls'

    id: Mapped[uuid_pkg.UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid_pkg.uuid4)
    event_id: Mapped[Optional[uuid_pkg.UUID]] = mapped_column(PG_UUID(as_uuid=True), ForeignKey('event_details_table.id', ondelete='CASCADE'), nullable=True)
    stall_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    stall_size: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    size_range: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    visibility: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    stall_type: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    price_inr: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    price_usd: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    prime_seat: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True)
    prime_price_inr: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    prime_price_usd: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    quantity: Mapped[Optional[int]] = mapped_column(Integer, default=1, nullable=True)
    single_area_sqft: Mapped[Optional[float]] = mapped_column(nullable=True, default=100.0)
    total_area_sqft: Mapped[Optional[float]] = mapped_column(nullable=True, default=100.0)

    # Multi-currency support
    currency_code: Mapped[Optional[str]] = mapped_column(String(3), default='INR')

    created_at: Mapped[Optional[datetime]] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[Optional[datetime]] = mapped_column(DateTime, onupdate=func.now(), nullable=True)
    created_by: Mapped[Optional[uuid_pkg.UUID]] = mapped_column(PG_UUID(as_uuid=True), ForeignKey('users.id', ondelete='SET NULL'), nullable=True)
    updated_by: Mapped[Optional[uuid_pkg.UUID]] = mapped_column(PG_UUID(as_uuid=True), ForeignKey('users.id', ondelete='SET NULL'), nullable=True)
    deleted_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    deleted_by: Mapped[Optional[uuid_pkg.UUID]] = mapped_column(PG_UUID(as_uuid=True), ForeignKey('users.id', ondelete='SET NULL'), nullable=True)


class StallAmenity(db.Model):
    __tablename__ = 'stall_amenities'

    id: Mapped[uuid_pkg.UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid_pkg.uuid4)
    event_id: Mapped[Optional[uuid_pkg.UUID]] = mapped_column(PG_UUID(as_uuid=True), ForeignKey('event_details_table.id', ondelete='CASCADE'), nullable=True)
    stall_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    amenity: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    qty: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    created_at: Mapped[Optional[datetime]] = mapped_column(DateTime, server_default=func.now())
