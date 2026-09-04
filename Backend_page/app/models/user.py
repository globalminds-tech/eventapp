import uuid as uuid_pkg
from typing import Optional
from datetime import datetime
from sqlalchemy import String, Text, Boolean, DateTime, func
from sqlalchemy.dialects.postgresql import UUID as PG_UUID, ARRAY
from sqlalchemy.orm import Mapped, mapped_column
from app.extensions.database import db


class User(db.Model):
    __tablename__ = 'users'

    id: Mapped[uuid_pkg.UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid_pkg.uuid4)
    name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    email: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    password: Mapped[str] = mapped_column(String(255), nullable=False)
    roles: Mapped[Optional[list[str]]] = mapped_column(ARRAY(String(50)), default=lambda: ["user"], nullable=True)
    active_role: Mapped[Optional[str]] = mapped_column(String(50), default="user", nullable=True)
    status: Mapped[Optional[str]] = mapped_column(String(50), default="ACTIVE")
    mobile: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    address: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    country: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    state: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    city: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    profile_image: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    organization_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    email_verified: Mapped[Optional[bool]] = mapped_column(Boolean, default=False)

    # Multi-currency & Locale support
    locale: Mapped[Optional[str]] = mapped_column(String(10), default='en_IN')
    currency_preference: Mapped[Optional[str]] = mapped_column(String(3), default='INR')
    timezone: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)

    created_at: Mapped[Optional[datetime]] = mapped_column(DateTime, server_default=func.now())
    created_by: Mapped[Optional[uuid_pkg.UUID]] = mapped_column(PG_UUID(as_uuid=True), nullable=True)
    updated_at: Mapped[Optional[datetime]] = mapped_column(DateTime, onupdate=func.now(), nullable=True)
    updated_by: Mapped[Optional[uuid_pkg.UUID]] = mapped_column(PG_UUID(as_uuid=True), nullable=True)
    deleted_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    deleted_by: Mapped[Optional[uuid_pkg.UUID]] = mapped_column(PG_UUID(as_uuid=True), nullable=True)

    def to_dict(self):
        user_roles = list(self.roles) if self.roles else ["user"]
        active = self.active_role or (user_roles[0] if user_roles else "user")
        return {
            "id": str(self.id),
            "name": self.name,
            "email": self.email,
            "role": active,
            "active_role": active,
            "roles": user_roles,
            "status": self.status,
            "mobile": self.mobile,
            "address": self.address,
            "country": self.country,
            "state": self.state,
            "city": self.city,
            "profile_image": self.profile_image,
            "organization_name": self.organization_name,
            "email_verified": self.email_verified,
            "locale": self.locale,
            "currency_preference": self.currency_preference,
            "timezone": self.timezone,
            "is_deleted": bool(self.deleted_at),
        }
