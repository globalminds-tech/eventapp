from typing import Optional
from datetime import datetime
from sqlalchemy import String, Text, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from app.extensions.database import db

class ExhibitorStallBooking(db.Model):
    __tablename__ = 'Exhibitor_stall_bookings'

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    event_id: Mapped[Optional[int]] = mapped_column(ForeignKey('event_details_table.id', ondelete='CASCADE'))
    user_id: Mapped[Optional[int]] = mapped_column(nullable=True)
    title: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)
    first_name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    last_name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    email: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    mobile: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    eventName: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    designation: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    company_name: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    country: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    state: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    city: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    address: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    messages: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    pin_code: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    stall_area: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    products: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    visiting_card: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    status: Mapped[Optional[str]] = mapped_column(String(50), default='pending')
    created_at: Mapped[Optional[datetime]] = mapped_column(DateTime, default=datetime.utcnow)
