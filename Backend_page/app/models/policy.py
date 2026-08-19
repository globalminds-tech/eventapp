from typing import Optional
from datetime import datetime
from sqlalchemy import String, Text, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from app.extensions.database import db

class Policy(db.Model):
    __tablename__ = 'policies'

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    policy_code: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    policy_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    policy_type: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    policy_group: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    file_path: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    organizer_id: Mapped[Optional[int]] = mapped_column(nullable=True)
    status: Mapped[Optional[str]] = mapped_column(String(20), default='Active')
    created_at: Mapped[Optional[datetime]] = mapped_column(DateTime, default=datetime.utcnow)
    created_by: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    modified_by: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    modified_on: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
