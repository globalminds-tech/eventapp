from typing import Optional
from datetime import datetime
from sqlalchemy import String, Integer, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from app.extensions.database import db

class EventStall(db.Model):
    __tablename__ = 'event_stalls'
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    event_id: Mapped[Optional[int]] = mapped_column(ForeignKey('event_details_table.id', ondelete='CASCADE'))
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
    created_at: Mapped[Optional[datetime]] = mapped_column(DateTime, default=datetime.utcnow)

class StallAmenity(db.Model):
    __tablename__ = 'stall_amenities'
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    event_id: Mapped[Optional[int]] = mapped_column(ForeignKey('event_details_table.id', ondelete='CASCADE'))
    stall_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    amenity: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    qty: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    created_at: Mapped[Optional[datetime]] = mapped_column(DateTime, default=datetime.utcnow)
