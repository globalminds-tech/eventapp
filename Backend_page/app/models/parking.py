import uuid as uuid_pkg
from typing import Optional
from datetime import datetime
from sqlalchemy import String, Numeric, Boolean, ForeignKey, DateTime, func
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column
from app.extensions.database import db


class EventVehicleDetail(db.Model):
    __tablename__ = 'event_vehicle_details'

    id: Mapped[uuid_pkg.UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid_pkg.uuid4)
    event_id: Mapped[Optional[uuid_pkg.UUID]] = mapped_column(PG_UUID(as_uuid=True), ForeignKey('event_details_table.id', ondelete='CASCADE'), nullable=True)
    vehicle_type: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    price_inr: Mapped[Optional[float]] = mapped_column(Numeric(10, 2), nullable=True)
    price_usd: Mapped[Optional[float]] = mapped_column(Numeric(10, 2), nullable=True)
    created_at: Mapped[Optional[datetime]] = mapped_column(DateTime, server_default=func.now())


class EventVehicleAddon(db.Model):
    __tablename__ = 'event_vehicle_addons'

    id: Mapped[uuid_pkg.UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid_pkg.uuid4)
    event_id: Mapped[Optional[uuid_pkg.UUID]] = mapped_column(PG_UUID(as_uuid=True), ForeignKey('event_details_table.id', ondelete='CASCADE'), nullable=True)
    is_parent: Mapped[Optional[bool]] = mapped_column(Boolean, default=False)
    addon_name: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    price: Mapped[Optional[float]] = mapped_column(Numeric(10, 2), nullable=True)
    created_at: Mapped[Optional[datetime]] = mapped_column(DateTime, server_default=func.now())
