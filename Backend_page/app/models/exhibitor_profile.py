import uuid as uuid_pkg
from typing import Optional
from sqlalchemy import String, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column
from app.extensions.database import db


class ExhibitorProfile(db.Model):
    __tablename__ = 'exhibitor_profiles'

    id: Mapped[uuid_pkg.UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid_pkg.uuid4)
    user_id: Mapped[uuid_pkg.UUID] = mapped_column(PG_UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    company_name: Mapped[str] = mapped_column(String(255), nullable=False)
    vendor_category: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    gstin: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    pan_number: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    business_address: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    city: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    state: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    pincode: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    website_url: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    bank_name: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    account_number: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    ifsc_code: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    account_holder: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    upi_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    kyc_status: Mapped[Optional[str]] = mapped_column(String(50), default="VERIFIED")

    def to_dict(self):
        return {
            "id": str(self.id),
            "user_id": str(self.user_id),
            "company_name": self.company_name,
            "vendor_category": self.vendor_category,
            "gstin": self.gstin,
            "pan_number": self.pan_number,
            "business_address": self.business_address,
            "city": self.city,
            "state": self.state,
            "pincode": self.pincode,
            "website_url": self.website_url,
            "bank_name": self.bank_name,
            "account_number": self.account_number,
            "ifsc_code": self.ifsc_code,
            "account_holder": self.account_holder,
            "upi_id": self.upi_id,
            "kyc_status": self.kyc_status,
        }
