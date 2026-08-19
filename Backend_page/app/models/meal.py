from typing import Optional
from datetime import datetime
from sqlalchemy import String, Text, Integer, Numeric, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from app.extensions.database import db

class FoodLiveCount(db.Model):
    __tablename__ = 'food_live_count'

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    event_id: Mapped[Optional[int]] = mapped_column(nullable=True)
    meal_time: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    meal_type: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    guests_inside: Mapped[Optional[int]] = mapped_column(Integer, default=0)
    total_capacity: Mapped[Optional[int]] = mapped_column(Integer, default=0)
    waiting_outside: Mapped[Optional[int]] = mapped_column(Integer, default=0)
    created_at: Mapped[Optional[datetime]] = mapped_column(DateTime, default=datetime.utcnow)


class EventFoodItem(db.Model):
    __tablename__ = 'event_food_items'

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    event_id: Mapped[Optional[int]] = mapped_column(ForeignKey('event_details_table.id', ondelete='CASCADE'))
    caterer_name: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    meal_type: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    food_type: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    price_inr: Mapped[Optional[float]] = mapped_column(Numeric(10, 2), nullable=True)
    price_usd: Mapped[Optional[float]] = mapped_column(Numeric(10, 2), nullable=True)
    menu_details: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[Optional[datetime]] = mapped_column(DateTime, default=datetime.utcnow)
