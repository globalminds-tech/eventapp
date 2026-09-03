import uuid as uuid_pkg
from typing import Optional
from datetime import datetime, date, time
from sqlalchemy import String, Text, Boolean, Integer, Date, Time, DateTime, ForeignKey, Numeric, func
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column
from app.extensions.database import db


class EventDetails(db.Model):
    __tablename__ = 'event_details_table'

    id: Mapped[uuid_pkg.UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid_pkg.uuid4)
    event_code: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    slug: Mapped[Optional[str]] = mapped_column(String(255), unique=True, index=True, nullable=True)
    category: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    sub_category: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    event_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    amenities: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    tags: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    visibility: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    include_program: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)

    mail: Mapped[Optional[bool]] = mapped_column(Boolean, default=False)
    whatsapp: Mapped[Optional[bool]] = mapped_column(Boolean, default=False)
    print: Mapped[Optional[bool]] = mapped_column(Boolean, default=False)

    visitor_mail: Mapped[Optional[bool]] = mapped_column(Boolean, default=False)
    visitor_name: Mapped[Optional[bool]] = mapped_column(Boolean, default=False)
    visitor_photo: Mapped[Optional[bool]] = mapped_column(Boolean, default=False)
    visitor_mobile: Mapped[Optional[bool]] = mapped_column(Boolean, default=False)
    document_proof: Mapped[Optional[bool]] = mapped_column(Boolean, default=False)

    day_pass: Mapped[Optional[bool]] = mapped_column(Boolean, default=False)
    is_international_include: Mapped[Optional[bool]] = mapped_column(Boolean, default=False)
    aadhar: Mapped[Optional[bool]] = mapped_column(Boolean, default=False)
    passport: Mapped[Optional[bool]] = mapped_column(Boolean, default=False)

    welcome_kit: Mapped[Optional[bool]] = mapped_column(Boolean, default=False)
    food: Mapped[Optional[bool]] = mapped_column(Boolean, default=False)
    vehicle_pass: Mapped[Optional[bool]] = mapped_column(Boolean, default=False)
    vehicle_number: Mapped[Optional[bool]] = mapped_column(Boolean, default=False)

    event_type: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    occurrence: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)

    start_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    start_time: Mapped[Optional[time]] = mapped_column(Time, nullable=True)
    end_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    end_time: Mapped[Optional[time]] = mapped_column(Time, nullable=True)

    venue: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    address: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    user_id: Mapped[Optional[uuid_pkg.UUID]] = mapped_column(PG_UUID(as_uuid=True), ForeignKey('users.id', ondelete='SET NULL'), nullable=True)
    organization_id: Mapped[Optional[uuid_pkg.UUID]] = mapped_column(PG_UUID(as_uuid=True), nullable=True, index=True)
    status: Mapped[Optional[str]] = mapped_column(String(50), default='PENDING')

    # Multi-currency support
    currency_code: Mapped[Optional[str]] = mapped_column(String(3), default='INR')

    approved_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    rejected_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    created_by: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    updated_by: Mapped[Optional[uuid_pkg.UUID]] = mapped_column(PG_UUID(as_uuid=True), ForeignKey('users.id', ondelete='SET NULL'), nullable=True)
    created_at: Mapped[Optional[datetime]] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[Optional[datetime]] = mapped_column(DateTime, onupdate=func.now(), nullable=True)
    deleted_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    deleted_by: Mapped[Optional[uuid_pkg.UUID]] = mapped_column(PG_UUID(as_uuid=True), ForeignKey('users.id', ondelete='SET NULL'), nullable=True)


class EventBookingDetails(db.Model):
    __tablename__ = 'event_booking_details'

    id: Mapped[uuid_pkg.UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid_pkg.uuid4)
    event_id: Mapped[Optional[uuid_pkg.UUID]] = mapped_column(PG_UUID(as_uuid=True), ForeignKey('event_details_table.id', ondelete='CASCADE'), nullable=True)
    booking_start_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    booking_end_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    price_inr: Mapped[Optional[float]] = mapped_column(Numeric(10, 2), nullable=True)
    capacity: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    pass_type: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    group_member_limit: Mapped[Optional[int]] = mapped_column(Integer, default=5, nullable=True)
    title: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    title_type: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    title_selection: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    designation: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    designation_type: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    designation_selection: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    company: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    company_type: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    company_selection: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    entry_type: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    max_reentries: Mapped[Optional[str]] = mapped_column(String(50), default="Unlimited", nullable=True)
    charge_type: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    max_pass: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    razorpay_key: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    include_tax: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True)
    taxes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    price_type: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    currency: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    currency_code: Mapped[Optional[str]] = mapped_column(String(3), default='INR')
    early_bird_expire: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[Optional[datetime]] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[Optional[datetime]] = mapped_column(DateTime, onupdate=func.now(), nullable=True)
    deleted_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    deleted_by: Mapped[Optional[uuid_pkg.UUID]] = mapped_column(PG_UUID(as_uuid=True), ForeignKey('users.id', ondelete='SET NULL'), nullable=True)


class EventLayout(db.Model):
    __tablename__ = 'event_layout'

    id: Mapped[uuid_pkg.UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid_pkg.uuid4)
    event_id: Mapped[Optional[uuid_pkg.UUID]] = mapped_column(PG_UUID(as_uuid=True), ForeignKey('event_details_table.id', ondelete='CASCADE'), nullable=True)
    floor_type: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    day_based: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True)
    person_pass: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    include_tax: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True)
    taxes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[Optional[datetime]] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[Optional[datetime]] = mapped_column(DateTime, onupdate=func.now(), nullable=True)


class EventFile(db.Model):
    __tablename__ = 'event_files'

    id: Mapped[uuid_pkg.UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid_pkg.uuid4)
    event_id: Mapped[Optional[uuid_pkg.UUID]] = mapped_column(PG_UUID(as_uuid=True), ForeignKey('event_details_table.id', ondelete='CASCADE'), nullable=True)
    file_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    file_path: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    file_type: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    doc_type: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    doc_number: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    created_at: Mapped[Optional[datetime]] = mapped_column(DateTime, server_default=func.now())


class EventTerm(db.Model):
    __tablename__ = 'event_terms'

    id: Mapped[uuid_pkg.UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid_pkg.uuid4)
    event_id: Mapped[uuid_pkg.UUID] = mapped_column(PG_UUID(as_uuid=True), ForeignKey('event_details_table.id', ondelete='CASCADE'), nullable=False)
    policy_group: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    policy_type: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    policy_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    is_default: Mapped[Optional[bool]] = mapped_column(Boolean, default=False)
    created_at: Mapped[Optional[datetime]] = mapped_column(DateTime, server_default=func.now())


class EventGuest(db.Model):
    __tablename__ = 'event_guests'

    id: Mapped[uuid_pkg.UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid_pkg.uuid4)
    event_id: Mapped[Optional[uuid_pkg.UUID]] = mapped_column(PG_UUID(as_uuid=True), ForeignKey('event_details_table.id', ondelete='CASCADE'), nullable=True)
    guest_name: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    designation: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    contact: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    image: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[Optional[datetime]] = mapped_column(DateTime, server_default=func.now())
