import uuid as uuid_pkg
from typing import Optional
from datetime import datetime
from sqlalchemy import String, Text, DateTime, func
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column
from app.extensions.database import db


class CategoryMaster(db.Model):
    __tablename__ = 'category_master_table'

    id: Mapped[uuid_pkg.UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid_pkg.uuid4)
    name: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)
    slug: Mapped[Optional[str]] = mapped_column(String(150), unique=True, index=True, nullable=True)
    subcategories: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # Comma-separated or JSON list
    icon_name: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    category_image: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="Active")
    created_at: Mapped[Optional[datetime]] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[Optional[datetime]] = mapped_column(DateTime, onupdate=func.now(), nullable=True)

    def to_dict(self):
        subs = [s.strip() for s in (self.subcategories or "").split(",") if s.strip()]
        return {
            "id": str(self.id),
            "name": self.name,
            "slug": self.slug or "",
            "subcategories": subs,
            "icon_name": self.icon_name or "Tag",
            "category_image": self.category_image or "",
            "status": self.status,
            "created_at": self.created_at.strftime("%Y-%m-%d %H:%M:%S") if self.created_at else None
        }
