import uuid as uuid_pkg
from typing import Optional
from datetime import datetime
from sqlalchemy import String, Text, Numeric, ForeignKey, DateTime, func
from sqlalchemy.dialects.postgresql import UUID as PG_UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column
from app.extensions.database import db


class EventTransaction(db.Model):
    """
    Immutable double-entry transaction record.
    Logs all incoming ticket sales, stall bookings, refunds, and fee deductions.
    """
    __tablename__ = 'event_transactions'

    id: Mapped[uuid_pkg.UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid_pkg.uuid4)
    transaction_ref: Mapped[str] = mapped_column(String(60), unique=True, nullable=False, index=True)
    event_id: Mapped[Optional[uuid_pkg.UUID]] = mapped_column(PG_UUID(as_uuid=True), ForeignKey('event_details_table.id', ondelete='CASCADE'), nullable=True, index=True)
    booking_id: Mapped[Optional[uuid_pkg.UUID]] = mapped_column(PG_UUID(as_uuid=True), ForeignKey('user_booking_details.id', ondelete='SET NULL'), nullable=True, index=True)
    stall_booking_id: Mapped[Optional[uuid_pkg.UUID]] = mapped_column(PG_UUID(as_uuid=True), ForeignKey('exhibitor_stall_bookings.id', ondelete='SET NULL'), nullable=True, index=True)
    payer_user_id: Mapped[Optional[uuid_pkg.UUID]] = mapped_column(PG_UUID(as_uuid=True), ForeignKey('users.id', ondelete='SET NULL'), nullable=True)
    organizer_user_id: Mapped[Optional[uuid_pkg.UUID]] = mapped_column(PG_UUID(as_uuid=True), ForeignKey('users.id', ondelete='SET NULL'), nullable=True, index=True)

    # Type & Description
    transaction_type: Mapped[str] = mapped_column(String(40), nullable=False)  # 'TICKET_SALE', 'STALL_BOOKING', 'REFUND', 'PAYOUT'
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Financial breakdown
    currency: Mapped[str] = mapped_column(String(5), default='INR')
    gross_amount: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False, default=0.00)
    tax_amount: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False, default=0.00)
    platform_fee: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False, default=0.00)
    gateway_fee: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False, default=0.00)
    net_organizer_amount: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False, default=0.00)

    # Gateway Metadata
    payment_gateway: Mapped[Optional[str]] = mapped_column(String(50), default='Razorpay')
    gateway_order_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    gateway_payment_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True, index=True)
    gateway_signature: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    raw_gateway_response: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)

    # Status
    status: Mapped[str] = mapped_column(String(30), default='SUCCESS')  # 'SUCCESS', 'PENDING', 'FAILED', 'REFUNDED'
    escrow_status: Mapped[str] = mapped_column(String(30), default='HELD')  # 'HELD', 'CLEARED', 'DISBURSED', 'REFUNDED'

    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    def to_dict(self):
        return {
            "id": str(self.id),
            "transaction_ref": self.transaction_ref,
            "event_id": str(self.event_id) if self.event_id else None,
            "booking_id": str(self.booking_id) if self.booking_id else None,
            "stall_booking_id": str(self.stall_booking_id) if self.stall_booking_id else None,
            "payer_user_id": str(self.payer_user_id) if self.payer_user_id else None,
            "organizer_user_id": str(self.organizer_user_id) if self.organizer_user_id else None,
            "transaction_type": self.transaction_type,
            "description": self.description,
            "currency": self.currency,
            "gross_amount": float(self.gross_amount or 0),
            "tax_amount": float(self.tax_amount or 0),
            "platform_fee": float(self.platform_fee or 0),
            "gateway_fee": float(self.gateway_fee or 0),
            "net_organizer_amount": float(self.net_organizer_amount or 0),
            "payment_gateway": self.payment_gateway,
            "gateway_payment_id": self.gateway_payment_id,
            "status": self.status,
            "escrow_status": self.escrow_status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class OrganizerPayout(db.Model):
    """
    Tracks payout disbursements from platform escrow to organizer bank accounts.
    """
    __tablename__ = 'organizer_payouts'

    id: Mapped[uuid_pkg.UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid_pkg.uuid4)
    payout_ref: Mapped[str] = mapped_column(String(60), unique=True, nullable=False, index=True)
    organizer_user_id: Mapped[uuid_pkg.UUID] = mapped_column(PG_UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    event_id: Mapped[Optional[uuid_pkg.UUID]] = mapped_column(PG_UUID(as_uuid=True), ForeignKey('event_details_table.id', ondelete='SET NULL'), nullable=True)

    amount: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    currency: Mapped[str] = mapped_column(String(5), default='INR')

    # Bank Snapshot at time of payout
    bank_name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    account_number: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    ifsc_code: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    beneficiary_name: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)

    # Disbursement mode & execution details
    disbursement_mode: Mapped[str] = mapped_column(String(30), default='RAZORPAYX')  # 'RAZORPAYX' or 'MANUAL_UTR'
    utr_number: Mapped[Optional[str]] = mapped_column(String(100), nullable=True, index=True)
    razorpayx_payout_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)

    status: Mapped[str] = mapped_column(String(30), default='REQUESTED')  # 'REQUESTED', 'PROCESSING', 'SETTLED', 'FAILED'
    failure_reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    approved_by: Mapped[Optional[uuid_pkg.UUID]] = mapped_column(PG_UUID(as_uuid=True), ForeignKey('users.id', ondelete='SET NULL'), nullable=True)
    settled_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    def to_dict(self):
        masked_acc = f"...{self.account_number[-4:]}" if self.account_number and len(self.account_number) >= 4 else (self.account_number or "")
        return {
            "id": str(self.id),
            "payout_ref": self.payout_ref,
            "organizer_user_id": str(self.organizer_user_id),
            "event_id": str(self.event_id) if self.event_id else None,
            "amount": float(self.amount or 0),
            "currency": self.currency,
            "bank_name": self.bank_name,
            "account_number_masked": masked_acc,
            "ifsc_code": self.ifsc_code,
            "beneficiary_name": self.beneficiary_name,
            "disbursement_mode": self.disbursement_mode,
            "utr_number": self.utr_number,
            "status": self.status,
            "failure_reason": self.failure_reason,
            "settled_at": self.settled_at.isoformat() if self.settled_at else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class FinancialInvoice(db.Model):
    """
    GST Tax Invoices for Attendee passes, Exhibitor stalls, and Platform commission slips.
    """
    __tablename__ = 'financial_invoices'

    id: Mapped[uuid_pkg.UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid_pkg.uuid4)
    invoice_number: Mapped[str] = mapped_column(String(60), unique=True, nullable=False, index=True)
    invoice_type: Mapped[str] = mapped_column(String(40), nullable=False)  # 'TICKET_RECEIPT', 'STALL_INVOICE', 'PLATFORM_COMMISSION'

    recipient_user_id: Mapped[Optional[uuid_pkg.UUID]] = mapped_column(PG_UUID(as_uuid=True), ForeignKey('users.id', ondelete='SET NULL'), nullable=True)
    event_id: Mapped[Optional[uuid_pkg.UUID]] = mapped_column(PG_UUID(as_uuid=True), ForeignKey('event_details_table.id', ondelete='CASCADE'), nullable=True)
    transaction_id: Mapped[Optional[uuid_pkg.UUID]] = mapped_column(PG_UUID(as_uuid=True), ForeignKey('event_transactions.id', ondelete='SET NULL'), nullable=True)

    billing_name: Mapped[str] = mapped_column(String(150), nullable=False)
    billing_email: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    billing_address: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    billing_gstin: Mapped[Optional[str]] = mapped_column(String(30), nullable=True)

    subtotal: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False, default=0.00)
    cgst: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False, default=0.00)
    sgst: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False, default=0.00)
    igst: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False, default=0.00)
    total_amount: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False, default=0.00)

    pdf_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(30), default='PAID')  # 'PAID', 'PENDING', 'CANCELLED'

    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    def to_dict(self):
        return {
            "id": str(self.id),
            "invoice_number": self.invoice_number,
            "invoice_type": self.invoice_type,
            "recipient_user_id": str(self.recipient_user_id) if self.recipient_user_id else None,
            "event_id": str(self.event_id) if self.event_id else None,
            "transaction_id": str(self.transaction_id) if self.transaction_id else None,
            "billing_name": self.billing_name,
            "billing_email": self.billing_email,
            "billing_gstin": self.billing_gstin,
            "subtotal": float(self.subtotal or 0),
            "cgst": float(self.cgst or 0),
            "sgst": float(self.sgst or 0),
            "igst": float(self.igst or 0),
            "total_amount": float(self.total_amount or 0),
            "pdf_url": self.pdf_url,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
