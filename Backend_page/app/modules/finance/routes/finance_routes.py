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
def get_admin_payouts():
    """
    Super Admin endpoint to view all organizers eligible for payout, KYC status, and escrow balance.
    """
    try:
        queue = FinanceService.get_admin_payout_queue()
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
        user_id = uuid.UUID(str(current_user.id))
        invoices = db.session.query(FinancialInvoice).filter(
            FinancialInvoice.recipient_user_id == user_id,
            FinancialInvoice.invoice_type == "STALL_INVOICE"
        ).order_by(FinancialInvoice.created_at.desc()).all()

        return {
            "success": True,
            "data": [inv.to_dict() for inv in invoices]
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
