from typing import Optional
from datetime import datetime
from sqlalchemy import String, Text, Boolean, Integer, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from app.extensions.database import db

class CategoryMaster(db.Model):
    __tablename__ = 'category_master_table'

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)
    slug: Mapped[Optional[str]] = mapped_column(String(150), unique=True, index=True, nullable=True)
    subcategories: Mapped[Optional[str]] = mapped_column(Text, nullable=True) # Comma-separated or JSON list
    icon_name: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    category_image: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="Active")
    created_at: Mapped[Optional[datetime]] = mapped_column(DateTime, default=datetime.utcnow)

    def __init__(self, name: str = "", subcategories: Optional[str] = None, icon_name: Optional[str] = None, category_image: Optional[str] = None, status: str = "Active", slug: Optional[str] = None, **kwargs):
        super().__init__(**kwargs)
        self.name = name
        self.slug = slug
        self.subcategories = subcategories
        self.icon_name = icon_name
        self.category_image = category_image
        self.status = status

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
