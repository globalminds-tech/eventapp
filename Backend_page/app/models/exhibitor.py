import uuid as uuid_pkg
from typing import Optional
from datetime import datetime
from sqlalchemy import String, Text, ForeignKey, DateTime, func, Uuid

from sqlalchemy.orm import Mapped, mapped_column
from app.extensions.database import db


class ExhibitorStallBooking(db.Model):
    __tablename__ = 'exhibitor_stall_bookings'

    id: Mapped[uuid_pkg.UUID] = mapped_column(Uuid, primary_key=True, default=uuid_pkg.uuid4)
    event_id: Mapped[Optional[uuid_pkg.UUID]] = mapped_column(Uuid, ForeignKey('event_details_table.id', ondelete='CASCADE'), nullable=True)
    user_id: Mapped[Optional[uuid_pkg.UUID]] = mapped_column(Uuid, nullable=True)
    title: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)
    first_name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    last_name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    email: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    mobile: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    event_name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    designation: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    company_name: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    company_type: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    industry_type: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    company_website: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    business_description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
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
    approval_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    rejection_reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    payment_expiry_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[Optional[datetime]] = mapped_column(DateTime, server_default=func.now())

class ExhibitorLead(db.Model):
    __tablename__ = 'exhibitor_leads'

    id: Mapped[uuid_pkg.UUID] = mapped_column(Uuid, primary_key=True, default=uuid_pkg.uuid4)
    event_id: Mapped[Optional[uuid_pkg.UUID]] = mapped_column(Uuid, ForeignKey('event_details_table.id', ondelete='CASCADE'), nullable=True)
    user_id: Mapped[Optional[uuid_pkg.UUID]] = mapped_column(Uuid, nullable=True)  # exhibitor's user_id
    visitor_name: Mapped[str] = mapped_column(String(150), nullable=False)
    company_name: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    email: Mapped[str] = mapped_column(String(150), nullable=False)
    mobile: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    buying_intent: Mapped[Optional[str]] = mapped_column(String(50), nullable=True, default='High Intent')
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[Optional[datetime]] = mapped_column(DateTime, server_default=func.now())
