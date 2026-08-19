from typing import Optional
from datetime import datetime
from sqlalchemy import String, Text, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from app.extensions.database import db

class Country(db.Model):
    __tablename__ = 'countries'
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    country_name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)

class State(db.Model):
    __tablename__ = 'states'
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    state_name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    country_id: Mapped[Optional[int]] = mapped_column(ForeignKey('countries.id', ondelete='CASCADE'))

class City(db.Model):
    __tablename__ = 'cities'
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    city_name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    state_id: Mapped[Optional[int]] = mapped_column(ForeignKey('states.id', ondelete='CASCADE'))

class Venue(db.Model):
    __tablename__ = 'venues'
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    venue_code: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    venue_name: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    address: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    country_name: Mapped[Optional[str]] = mapped_column(String(30), nullable=True)
    state_name: Mapped[Optional[str]] = mapped_column(String(30), nullable=True)
    city_name: Mapped[Optional[str]] = mapped_column(String(30), nullable=True)
    pin_code: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)
    venue_image: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    organizer_id: Mapped[Optional[int]] = mapped_column(nullable=True)
    created_at: Mapped[Optional[datetime]] = mapped_column(DateTime, default=datetime.utcnow)
    created_by: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    modified_by: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    modified_on: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

class VenueDocument(db.Model):
    __tablename__ = 'venue_documents'
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    venue_id: Mapped[Optional[int]] = mapped_column(ForeignKey('venues.id', ondelete='CASCADE'))
    document_type: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    document_number: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    document_file: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[Optional[datetime]] = mapped_column(DateTime, default=datetime.utcnow)
