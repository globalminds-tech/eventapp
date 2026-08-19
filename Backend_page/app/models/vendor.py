from typing import Optional
from datetime import datetime
from sqlalchemy import String, Text, Integer, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from app.extensions.database import db

class VendorDetails(db.Model):
    __tablename__ = 'vendor_details'

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
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
    organizer_id: Mapped[Optional[int]] = mapped_column(nullable=True)
    created_at: Mapped[Optional[datetime]] = mapped_column(DateTime, default=datetime.utcnow)
    created_by: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    modified_by: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    modified_on: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)


class VendorDocument(db.Model):
    __tablename__ = 'vendor_documents'

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    vendor_id: Mapped[Optional[int]] = mapped_column(ForeignKey('vendor_details.id', ondelete='CASCADE'))
    document_type: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    document_number: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    document_file: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[Optional[datetime]] = mapped_column(DateTime, default=datetime.utcnow)


class EventVendor(db.Model):
    __tablename__ = 'event_vendors'

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    event_id: Mapped[Optional[int]] = mapped_column(ForeignKey('event_details_table.id', ondelete='CASCADE'))
    vendor_type: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    vendor_name: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    pass_count: Mapped[Optional[int]] = mapped_column(Integer, default=0)
    created_at: Mapped[Optional[datetime]] = mapped_column(DateTime, default=datetime.utcnow)
