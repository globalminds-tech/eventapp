from typing import Optional
from datetime import datetime
from sqlalchemy import String, Text, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from app.extensions.database import db

class SponsorDetails(db.Model):
    __tablename__ = 'sponsors_details'

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    sponsor_code: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    sponsor_name: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    primary_contact: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    secondary_contact: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    mail_id: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    address: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    organizer_id: Mapped[Optional[int]] = mapped_column(nullable=True)
    created_at: Mapped[Optional[datetime]] = mapped_column(DateTime, default=datetime.utcnow)
    created_by: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    modified_by: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    modified_on: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)


class SponsorDocument(db.Model):
    __tablename__ = 'sponsor_documents'

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    sponsor_id: Mapped[Optional[int]] = mapped_column(nullable=True)
    document_type: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    document_number: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    document_file: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[Optional[datetime]] = mapped_column(DateTime, default=datetime.utcnow)


class EventSponsor(db.Model):
    __tablename__ = 'event_sponsors'

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    event_id: Mapped[Optional[int]] = mapped_column(ForeignKey('event_details_table.id', ondelete='CASCADE'))
    sponsor_name: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    sponsorship_type: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    created_at: Mapped[Optional[datetime]] = mapped_column(DateTime, default=datetime.utcnow)
