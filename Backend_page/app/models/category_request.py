import uuid as uuid_pkg
from typing import Optional
from datetime import datetime
from sqlalchemy import String, Text, DateTime, func
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column
from app.extensions.database import db


class CategoryRequest(db.Model):
    __tablename__ = 'category_requests'

    id: Mapped[uuid_pkg.UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid_pkg.uuid4)
    organizer_id: Mapped[Optional[uuid_pkg.UUID]] = mapped_column(PG_UUID(as_uuid=True), nullable=True)
    organizer_name: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    category_name: Mapped[str] = mapped_column(String(100), nullable=False)
    subcategory_name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="Pending")  # Pending, Approved, Rejected
    created_at: Mapped[Optional[datetime]] = mapped_column(DateTime, server_default=func.now())

    def to_dict(self):
        return {
            "id": str(self.id),
            "organizer_id": str(self.organizer_id) if self.organizer_id else None,
            "organizer_name": self.organizer_name or "Organizer",
            "category_name": self.category_name,
            "subcategory_name": self.subcategory_name or "",
            "reason": self.reason or "",
            "status": self.status,
            "created_at": self.created_at.strftime("%Y-%m-%d %H:%M:%S") if self.created_at else None
        }
