import uuid as uuid_pkg
from typing import Optional
from datetime import datetime
from sqlalchemy import String, Text, ForeignKey, DateTime, func, Uuid

from sqlalchemy.orm import Mapped, mapped_column
from app.extensions.database import db


class OrganizerProfile(db.Model):
    __tablename__ = 'organizer_profiles'

    id: Mapped[uuid_pkg.UUID] = mapped_column(Uuid, primary_key=True, default=uuid_pkg.uuid4)
    user_id: Mapped[uuid_pkg.UUID] = mapped_column(Uuid, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    company_name: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[Optional[str]] = mapped_column(String(255), unique=True, index=True, nullable=True)
    business_type: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    gstin: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    pan_number: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    pan_hash: Mapped[Optional[str]] = mapped_column(String(64), index=True, nullable=True)
    business_address: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    city: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    state: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    pincode: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    website_url: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    bank_name: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    account_number: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    account_hash: Mapped[Optional[str]] = mapped_column(String(64), index=True, nullable=True)
    ifsc_code: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    account_holder: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    upi_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    kyc_status: Mapped[Optional[str]] = mapped_column(String(50), default="VERIFIED")

    # Organization & Multi-currency support
    organization_id: Mapped[Optional[uuid_pkg.UUID]] = mapped_column(Uuid, nullable=True)
    default_currency: Mapped[Optional[str]] = mapped_column(String(3), default='INR')

    created_at: Mapped[Optional[datetime]] = mapped_column(DateTime, server_default=func.now())
    created_by: Mapped[Optional[uuid_pkg.UUID]] = mapped_column(Uuid, ForeignKey('users.id', ondelete='SET NULL'), nullable=True)
    updated_at: Mapped[Optional[datetime]] = mapped_column(DateTime, onupdate=func.now(), nullable=True)
    updated_by: Mapped[Optional[uuid_pkg.UUID]] = mapped_column(Uuid, ForeignKey('users.id', ondelete='SET NULL'), nullable=True)
    deleted_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    deleted_by: Mapped[Optional[uuid_pkg.UUID]] = mapped_column(Uuid, ForeignKey('users.id', ondelete='SET NULL'), nullable=True)

    def to_dict(self, include_sensitive: bool = False):
        from app.utils.security_crypto import decrypt_field, mask_account_number, mask_pan_number
        decrypted_acc = decrypt_field(self.account_number) if self.account_number else None
        decrypted_pan = decrypt_field(self.pan_number) if self.pan_number else None
        masked_acc = mask_account_number(decrypted_acc) if decrypted_acc else None
        masked_pan = mask_pan_number(decrypted_pan) if decrypted_pan else None

        return {
            "id": str(self.id),
            "user_id": str(self.user_id),
            "company_name": self.company_name,
            "slug": self.slug or "",
            "business_type": self.business_type,
            "gstin": self.gstin,
            "pan_number": decrypted_pan if include_sensitive else masked_pan,
            "pan_number_masked": masked_pan,
            "business_address": self.business_address,
            "city": self.city,
            "state": self.state,
            "pincode": self.pincode,
            "website_url": self.website_url,
            "bank_name": self.bank_name,
            "account_number": decrypted_acc if include_sensitive else masked_acc,
            "account_number_masked": masked_acc,
            "ifsc_code": self.ifsc_code,
            "account_holder": self.account_holder,
            "upi_id": self.upi_id,
            "kyc_status": self.kyc_status,
            "default_currency": self.default_currency,
        }
