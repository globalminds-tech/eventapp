from typing import Optional
from fastapi import APIRouter, Request, Header
from app.modules.payments.controllers.payment_controller import PaymentController
from app.modules.payments.schemas.payment_schema import (
    CreateOrderSchema, VerifySignatureSchema, RefundSchema
)

payment_router = APIRouter(prefix="/api/v1/payments", tags=["Payments"])

@payment_router.post("/create-order")
def create_order(payload: CreateOrderSchema):
    return PaymentController.create_order(payload.dict())

@payment_router.post("/verify-signature")
def verify_signature(payload: VerifySignatureSchema):
    return PaymentController.verify_signature(payload.dict())

@payment_router.post("/refund")
def process_refund(payload: RefundSchema):
    return PaymentController.process_refund(payload.dict())

@payment_router.post("/webhook")
async def webhook(request: Request, x_razorpay_signature: Optional[str] = Header(None)):
    payload_body = (await request.body()).decode("utf-8")
    return PaymentController.webhook(payload_body, x_razorpay_signature)
