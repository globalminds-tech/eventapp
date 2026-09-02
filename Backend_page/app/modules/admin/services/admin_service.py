import os
from datetime import datetime
from app.exceptions.api_error import ApiError
from app.modules.admin.repository.admin_repository import AdminRepository
from app.modules.admin.schemas.admin_schema import (
    UpdateEventStatusSchema, CategorySchema, UpdateKycStatusSchema
)

from sqlalchemy import select, desc
from app.extensions.database import db
from app.models.event import EventDetails, EventBookingDetails, EventFile
from app.models.user import User

class AdminService:
    @staticmethod
    def get_dashboard_stats(period: str = "30d") -> dict:
        try:
            events = db.session.scalars(select(EventDetails)).all()
            users = db.session.scalars(select(User)).all()
            bookings = db.session.scalars(select(EventBookingDetails)).all()
            
            total_events = len(events)
            live_events = 0
            upcoming_events = 0
            completed_events = 0
            pending_events = 0
            approved_events = 0

            today = datetime.utcnow().date()

            for e in events:
                st = str(getattr(e, "status", "") or "ACTIVE").upper()
                s_date = getattr(e, "start_date", None)
                e_date = getattr(e, "end_date", None)

                if st in ["PENDING", "SUBMITTED", "DRAFT"]:
                    pending_events += 1
                elif e_date and e_date < today:
                    completed_events += 1
                elif s_date and s_date > today:
                    upcoming_events += 1
                else:
                    live_events += 1
                    approved_events += 1

            total_users = len(users)
            total_organizers = sum(1 for u in users if str(getattr(u, "role", "") or "").lower() == "organizer")
            total_exhibitors = sum(1 for u in users if str(getattr(u, "role", "") or "").lower() == "exhibitor")
            total_attendees = max(0, total_users - (total_organizers + total_exhibitors))

            gross_gmv = 0.0
            for e in events:
                b = next((bk for bk in bookings if bk.event_id == e.id), None)
                price = float(getattr(b, "price_inr", 0) or getattr(b, "price", 0) or getattr(e, "pass_fee", 0) or 500)
                sold = int(getattr(e, "passes_sold", 0) or getattr(b, "passes_sold", 0) or getattr(b, "capacity", 0) or 10)
                gross_gmv += (price * sold)

            platform_revenue = round(gross_gmv * 0.065, 2)
            organizer_payable = round(gross_gmv - platform_revenue, 2)
            pending_payouts = round(organizer_payable * 0.22, 2) if organizer_payable > 0 else 0.0

            return {
                "period": period,
                "total_events": total_events,
                "live_events": live_events,
                "upcoming_events": upcoming_events,
                "completed_events": completed_events,
                "pending_events": pending_events,
                "approved_events": approved_events,
                "rejected_events": 0,
                "suspended_events": 0,

                "total_users": total_users,
                "total_attendees": total_attendees,
                "total_organizers": total_organizers,
                "total_exhibitors": total_exhibitors,

                "gross_gmv": gross_gmv,
                "platform_revenue": platform_revenue,
                "organizer_payable": organizer_payable,
                "pending_payouts": pending_payouts
            }
        except Exception as err:
            print("[AdminService.get_dashboard_stats] Error:", err)
            return {
                "period": period,
                "total_events": 0,
                "live_events": 0,
                "upcoming_events": 0,
                "completed_events": 0,
                "pending_events": 0,
                "approved_events": 0,
                "rejected_events": 0,
                "suspended_events": 0,
                "total_users": 0,
                "total_attendees": 0,
                "total_organizers": 0,
                "total_exhibitors": 0,
                "gross_gmv": 0.0,
                "platform_revenue": 0.0,
                "organizer_payable": 0.0,
                "pending_payouts": 0.0
            }

    @staticmethod
    def get_events(host_url: str = "", organizer_id: str = None) -> list[dict]:
        from app.extensions.database import SessionLocal
        session = SessionLocal()
        try:
            stmt = select(EventDetails).order_by(desc(EventDetails.id))
            events = session.scalars(stmt).all()

            if organizer_id and str(organizer_id).isdigit():
                org_num = int(organizer_id)
                filtered = [
                    e for e in events 
                    if getattr(e, "user_id", None) == org_num 
                    or str(getattr(e, "user_id", "")) == str(organizer_id)
                    or str(getattr(e, "organizer_id", "")) == str(organizer_id)
                    or getattr(e, "user_id", None) is None
                    or getattr(e, "user_id", None) == 1
                ]
                if filtered:
                    events = filtered

            if not events:
                return []

            event_ids = [e.id for e in events]
            
            # Batch fetch bookings and banner files in 2 fast queries
            bookings = session.scalars(select(EventBookingDetails).where(EventBookingDetails.event_id.in_(event_ids))).all()
            booking_map = {b.event_id: b for b in bookings}

            banners = session.scalars(select(EventFile).where(EventFile.event_id.in_(event_ids), EventFile.file_type == "banner")).all()
            banner_map = {b.event_id: b.file_path for b in banners}

            from app.models.stall import EventStall
            stalls = session.scalars(select(EventStall).where(EventStall.event_id.in_(event_ids))).all()
            stall_map = {}
            for s in stalls:
                stall_map[s.event_id] = stall_map.get(s.event_id, 0) + (s.quantity or 1)
                
            from app.models.exhibitor import ExhibitorStallBooking
            bookings_list = session.scalars(select(ExhibitorStallBooking).where(ExhibitorStallBooking.event_id.in_(event_ids))).all()
            stalls_booked_map = {}
            for b in bookings_list:
                status = str(b.status or "").lower()
                if status in ["approved", "confirmed", "paid"]:
                    stalls_booked_map[b.event_id] = stalls_booked_map.get(b.event_id, 0) + 1

            events_list = []
            for event in events:
                booking = booking_map.get(event.id)
                b_url = banner_map.get(event.id, "")

                price_val = float(getattr(booking, "price_inr", 0) or getattr(booking, "price", 0) or getattr(event, "pass_fee", 0) or 0)
                capacity_val = int(getattr(booking, "capacity", 500) or getattr(event, "total_capacity", 500) or 500)
                passes_sold_val = int(getattr(event, "passes_sold", 0) or getattr(booking, "passes_sold", 0) or 0)
                gate_scans_val = int(getattr(event, "gate_scans", 0) or getattr(event, "arrived", 0) or 0)

                events_list.append({
                    "id": event.id,
                    "event_code": getattr(event, "event_code", None) or f"EVT-{event.id}",
                    "code": getattr(event, "event_code", None) or f"EVT-{event.id}",
                    "slug": getattr(event, "slug", "") or "",
                    "event_name": event.event_name or "Untitled Event",
                    "name": event.event_name or "Untitled Event",
                    "status": event.status or "Active",
                    "category": event.category or "General",
                    "sub_category": getattr(event, "sub_category", "") or "",
                    "start_date": str(event.start_date) if getattr(event, "start_date", None) else None,
                    "date": str(event.start_date) if getattr(event, "start_date", None) else None,
                    "start_time": str(event.start_time) if getattr(event, "start_time", None) else None,
                    "end_date": str(event.end_date) if getattr(event, "end_date", None) else None,
                    "end_time": str(event.end_time) if getattr(event, "end_time", None) else None,
                    "venue": event.venue or "Venue Setup",
                    "address": event.address or "",
                    "created_by": getattr(event, "created_by", None),
                    "user_id": getattr(event, "user_id", None),
                    "price": price_val,
                    "price_inr": price_val,
                    "passesSold": passes_sold_val,
                    "gateScans": gate_scans_val,
                    "totalCapacity": capacity_val,
                    "capacity": capacity_val,
                    "total_stalls": stall_map.get(event.id, 0),
                    "stalls_booked": stalls_booked_map.get(event.id, 0),
                    "charge_type": (getattr(booking, "charge_type", None) if booking else None) or "Free",
                    "pass_fee": price_val,
                    "banner_url": b_url,
                    "banner": b_url,
                    "image": b_url,
                    "banner_preview": b_url
                })
            return events_list
        except Exception as e:
            print("Failed to load events from DB:", e)
            return []
        finally:
            try:
                session.close()
            except Exception:
                pass

    @staticmethod
    def update_event_status(event_id: int, raw_data: dict) -> dict:
        data = UpdateEventStatusSchema(**raw_data)
        if data.status not in ["APPROVED", "REJECTED", "PENDING"]:
            raise ApiError("Invalid status value", 400)

        event = AdminRepository.update_event_status(event_id, data.status)
        if not event:
            raise ApiError("Event not found", 404)

        return {"message": f"Event status updated to {data.status}"}

    @staticmethod
    def get_categories() -> list[dict]:
        cats = AdminRepository.get_all_categories()
        return [c.to_dict() if hasattr(c, "to_dict") else {"id": c.id, "name": c.name, "subcategories": c.subcategories} for c in cats]

    @staticmethod
    def create_category(raw_data: dict) -> dict:
        data = CategorySchema(**raw_data)
        subcategories = data.subcategories
        if isinstance(subcategories, list):
            subcategories = ", ".join(subcategories)

        cat = AdminRepository.create_or_update_category(
            name=data.name,
            subcategories=subcategories,
            icon_name=data.icon_name,
            category_image=getattr(data, "category_image", "") or "",
            status=data.status
        )
        return cat.to_dict() if hasattr(cat, "to_dict") else {"id": cat.id, "name": cat.name, "subcategories": cat.subcategories}

    @staticmethod
    def update_category(cat_id: int, raw_data: dict) -> dict:
        cat = AdminRepository.update_category_by_id(cat_id, raw_data)
        if not cat:
            raise ApiError("Category not found", 404)
        return cat.to_dict()

    @staticmethod
    def delete_category(cat_id: int) -> dict:
        success = AdminRepository.delete_category_by_id(cat_id)
        if not success:
            raise ApiError("Category not found", 404)
        return {"success": True, "message": "Category deleted successfully"}

    @staticmethod
    def get_pending_organizers() -> list[dict]:
        users = AdminRepository.get_pending_organizers()
        organizers_list = []
        for u in users:
            organizers_list.append({
                "id": str(u.id),
                "name": u.name,
                "email": u.email,
                "mobile": getattr(u, "mobile", ""),
                "company_name": getattr(u, "company_name", "DIY Event Corp"),
                "gst_pan": getattr(u, "gst_pan", "33ABCDE1234F1Z5"),
                "bank_account": getattr(u, "bank_account", "XXXX-XXXX-9876"),
                "ifsc": getattr(u, "ifsc", "HDFC0001234"),
                "kyc_status": getattr(u, "kyc_status", "VERIFIED"),
            })
        return organizers_list

    @staticmethod
    def update_organizer_kyc_status(user_id: int, raw_data: dict) -> dict:
        data = UpdateKycStatusSchema(**raw_data)
        user = AdminRepository.update_organizer_kyc_status(user_id, data.status)
        if not user:
            raise ApiError("User not found", 404)
        return {"message": f"Organizer KYC status updated to {data.status}"}

    @staticmethod
    def get_all_users() -> list[dict]:
        stmt = select(User).order_by(desc(User.id))
        users = db.session.scalars(stmt).all()
        user_list = []
        for u in users:
            user_list.append({
                "id": str(u.id),
                "name": u.name or "Unnamed User",
                "email": u.email,
                "role": getattr(u, "role", "user") or "user",
                "mobile": getattr(u, "mobile", "") or "N/A",
                "company_name": getattr(u, "company_name", "N/A") or "N/A",
                "gst_pan": getattr(u, "gst_pan", "N/A") or "N/A",
                "bank_account": getattr(u, "bank_account", "N/A") or "N/A",
                "ifsc": getattr(u, "ifsc", "N/A") or "N/A",
                "kyc_status": getattr(u, "kyc_status", "VERIFIED") or "VERIFIED",
                "created_at": str(getattr(u, "created_at", "")) if getattr(u, "created_at", None) else None
            })
        return user_list

    @staticmethod
    def get_category_requests() -> list[dict]:
        from app.models.category_request import CategoryRequest
        requests = db.session.scalars(select(CategoryRequest).order_by(desc(CategoryRequest.id))).all()
        return [r.to_dict() for r in requests]

    @staticmethod
    def submit_category_request(raw_data: dict) -> dict:
        from app.models.category_request import CategoryRequest
        cat_req = CategoryRequest(
            organizer_id=raw_data.get("organizer_id"),
            organizer_name=raw_data.get("organizer_name", "Organizer"),
            category_name=raw_data.get("category_name", ""),
            subcategory_name=raw_data.get("subcategory_name", ""),
            reason=raw_data.get("reason", ""),
            status="Pending"
        )
        db.session.add(cat_req)
        db.session.commit()
        return cat_req.to_dict()

    @staticmethod
    def update_category_request_status(request_id: int, raw_data: dict) -> dict:
        from app.models.category_request import CategoryRequest
        cat_req = db.session.get(CategoryRequest, request_id)
        if not cat_req:
            raise ApiError("Category request not found", 404)
        status = raw_data.get("status", "Approved")
        cat_req.status = status
        db.session.commit()
        return cat_req.to_dict()
