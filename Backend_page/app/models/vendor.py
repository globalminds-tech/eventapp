import uuid as uuid_pkg
from typing import Optional
from datetime import datetime
from sqlalchemy import String, Text, Integer, ForeignKey, DateTime, func
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column
from app.extensions.database import db


class VendorDetails(db.Model):
    __tablename__ = 'vendor_details'

    id: Mapped[uuid_pkg.UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid_pkg.uuid4)
    vendor_type: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    vendor_name: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    company_name: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    primary_contact: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    secondary_contact: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    mail_id: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    country: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    state: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    city: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    address: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    bank_name: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    account_holder: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    ifsc_code: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    account_number: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    bank_passbook: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[Optional[str]] = mapped_column(String(20), default='Active')
    organizer_id: Mapped[Optional[uuid_pkg.UUID]] = mapped_column(PG_UUID(as_uuid=True), nullable=True)
    created_at: Mapped[Optional[datetime]] = mapped_column(DateTime, server_default=func.now())
    created_by: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    modified_by: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    modified_on: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)


class VendorDocument(db.Model):
    __tablename__ = 'vendor_documents'

    id: Mapped[uuid_pkg.UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid_pkg.uuid4)
    vendor_id: Mapped[Optional[uuid_pkg.UUID]] = mapped_column(PG_UUID(as_uuid=True), ForeignKey('vendor_details.id', ondelete='CASCADE'), nullable=True)
    document_type: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    document_number: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    document_file: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[Optional[datetime]] = mapped_column(DateTime, server_default=func.now())


class EventVendor(db.Model):
    __tablename__ = 'event_vendors'

    id: Mapped[uuid_pkg.UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid_pkg.uuid4)
    event_id: Mapped[Optional[uuid_pkg.UUID]] = mapped_column(PG_UUID(as_uuid=True), ForeignKey('event_details_table.id', ondelete='CASCADE'), nullable=True)
    vendor_type: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    vendor_name: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    pass_count: Mapped[Optional[int]] = mapped_column(Integer, default=0)
    created_at: Mapped[Optional[datetime]] = mapped_column(DateTime, server_default=func.now())
