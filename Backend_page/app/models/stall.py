import uuid as uuid_pkg
from typing import Optional
from datetime import datetime
from sqlalchemy import String, Integer, Boolean, ForeignKey, DateTime, func, Uuid

from sqlalchemy.orm import Mapped, mapped_column
from app.extensions.database import db


class EventStall(db.Model):
    __tablename__ = 'event_stalls'

    id: Mapped[uuid_pkg.UUID] = mapped_column(Uuid, primary_key=True, default=uuid_pkg.uuid4)
    event_id: Mapped[Optional[uuid_pkg.UUID]] = mapped_column(Uuid, ForeignKey('event_details_table.id', ondelete='CASCADE'), nullable=True)
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
    created_by: Mapped[Optional[uuid_pkg.UUID]] = mapped_column(Uuid, ForeignKey('users.id', ondelete='SET NULL'), nullable=True)
    updated_by: Mapped[Optional[uuid_pkg.UUID]] = mapped_column(Uuid, ForeignKey('users.id', ondelete='SET NULL'), nullable=True)
    deleted_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    deleted_by: Mapped[Optional[uuid_pkg.UUID]] = mapped_column(Uuid, ForeignKey('users.id', ondelete='SET NULL'), nullable=True)

    def to_dict(self):
        return {
            "id": str(self.id),
            "event_id": str(self.event_id) if self.event_id else None,
            "stall_name": self.stall_name,
            "stallName": self.stall_name,
            "stall_size": self.stall_size,
            "stallSize": self.stall_size,
            "size": self.stall_size,
            "size_range": self.size_range,
            "sizeRange": self.size_range,
            "visibility": self.visibility or "Public",
            "stall_type": self.stall_type or "",
            "stallType": self.stall_type or "",
            "type": self.stall_type or "",
            "price_inr": self.price_inr or "0",
            "priceINR": self.price_inr or "0",
            "price": self.price_inr or "0",
            "price_usd": self.price_usd,
            "prime_seat": bool(self.prime_seat),
            "primeSeat": bool(self.prime_seat),
            "prime_price_inr": self.prime_price_inr or "",
            "primePriceINR": self.prime_price_inr or "",
            "quantity": self.quantity if self.quantity is not None else 1,
            "stallQty": self.quantity if self.quantity is not None else 1,
            "qty": self.quantity if self.quantity is not None else 1,
            "single_area_sqft": float(self.single_area_sqft) if self.single_area_sqft else 100.0,
            "total_area_sqft": float(self.total_area_sqft) if self.total_area_sqft else 100.0,
            "currency_code": self.currency_code or "INR"
        }


class StallAmenity(db.Model):
    __tablename__ = 'stall_amenities'

    id: Mapped[uuid_pkg.UUID] = mapped_column(Uuid, primary_key=True, default=uuid_pkg.uuid4)
    event_id: Mapped[Optional[uuid_pkg.UUID]] = mapped_column(Uuid, ForeignKey('event_details_table.id', ondelete='CASCADE'), nullable=True)
    stall_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    amenity: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    qty: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    created_at: Mapped[Optional[datetime]] = mapped_column(DateTime, server_default=func.now())

    def to_dict(self):
        return {
            "id": str(self.id),
            "event_id": str(self.event_id) if self.event_id else None,
            "stall_name": self.stall_name,
            "stallName": self.stall_name,
            "amenity": self.amenity,
            "qty": self.qty or 1
        }
