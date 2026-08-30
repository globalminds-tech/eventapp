from typing import Optional
from datetime import datetime
from sqlalchemy import String, Text, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from app.extensions.database import db

class CategoryRequest(db.Model):
    __tablename__ = 'category_requests'

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    organizer_id: Mapped[Optional[int]] = mapped_column(nullable=True)
    organizer_name: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    category_name: Mapped[str] = mapped_column(String(100), nullable=False)
    subcategory_name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="Pending") # Pending, Approved, Rejected
    created_at: Mapped[Optional[datetime]] = mapped_column(DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "organizer_id": self.organizer_id,
            "organizer_name": self.organizer_name or "Organizer",
            "category_name": self.category_name,
            "subcategory_name": self.subcategory_name or "",
            "reason": self.reason or "",
            "status": self.status,
            "created_at": self.created_at.strftime("%Y-%m-%d %H:%M:%S") if self.created_at else None
        }
