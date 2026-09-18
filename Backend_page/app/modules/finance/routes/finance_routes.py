import uuid
from typing import Optional
from fastapi import APIRouter, Request, HTTPException, Depends
from app.modules.finance.services.finance_service import FinanceService
from app.middleware.auth import get_current_user
from app.models.financial import FinancialInvoice, EventTransaction
from app.extensions.database import db


finance_router = APIRouter(prefix="/api/v1/finances", tags=["Finances"])
root_finance_router = APIRouter(prefix="", tags=["Finances Root Aliases"])


def _extract_user_id(user) -> Optional[uuid.UUID]:
    if not user:
        return None
    raw_id = (user.get("user_id") or user.get("id") or user.get("sub")) if isinstance(user, dict) else (getattr(user, "id", None) or getattr(user, "user_id", None))
    try:
        return uuid.UUID(str(raw_id)) if raw_id else None
    except Exception:
        return None


@finance_router.get("/organizer/ledger")
@root_finance_router.get("/api/v1/finance/organizer/ledger")
async def get_organizer_ledger(request: Request, current_user = Depends(get_current_user)):
    """
    Returns live financial ledger, KPI stats, and payout slips for the logged-in Organizer.
    """
    try:
        user_id = _extract_user_id(current_user)
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid user identification")
        data = FinanceService.get_organizer_financial_summary(user_id)
        return {"success": True, "data": data}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@finance_router.get("/admin/payouts")
@root_finance_router.get("/superuser/api/payouts")
@root_finance_router.get("/api/v1/finance/admin/payouts")
@root_finance_router.get("/api/v1/finance/admin/payouts-queue")
def get_admin_payouts(search: Optional[str] = None):
    """
    Super Admin endpoint to view all organizers eligible for payout, KYC status, and escrow balance.
    Supports API-driven search query.
    """
    try:
        queue = FinanceService.get_admin_payout_queue(search=search)
        return {"success": True, "data": queue}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@finance_router.post("/admin/disburse-payout")
@root_finance_router.post("/api/v1/finance/admin/disburse-payout")
async def disburse_payout(request: Request):
    """
    Super Admin endpoint to execute an automated or assisted payout to an organizer.
    """
    try:
        body = await request.json()
        organizer_id = uuid.UUID(body.get("organizer_id"))
        amount = float(body.get("amount", 0))
        manual_utr = body.get("manual_utr")
        admin_id = None
        try:
            from app.middleware.auth import get_current_user
            cur_user = get_current_user(request)
            admin_id = _extract_user_id(cur_user)
        except Exception:
            pass

        result = FinanceService.disburse_payout(
            organizer_id=organizer_id,
            amount=amount,
            admin_user_id=admin_id,
            manual_utr=manual_utr
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@finance_router.get("/exhibitor/invoices")
async def get_exhibitor_invoices(request: Request, current_user = Depends(get_current_user)):
    """
    Returns formal GST Tax Invoices for stalls reserved by the logged-in Exhibitor.
    """
    try:
        raw_uid = current_user.get("user_id") or current_user.get("id") or current_user.get("sub")
        if not raw_uid:
            return {"success": True, "data": []}

        from app.modules.rbac.services.tenant_service import TenantService
        try:
            tenant_uids = TenantService.resolve_tenant_user_ids(raw_uid, "EXHIBITOR")
        except Exception:
            tenant_uids = [raw_uid]

        user_uuids = []
        for u in tenant_uids:
            try:
                user_uuids.append(uuid.UUID(str(u)))
            except Exception:
                user_uuids.append(u)

        from app.models.exhibitor import ExhibitorStallBooking
        from app.models.event import EventDetails

        invoice_rows = db.session.query(
            FinancialInvoice,
            EventTransaction.stall_booking_id,
            EventDetails.event_name,
            ExhibitorStallBooking.stall_area,
            ExhibitorStallBooking.company_name
        ).outerjoin(
            EventTransaction, FinancialInvoice.transaction_id == EventTransaction.id
        ).outerjoin(
            EventDetails, FinancialInvoice.event_id == EventDetails.id
        ).outerjoin(
            ExhibitorStallBooking, EventTransaction.stall_booking_id == ExhibitorStallBooking.id
        ).filter(
            FinancialInvoice.recipient_user_id.in_(user_uuids),
            FinancialInvoice.invoice_type == "STALL_INVOICE"
        ).order_by(FinancialInvoice.created_at.desc()).all()

        covered_booking_ids = set()
        invoice_list = []
        for inv, stall_booking_id, ev_name, st_area, comp_name in invoice_rows:
            d = inv.to_dict()
            if stall_booking_id:
                covered_booking_ids.add(str(stall_booking_id))
            d["event_name"] = ev_name or "Exhibition Expo"
            d["stall_area"] = st_area or "Exhibition Stall"
            if comp_name:
                d["billing_name"] = comp_name
            invoice_list.append(d)

        # Synthesize invoices for stall bookings that do not yet have a formal FinancialInvoice record
        bookings = db.session.query(
            ExhibitorStallBooking,
            EventDetails.event_name
        ).outerjoin(
            EventDetails, ExhibitorStallBooking.event_id == EventDetails.id
        ).filter(
            ExhibitorStallBooking.user_id.in_(user_uuids)
        ).order_by(ExhibitorStallBooking.created_at.desc()).all()

        for row in bookings:
            b = row[0]
            # Prevent duplicate invoices for the same booking
            if str(b.id) in covered_booking_ids:
                continue

            event_name = row[1] or "Exhibition Expo"
            inv_num = f"INV-BME-{str(b.id).replace('-', '')[:6].upper()}"

            from app.modules.exhibitors.repository.exhibitor_repository import ExhibitorRepository
            pricing = ExhibitorRepository.get_stall_pricing(b)
            total = float(pricing.get("total_price", 0.0) or 0.0)
            base_amt = round(total / 1.18, 2)
            gst_split = round((total - base_amt) / 2.0, 2)

            b_st = str(b.status or "").lower()
            if b_st in ["confirmed", "paid"]:
                status_str = "PAID"
            elif b_st == "approved":
                status_str = "PAYMENT PENDING"
            elif b_st == "rejected":
                status_str = "REJECTED"
            else:
                status_str = "PENDING APPROVAL"

            synth_invoice = {
                "id": str(b.id),
                "invoice_number": inv_num,
                "created_at": str(b.created_at) if b.created_at else None,
                "billing_name": b.company_name or "Registered Exhibitor",
                "subtotal": base_amt,
                "cgst": gst_split,
                "sgst": gst_split,
                "total_amount": total,
                "status": status_str,
                "event_name": event_name,
                "stall_area": b.stall_area or "Exhibition Stall",
                "gstin": getattr(b, "gstin", None) or "33AAAAA0000A1Z5"
            }
            invoice_list.append(synth_invoice)

        return {
            "success": True,
            "data": invoice_list
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@finance_router.post("/webhook")
async def payment_webhook(request: Request):
    """
    Server-to-Server Razorpay webhook receiver to guarantee zero missed transactions.
    """
    try:
        payload = await request.json()
        event_name = payload.get("event")

        if event_name == "payment.captured":
            payment_entity = payload.get("payload", {}).get("payment", {}).get("entity", {})
            amount_inr = float(payment_entity.get("amount", 0)) / 100.0  # Paisa to INR
            order_id = payment_entity.get("order_id")
            payment_id = payment_entity.get("id")

            # Anti-duplicate check
            existing_txn = db.session.query(EventTransaction).filter_by(gateway_payment_id=payment_id).first()
            if not existing_txn:
                FinanceService.record_transaction(
                    event_id=None,
                    transaction_type="TICKET_SALE",
                    gross_amount=amount_inr,
                    gateway_payment_id=payment_id,
                    gateway_order_id=order_id,
                    description="Automated Webhook Capture"
                )

        return {"status": "ok"}
    except Exception as e:
        return {"status": "error", "message": str(e)}
