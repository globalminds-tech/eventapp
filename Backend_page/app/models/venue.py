import uuid as uuid_pkg
from typing import Optional
from datetime import datetime
from sqlalchemy import String, Text, ForeignKey, DateTime, Numeric, func
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column
from app.extensions.database import db


class Venue(db.Model):
    __tablename__ = 'venues'

    id: Mapped[uuid_pkg.UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid_pkg.uuid4)
    venue_code: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    venue_name: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    address: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    country_name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    state_name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    city_name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    pin_code: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)
    venue_image: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    total_area_sqft: Mapped[Optional[float]] = mapped_column(nullable=True, default=50000.0)
    status: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    organizer_id: Mapped[Optional[uuid_pkg.UUID]] = mapped_column(PG_UUID(as_uuid=True), nullable=True)
    organization_id: Mapped[Optional[uuid_pkg.UUID]] = mapped_column(PG_UUID(as_uuid=True), nullable=True)

    # Geocoding / Map integration
    latitude: Mapped[Optional[float]] = mapped_column(Numeric(10, 7), nullable=True)
    longitude: Mapped[Optional[float]] = mapped_column(Numeric(10, 7), nullable=True)
    google_place_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    created_at: Mapped[Optional[datetime]] = mapped_column(DateTime, server_default=func.now())
    created_by: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    updated_at: Mapped[Optional[datetime]] = mapped_column(DateTime, onupdate=func.now(), nullable=True)
    updated_by: Mapped[Optional[uuid_pkg.UUID]] = mapped_column(PG_UUID(as_uuid=True), ForeignKey('users.id', ondelete='SET NULL'), nullable=True)
    deleted_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    deleted_by: Mapped[Optional[uuid_pkg.UUID]] = mapped_column(PG_UUID(as_uuid=True), ForeignKey('users.id', ondelete='SET NULL'), nullable=True)

    def to_dict(self):
        return {
            "id": str(self.id),
            "venue_code": self.venue_code or "",
            "venue_name": self.venue_name or "",
            "address": self.address or "",
            "country_name": self.country_name or "",
            "state_name": self.state_name or "",
            "city_name": self.city_name or "",
            "pin_code": self.pin_code or "",
            "venue_image": self.venue_image or "",
            "total_area_sqft": self.total_area_sqft or 50000.0,
            "status": self.status or "Active",
            "organizer_id": str(self.organizer_id) if self.organizer_id else None,
            "latitude": float(self.latitude) if self.latitude else None,
            "longitude": float(self.longitude) if self.longitude else None,
            "google_place_id": self.google_place_id,
        }


class VenueDocument(db.Model):
    __tablename__ = 'venue_documents'

    id: Mapped[uuid_pkg.UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid_pkg.uuid4)
    venue_id: Mapped[Optional[uuid_pkg.UUID]] = mapped_column(PG_UUID(as_uuid=True), ForeignKey('venues.id', ondelete='CASCADE'), nullable=True)
    document_type: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    document_number: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    document_file: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[Optional[datetime]] = mapped_column(DateTime, server_default=func.now())
