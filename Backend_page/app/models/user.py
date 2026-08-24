from typing import Optional
from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column
from app.extensions.database import db

class User(db.Model):
    __tablename__ = 'users'

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    email: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    mobile: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    address: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    country: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    state: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    city: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    profile_image: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    organization_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    def __init__(self, name: Optional[str] = None, email: str = "", password: str = "", role: Optional[str] = None, mobile: Optional[str] = None, address: Optional[str] = None, country: Optional[str] = None, state: Optional[str] = None, city: Optional[str] = None, profile_image: Optional[str] = None, organization_name: Optional[str] = None, **kwargs):
        super().__init__(**kwargs)
        self.name = name
        self.email = email
        self.password = password
        self.role = role
        self.mobile = mobile
        self.address = address
        self.country = country
        self.state = state
        self.city = city
        self.profile_image = profile_image
        self.organization_name = organization_name

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "role": self.role,
            "mobile": self.mobile,
            "address": self.address,
            "country": self.country,
            "state": self.state,
            "city": self.city,
            "profile_image": self.profile_image,
            "organization_name": self.organization_name
        }
