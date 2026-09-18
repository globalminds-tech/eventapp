import uuid as uuid_pkg
from datetime import datetime
from typing import Optional
from sqlalchemy import String, DateTime, ForeignKey, func, Uuid

from sqlalchemy.orm import Mapped, mapped_column
from app.extensions.database import db

class GatePreset(db.Model):
    __tablename__ = 'gate_presets'

    id: Mapped[uuid_pkg.UUID] = mapped_column(Uuid, primary_key=True, default=uuid_pkg.uuid4)
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    organizer_id: Mapped[uuid_pkg.UUID] = mapped_column(Uuid, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    def to_dict(self):
        return {
            "id": str(self.id),
            "name": self.name,
            "organizer_id": str(self.organizer_id),
            "created_at": self.created_at.isoformat() if self.created_at else None
        }


class FoodCounterPreset(db.Model):
    __tablename__ = 'food_counter_presets'

    id: Mapped[uuid_pkg.UUID] = mapped_column(Uuid, primary_key=True, default=uuid_pkg.uuid4)
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    organizer_id: Mapped[uuid_pkg.UUID] = mapped_column(Uuid, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    def to_dict(self):
        return {
            "id": str(self.id),
            "name": self.name,
            "organizer_id": str(self.organizer_id),
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

