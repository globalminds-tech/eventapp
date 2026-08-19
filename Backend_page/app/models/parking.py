from typing import Optional
from datetime import datetime
from sqlalchemy import String, Numeric, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from app.extensions.database import db

class EventVehicleDetail(db.Model):
    __tablename__ = 'event_vehicle_details'

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    event_id: Mapped[Optional[int]] = mapped_column(ForeignKey('event_details_table.id', ondelete='CASCADE'))
    vehicle_type: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    price_inr: Mapped[Optional[float]] = mapped_column(Numeric(10, 2), nullable=True)
    price_usd: Mapped[Optional[float]] = mapped_column(Numeric(10, 2), nullable=True)
    created_at: Mapped[Optional[datetime]] = mapped_column(DateTime, default=datetime.utcnow)


class EventVehicleAddon(db.Model):
    __tablename__ = 'event_vehicle_addons'

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    event_id: Mapped[Optional[int]] = mapped_column(ForeignKey('event_details_table.id', ondelete='CASCADE'))
    is_parent: Mapped[Optional[bool]] = mapped_column(Boolean, default=False)
    addon_name: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    price: Mapped[Optional[float]] = mapped_column(Numeric(10, 2), nullable=True)
    created_at: Mapped[Optional[datetime]] = mapped_column(DateTime, default=datetime.utcnow)
