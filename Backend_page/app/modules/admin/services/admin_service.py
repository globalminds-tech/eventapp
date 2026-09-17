import os
from datetime import datetime
from app.exceptions.api_error import ApiError
from app.modules.admin.repository.admin_repository import AdminRepository
from app.modules.admin.schemas.admin_schema import (
    UpdateEventStatusSchema, CategorySchema, UpdateKycStatusSchema
)
from app.extensions.redis import redis_cache

from sqlalchemy import select, desc
from app.extensions.database import db
from app.models.event import EventDetails, EventBookingDetails, EventFile
from app.models.user import User
from app.models.organizer_profile import OrganizerProfile
from app.models.exhibitor_profile import ExhibitorProfile

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

                if st in ["PENDING", "SUBMITTED"]:
                    pending_events += 1
                elif e_date and e_date < today:
                    completed_events += 1
                elif s_date and s_date > today:
                    upcoming_events += 1
                else:
                    live_events += 1
                    approved_events += 1

            admin_roles = {"superuser", "superadmin", "admin"}
            platform_users = [
                u for u in users
                if getattr(u, "deleted_at", None) is None
                and not any(str(r).lower() in admin_roles for r in (u.roles or []))
                and str(getattr(u, "active_role", "") or "").lower() not in admin_roles
                and str(getattr(u, "email", "") or "").lower() != "bookmyevent2026@gmail.com"
            ]

            total_users = len(platform_users)
            total_organizers = sum(1 for u in platform_users if "organizer" in [str(r).lower() for r in (u.roles or [])])
            total_exhibitors = sum(1 for u in platform_users if "exhibitor" in [str(r).lower() for r in (u.roles or [])])
            total_attendees = sum(1 for u in platform_users if "organizer" not in [str(r).lower() for r in (u.roles or [])] and "exhibitor" not in [str(r).lower() for r in (u.roles or [])])

            gross_gmv = 0.0
            for e in events:
                b = next((bk for bk in bookings if bk.event_id == e.id), None)
                price = float(getattr(b, "price_inr", 0) or getattr(b, "price", 0) or getattr(e, "pass_fee", 0) or 0)
                sold = int(getattr(e, "passes_sold", 0) or getattr(b, "passes_sold", 0) or 0)
                gross_gmv += (price * sold)

            platform_revenue = round(gross_gmv * 0.065, 2)
            organizer_payable = round(gross_gmv - platform_revenue, 2)
            pending_payouts = 0.0  # Reset to 0 until actual payout tracking is implemented

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
    def get_events(
        host_url: str = "",
        organizer_id: str = None,
        only_approved: bool = False,
        search: str = None,
        status: str = None,
        page: int = None,
        limit: int = None,
        sort_by: str = "created_at",
        sort_order: str = "desc"
    ):
        from app.extensions.database import SessionLocal
        from app.common.pagination import build_pagination_metadata
        from sqlalchemy import or_, func, desc, asc
        import uuid
        session = SessionLocal()
        try:
            stmt = select(EventDetails).where(EventDetails.deleted_at.is_(None))
            if not organizer_id:
                stmt = stmt.where(func.upper(EventDetails.status) != "DRAFT")

            if only_approved:
                stmt = stmt.where(func.upper(EventDetails.status).in_(["APPROVED", "ACTIVE", "SUSPENDED"]))
                stmt = stmt.where(func.coalesce(EventDetails.end_date, EventDetails.start_date) >= func.current_date())

            if status and status.strip().upper() != "ALL":
                st = status.strip().upper()
                if st == "ACTIVE":
                    # Lifecycle-aware: event is currently running (start <= today <= end) and not draft/rejected
                    stmt = stmt.where(func.upper(EventDetails.status).notin_(["DRAFT", "REJECTED"]))
                    stmt = stmt.where(func.coalesce(EventDetails.start_date, func.current_date()) <= func.current_date())
                    stmt = stmt.where(func.coalesce(EventDetails.end_date, EventDetails.start_date, func.current_date()) >= func.current_date())
                elif st == "UPCOMING":
                    # Lifecycle-aware: event starts in the future and not draft/rejected
                    stmt = stmt.where(func.upper(EventDetails.status).notin_(["DRAFT", "REJECTED"]))
                    stmt = stmt.where(EventDetails.start_date > func.current_date())
                elif st == "PAST":
                    # Lifecycle-aware: event end date is in the past
                    stmt = stmt.where(func.upper(EventDetails.status).notin_(["DRAFT"]))
                    stmt = stmt.where(func.coalesce(EventDetails.end_date, EventDetails.start_date) < func.current_date())
                elif st == "DRAFT":
                    stmt = stmt.where(func.upper(EventDetails.status) == "DRAFT")
                elif st == "LIVE":
                    stmt = stmt.where(func.upper(EventDetails.status).in_(["LIVE", "ACTIVE"]))
                elif st == "COMPLETED":
                    stmt = stmt.where(func.upper(EventDetails.status).in_(["COMPLETED", "PAST"]))
                elif st == "PENDING":
                    stmt = stmt.where(func.upper(EventDetails.status).in_(["PENDING", "PENDING APPROVAL", "SUBMITTED"]))
                elif st == "APPROVED":
                    stmt = stmt.where(func.upper(EventDetails.status).in_(["APPROVED", "ACTIVE", "LIVE", "PUBLISHED"]))
                elif st == "REJECTED":
                    stmt = stmt.where(func.upper(EventDetails.status) == "REJECTED")
                elif st == "SUSPENDED":
                    stmt = stmt.where(func.upper(EventDetails.status) == "SUSPENDED")
                else:
                    stmt = stmt.where(func.upper(EventDetails.status) == st)

            if search and search.strip():
                clean_term = f"%{search.strip().lower()[:100]}%"
                stmt = stmt.where(or_(
                    func.lower(func.coalesce(EventDetails.event_name, "")).like(clean_term),
                    func.lower(func.coalesce(EventDetails.event_code, "")).like(clean_term),
                    func.lower(func.coalesce(EventDetails.category, "")).like(clean_term),
                    func.lower(func.coalesce(EventDetails.sub_category, "")).like(clean_term),
                    func.lower(func.coalesce(EventDetails.venue, "")).like(clean_term),
                    func.lower(func.coalesce(EventDetails.address, "")).like(clean_term)
                ))

            if organizer_id:
                org_str = str(organizer_id).strip()
                org_uuid = None
                try:
                    org_uuid = uuid.UUID(org_str)
                except (ValueError, AttributeError):
                    pass

                filter_conds = [
                    EventDetails.created_by == org_str
                ]
                if org_uuid:
                    filter_conds.append(EventDetails.user_id == org_uuid)
                    filter_conds.append(EventDetails.organization_id == org_uuid)

                stmt = stmt.where(or_(*filter_conds))

            # Deterministic sorting
            sort_field = EventDetails.created_at
            if sort_by == "event_name" or sort_by == "name":
                sort_field = EventDetails.event_name
            elif sort_by == "start_date" or sort_by == "date":
                sort_field = EventDetails.start_date

            if sort_order == "asc":
                stmt = stmt.order_by(asc(sort_field), desc(EventDetails.id))
            else:
                stmt = stmt.order_by(desc(sort_field), desc(EventDetails.id))

            # Count query for pagination metadata
            pagination_info = None
            if page is not None or limit is not None:
                safe_page = max(1, int(page or 1))
                safe_limit = min(max(1, int(limit or 20)), 100)

                count_stmt = select(func.count(EventDetails.id)).where(EventDetails.deleted_at.is_(None))
                if not organizer_id:
                    count_stmt = count_stmt.where(func.upper(EventDetails.status) != "DRAFT")
                if only_approved:
                    count_stmt = count_stmt.where(func.upper(EventDetails.status).in_(["APPROVED", "ACTIVE", "SUSPENDED"]))
                    count_stmt = count_stmt.where(func.coalesce(EventDetails.end_date, EventDetails.start_date) >= func.current_date())
                if status and status.strip().upper() != "ALL":
                    st = status.strip().upper()
                    if st == "ACTIVE":
                        count_stmt = count_stmt.where(func.upper(EventDetails.status).notin_(["DRAFT", "REJECTED"]))
                        count_stmt = count_stmt.where(func.coalesce(EventDetails.start_date, func.current_date()) <= func.current_date())
                        count_stmt = count_stmt.where(func.coalesce(EventDetails.end_date, EventDetails.start_date, func.current_date()) >= func.current_date())
                    elif st == "UPCOMING":
                        count_stmt = count_stmt.where(func.upper(EventDetails.status).notin_(["DRAFT", "REJECTED"]))
                        count_stmt = count_stmt.where(EventDetails.start_date > func.current_date())
                    elif st == "PAST":
                        count_stmt = count_stmt.where(func.upper(EventDetails.status).notin_(["DRAFT"]))
                        count_stmt = count_stmt.where(func.coalesce(EventDetails.end_date, EventDetails.start_date) < func.current_date())
                    elif st == "DRAFT":
                        count_stmt = count_stmt.where(func.upper(EventDetails.status) == "DRAFT")
                    elif st == "LIVE":
                        count_stmt = count_stmt.where(func.upper(EventDetails.status).in_(["LIVE", "ACTIVE"]))
                    elif st == "COMPLETED":
                        count_stmt = count_stmt.where(func.upper(EventDetails.status).in_(["COMPLETED", "PAST"]))
                    elif st == "PENDING":
                        count_stmt = count_stmt.where(func.upper(EventDetails.status).in_(["PENDING", "PENDING APPROVAL", "SUBMITTED"]))
                    elif st == "APPROVED":
                        count_stmt = count_stmt.where(func.upper(EventDetails.status).in_(["APPROVED", "ACTIVE", "LIVE", "PUBLISHED"]))
                    elif st == "REJECTED":
                        count_stmt = count_stmt.where(func.upper(EventDetails.status) == "REJECTED")
                    elif st == "SUSPENDED":
                        count_stmt = count_stmt.where(func.upper(EventDetails.status) == "SUSPENDED")
                    else:
                        count_stmt = count_stmt.where(func.upper(EventDetails.status) == st)
                if search and search.strip():
                    clean_term = f"%{search.strip().lower()[:100]}%"
                    count_stmt = count_stmt.where(or_(
                        func.lower(func.coalesce(EventDetails.event_name, "")).like(clean_term),
                        func.lower(func.coalesce(EventDetails.event_code, "")).like(clean_term),
                        func.lower(func.coalesce(EventDetails.category, "")).like(clean_term),
                        func.lower(func.coalesce(EventDetails.sub_category, "")).like(clean_term),
                        func.lower(func.coalesce(EventDetails.venue, "")).like(clean_term),
                        func.lower(func.coalesce(EventDetails.address, "")).like(clean_term)
                    ))
                if organizer_id:
                    count_stmt = count_stmt.where(or_(*filter_conds))

                total_records = session.scalar(count_stmt) or 0
                offset = (safe_page - 1) * safe_limit
                stmt = stmt.offset(offset).limit(safe_limit)
                pagination_info = build_pagination_metadata(total=total_records, page=safe_page, limit=safe_limit)

            events = session.scalars(stmt).all()

            if not events:
                if pagination_info is not None:
                    return {
                        "events": [],
                        "pagination": pagination_info
                    }
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
                status_b = str(b.status or "").lower()
                if status_b in ["approved", "confirmed", "paid"]:
                    stalls_booked_map[b.event_id] = stalls_booked_map.get(b.event_id, 0) + 1

            from app.models.booking import UserBookingDetails
            user_bookings = session.scalars(select(UserBookingDetails).where(
                UserBookingDetails.event_id.in_(event_ids),
                UserBookingDetails.deleted_at.is_(None)
            )).all()
            user_booking_map = {}
            gate_scans_map = {}
            for ub in user_bookings:
                user_booking_map[ub.event_id] = user_booking_map.get(ub.event_id, 0) + 1
                if ub.is_scanned or ub.is_checked_in:
                    gate_scans_map[ub.event_id] = gate_scans_map.get(ub.event_id, 0) + 1

            user_ids = [e.user_id for e in events if e.user_id]
            from app.models.organizer_profile import OrganizerProfile
            org_profiles = session.scalars(select(OrganizerProfile).where(OrganizerProfile.user_id.in_(user_ids))).all() if user_ids else []
            org_map = {op.user_id: op for op in org_profiles}

            events_list = []
            for event in events:
                booking = booking_map.get(event.id)
                b_url = banner_map.get(event.id, "")
                org_p = org_map.get(event.user_id)

                price_val = float(getattr(booking, "price_inr", 0) or getattr(booking, "price", 0) or getattr(event, "pass_fee", 0) or 0)
                capacity_val = int(getattr(booking, "capacity", 500) or getattr(event, "total_capacity", 500) or 500)
                passes_sold_val = user_booking_map.get(event.id, 0) or int(getattr(event, "passes_sold", 0) or getattr(booking, "passes_sold", 0) or 0)
                gate_scans_val = gate_scans_map.get(event.id, 0) or int(getattr(event, "gate_scans", 0) or getattr(event, "arrived", 0) or 0)

                events_list.append({
                    "id": str(event.id),
                    "event_code": getattr(event, "event_code", None) or f"EVT-{str(event.id)[:8]}",
                    "code": getattr(event, "event_code", None) or f"EVT-{str(event.id)[:8]}",
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
                    "user_id": str(getattr(event, "user_id", "")) if getattr(event, "user_id", None) else None,
                    "organizer_kyc_status": (org_p.kyc_status if org_p else "PENDING") or "PENDING",
                    "organizer_company": (org_p.company_name if org_p else None) or "Event Organizer",
                    "price": price_val,
                    "price_inr": price_val,
                    "passesSold": passes_sold_val,
                    "passes_sold": passes_sold_val,
                    "gateScans": gate_scans_val,
                    "gate_scans": gate_scans_val,
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

            if pagination_info is not None:
                return {
                    "events": events_list,
                    "pagination": pagination_info
                }
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
    def update_event_status(event_id, raw_data: dict) -> dict:
        data = UpdateEventStatusSchema(**raw_data)
        status_upper = data.status.strip().upper()
        if status_upper not in ["APPROVED", "REJECTED", "PENDING", "ACTIVE", "DRAFT", "SUSPENDED"]:
            raise ApiError("Invalid status value", 400)

        if status_upper in ["APPROVED", "ACTIVE"]:
            import uuid
            from app.models.event import EventDetails
            from app.models.organizer_profile import OrganizerProfile

            target_evt = None
            try:
                eid = uuid.UUID(str(event_id))
                target_evt = db.session.get(EventDetails, eid)
            except Exception:
                target_evt = db.session.scalars(select(EventDetails).where(
                    (EventDetails.event_code == str(event_id)) | (EventDetails.slug == str(event_id))
                )).first()

            if target_evt and target_evt.user_id:
                org_p = db.session.scalar(select(OrganizerProfile).where(OrganizerProfile.user_id == target_evt.user_id))
                if not org_p or (org_p.kyc_status or "").strip().upper() != "VERIFIED":
                    raise ApiError(
                        "Cannot approve event: The organizer's business KYC is pending verification. "
                        "Please verify the organizer's KYC under the KYC Verification tab before publishing this event.",
                        400
                    )

        event = AdminRepository.update_event_status(event_id, status_upper)
        if not event:
            raise ApiError("Event not found", 404)

        redis_cache.clear_pattern("events:*")
        return {"message": f"Event status updated to {status_upper}", "status": status_upper}

    @staticmethod
    def get_categories() -> list[dict]:
        cats = AdminRepository.get_all_categories()
        return [c.to_dict() if hasattr(c, "to_dict") else {"id": str(c.id), "name": c.name, "subcategories": c.subcategories} for c in cats]

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
        return cat.to_dict() if hasattr(cat, "to_dict") else {"id": str(cat.id), "name": cat.name, "subcategories": cat.subcategories}

    @staticmethod
    def update_category(cat_id, raw_data: dict) -> dict:
        cat = AdminRepository.update_category_by_id(cat_id, raw_data)
        if not cat:
            raise ApiError("Category not found", 404)
        return cat.to_dict()

    @staticmethod
    def delete_category(cat_id) -> dict:
        success = AdminRepository.delete_category_by_id(cat_id)
        if not success:
            raise ApiError("Category not found", 404)
        return {"success": True, "message": "Category deleted successfully"}

    @staticmethod
    def get_pending_organizers() -> list[dict]:
        users = AdminRepository.get_pending_organizers()
        organizers_list = []
        for u in users:
            org_p = db.session.scalars(select(OrganizerProfile).where(OrganizerProfile.user_id == u.id)).first()
            organizers_list.append({
                "id": str(u.id),
                "name": u.name,
                "email": u.email,
                "mobile": getattr(u, "mobile", "") or "N/A",
                "company_name": (org_p.company_name if org_p else None) or getattr(u, "organization_name", None) or getattr(u, "company_name", None) or "DIY Event Corp",
                "gst_pan": (f"{org_p.gstin or ''} / {org_p.pan_number or ''}".strip(" /") if org_p else None) or getattr(u, "gst_pan", "33ABCDE1234F1Z5"),
                "bank_account": (org_p.account_number if org_p else None) or getattr(u, "bank_account", "XXXX-XXXX-9876"),
                "ifsc": (org_p.ifsc_code if org_p else None) or getattr(u, "ifsc", "HDFC0001234"),
                "kyc_status": (org_p.kyc_status if org_p else None) or getattr(u, "kyc_status", "VERIFIED") or "VERIFIED",
            })
        return organizers_list

    @staticmethod
    def update_organizer_kyc_status(user_id, raw_data: dict) -> dict:
        data = UpdateKycStatusSchema(**raw_data)
        target_status = data.status.strip().upper()
        target_role = (data.role or raw_data.get("role") or "").strip().lower()

        user = AdminRepository.update_organizer_kyc_status(user_id, target_status)
        if not user:
            raise ApiError("User not found", 404)
        
        user_roles = [str(r).lower() for r in (user.roles or [])]
        org_p = db.session.scalars(select(OrganizerProfile).where(OrganizerProfile.user_id == user.id)).first()
        exh_p = db.session.scalars(select(ExhibitorProfile).where(ExhibitorProfile.user_id == user.id)).first()

        if target_role == "organizer":
            if org_p:
                org_p.kyc_status = target_status
            elif "organizer" in user_roles or user.active_role == "organizer":
                org_p = OrganizerProfile(
                    user_id=user.id,
                    company_name=user.organization_name or f"{user.name or 'Organizer'} Productions",
                    kyc_status=target_status
                )
                db.session.add(org_p)
        elif target_role == "exhibitor":
            if exh_p:
                exh_p.kyc_status = target_status
            elif "exhibitor" in user_roles or user.active_role == "exhibitor":
                exh_p = ExhibitorProfile(
                    user_id=user.id,
                    company_name=user.organization_name or f"{user.name or 'Exhibitor'} Stalls",
                    kyc_status=target_status
                )
                db.session.add(exh_p)
        else:
            # "both" or unspecified - update both
            if org_p:
                org_p.kyc_status = target_status
            elif "organizer" in user_roles or user.active_role == "organizer":
                org_p = OrganizerProfile(
                    user_id=user.id,
                    company_name=user.organization_name or f"{user.name or 'Organizer'} Productions",
                    kyc_status=target_status
                )
                db.session.add(org_p)

            if exh_p:
                exh_p.kyc_status = target_status
            elif "exhibitor" in user_roles or user.active_role == "exhibitor":
                exh_p = ExhibitorProfile(
                    user_id=user.id,
                    company_name=user.organization_name or f"{user.name or 'Exhibitor'} Stalls",
                    kyc_status=target_status
                )
                db.session.add(exh_p)

        # Recalculate combined user.kyc_status
        org_status = (org_p.kyc_status if org_p else None)
        exh_status = (exh_p.kyc_status if exh_p else None)
        relevant_statuses = [s for s in [org_status, exh_status] if s]

        if relevant_statuses:
            if all(s.upper() == "VERIFIED" for s in relevant_statuses):
                user.kyc_status = "VERIFIED"
            elif any(s.upper() == "REJECTED" for s in relevant_statuses):
                user.kyc_status = "REJECTED"
            else:
                user.kyc_status = "PENDING"
        else:
            user.kyc_status = target_status

        db.session.commit()
        return {
            "message": f"KYC status updated to {target_status}" + (f" for {target_role}" if target_role else ""),
            "user_kyc_status": user.kyc_status,
            "organizer_kyc": org_p.kyc_status if org_p else None,
            "exhibitor_kyc": exh_p.kyc_status if exh_p else None
        }

    @staticmethod
    def get_all_users(
        search: str = None,
        role: str = None,
        kyc_status: str = None,
        page: int = None,
        limit: int = None,
        sort_by: str = "created_at",
        sort_order: str = "desc"
    ):
        from app.models.organizer_profile import OrganizerProfile
        from app.models.exhibitor_profile import ExhibitorProfile
        from app.common.pagination import build_pagination_metadata
        from sqlalchemy import or_, func, desc, asc, String

        stmt = select(User).where(
            User.deleted_at.is_(None),
            func.lower(User.email) != "bookmyevent2026@gmail.com",
            ~func.lower(func.coalesce(User.active_role, "")).in_(["superuser", "superadmin", "admin"])
        )

        if search and search.strip():
            clean_term = f"%{search.strip().lower()[:100]}%"
            stmt = stmt.where(or_(
                func.lower(func.coalesce(User.name, "")).like(clean_term),
                func.lower(func.coalesce(User.email, "")).like(clean_term),
                func.lower(func.coalesce(User.mobile, "")).like(clean_term),
                func.lower(func.coalesce(User.organization_name, "")).like(clean_term)
            ))

        if role and role.strip().lower() != "all":
            r = role.strip().lower()
            if r in ["user", "attendee", "attendees"]:
                stmt = stmt.where(
                    ~func.lower(func.cast(User.roles, String)).like("%organizer%"),
                    ~func.lower(func.cast(User.roles, String)).like("%exhibitor%"),
                    ~func.lower(func.coalesce(User.active_role, "")).in_(["organizer", "exhibitor"])
                )
            else:
                stmt = stmt.where(or_(
                    func.lower(func.cast(User.roles, String)).like(f"%{r}%"),
                    func.lower(func.coalesce(User.active_role, "")).like(f"%{r}%")
                ))

        if kyc_status and kyc_status.strip().lower() != "all":
            k_val = kyc_status.strip().upper()
            stmt = stmt.outerjoin(OrganizerProfile, OrganizerProfile.user_id == User.id)\
                       .outerjoin(ExhibitorProfile, ExhibitorProfile.user_id == User.id)
            if k_val == "PENDING":
                stmt = stmt.where(
                    or_(
                        func.lower(func.cast(User.roles, String)).like("%organizer%"),
                        func.lower(func.cast(User.roles, String)).like("%exhibitor%"),
                        func.lower(func.coalesce(User.active_role, "")).in_(["organizer", "exhibitor"])
                    ),
                    or_(
                        func.upper(func.coalesce(OrganizerProfile.kyc_status, "PENDING")) == "PENDING",
                        func.upper(func.coalesce(ExhibitorProfile.kyc_status, "PENDING")) == "PENDING"
                    )
                )
            elif k_val == "VERIFIED":
                stmt = stmt.where(or_(
                    func.upper(func.coalesce(OrganizerProfile.kyc_status, "")) == "VERIFIED",
                    func.upper(func.coalesce(ExhibitorProfile.kyc_status, "")) == "VERIFIED"
                ))

        # Deterministic sort
        stmt = stmt.order_by(desc(User.created_at), desc(User.id))

        pagination_info = None
        if page is not None or limit is not None:
            safe_page = max(1, int(page or 1))
            safe_limit = min(max(1, int(limit or 20)), 100)

            count_stmt = select(func.count(User.id)).where(
                User.deleted_at.is_(None),
                func.lower(User.email) != "bookmyevent2026@gmail.com",
                ~func.lower(func.coalesce(User.active_role, "")).in_(["superuser", "superadmin", "admin"])
            )
            if search and search.strip():
                clean_term = f"%{search.strip().lower()[:100]}%"
                count_stmt = count_stmt.where(or_(
                    func.lower(func.coalesce(User.name, "")).like(clean_term),
                    func.lower(func.coalesce(User.email, "")).like(clean_term),
                    func.lower(func.coalesce(User.mobile, "")).like(clean_term),
                    func.lower(func.coalesce(User.organization_name, "")).like(clean_term)
                ))
            if role and role.strip().lower() != "all":
                r = role.strip().lower()
                if r in ["user", "attendee", "attendees"]:
                    count_stmt = count_stmt.where(
                        ~func.lower(func.cast(User.roles, String)).like("%organizer%"),
                        ~func.lower(func.cast(User.roles, String)).like("%exhibitor%"),
                        ~func.lower(func.coalesce(User.active_role, "")).in_(["organizer", "exhibitor"])
                    )
                else:
                    count_stmt = count_stmt.where(or_(
                        func.lower(func.cast(User.roles, String)).like(f"%{r}%"),
                        func.lower(func.coalesce(User.active_role, "")).like(f"%{r}%")
                    ))
            if kyc_status and kyc_status.strip().lower() != "all":
                k_val = kyc_status.strip().upper()
                count_stmt = count_stmt.outerjoin(OrganizerProfile, OrganizerProfile.user_id == User.id)\
                                       .outerjoin(ExhibitorProfile, ExhibitorProfile.user_id == User.id)
                if k_val == "PENDING":
                    count_stmt = count_stmt.where(
                        or_(
                            func.lower(func.cast(User.roles, String)).like("%organizer%"),
                            func.lower(func.cast(User.roles, String)).like("%exhibitor%"),
                            func.lower(func.coalesce(User.active_role, "")).in_(["organizer", "exhibitor"])
                        ),
                        or_(
                            func.upper(func.coalesce(OrganizerProfile.kyc_status, "PENDING")) == "PENDING",
                            func.upper(func.coalesce(ExhibitorProfile.kyc_status, "PENDING")) == "PENDING"
                        )
                    )
                elif k_val == "VERIFIED":
                    count_stmt = count_stmt.where(or_(
                        func.upper(func.coalesce(OrganizerProfile.kyc_status, "")) == k_val,
                        func.upper(func.coalesce(ExhibitorProfile.kyc_status, "")) == k_val
                    ))

            total_users = db.session.scalar(count_stmt) or 0
            offset = (safe_page - 1) * safe_limit
            stmt = stmt.offset(offset).limit(safe_limit)
            pagination_info = build_pagination_metadata(total=total_users, page=safe_page, limit=safe_limit)

        users = db.session.scalars(stmt).all()
        user_list = []
        for u in users:
            org_p = db.session.scalars(select(OrganizerProfile).where(OrganizerProfile.user_id == u.id)).first()
            exh_p = db.session.scalars(select(ExhibitorProfile).where(ExhibitorProfile.user_id == u.id)).first()

            roles_list = list(u.roles) if u.roles else [getattr(u, "role", "user") or "user"]
            roles_lower = [str(r).lower() for r in roles_list]
            is_organizer = "organizer" in roles_lower or (u.active_role or "").lower() == "organizer"
            is_exhibitor = "exhibitor" in roles_lower or (u.active_role or "").lower() == "exhibitor"
            is_common_user = not is_organizer and not is_exhibitor

            # Auto-create profile if missing for organizer/exhibitor role
            if is_organizer and not org_p:
                try:
                    org_p = OrganizerProfile(
                        user_id=u.id,
                        company_name=u.organization_name or f"{u.name} Events",
                        gstin="33ABCDE1234F1Z5",
                        pan_number="ABCDE1234F",
                        account_number="987654321098",
                        ifsc_code="HDFC0001234",
                        kyc_status="PENDING"
                    )
                    db.session.add(org_p)
                    db.session.commit()
                except Exception:
                    db.session.rollback()

            if is_exhibitor and not exh_p:
                try:
                    exh_p = ExhibitorProfile(
                        user_id=u.id,
                        company_name=u.organization_name or f"{u.name} Expo Ltd",
                        gstin="29ABCDE5678F1Z9",
                        pan_number="ABCDE5678F",
                        account_number="567812349012",
                        ifsc_code="ICIC0002345",
                        kyc_status="PENDING"
                    )
                    db.session.add(exh_p)
                    db.session.commit()
                except Exception:
                    db.session.rollback()

            org_kyc = (org_p.kyc_status or "PENDING") if (is_organizer and org_p) else (org_p.kyc_status if org_p else None)
            exh_kyc = (exh_p.kyc_status or "PENDING") if (is_exhibitor and exh_p) else (exh_p.kyc_status if exh_p else None)

            if is_common_user:
                combined_kyc = "NOT_REQUIRED"
            else:
                active_kycs = [k for k in [org_kyc, exh_kyc] if k is not None]
                if any(str(k).upper() == "PENDING" for k in active_kycs):
                    combined_kyc = "PENDING"
                elif all(str(k).upper() == "VERIFIED" for k in active_kycs):
                    combined_kyc = "VERIFIED"
                elif any(str(k).upper() == "REJECTED" for k in active_kycs):
                    combined_kyc = "REJECTED"
                else:
                    combined_kyc = "PENDING"

            company = (org_p.company_name if org_p else None) or (exh_p.company_name if exh_p else None) or getattr(u, "organization_name", None) or getattr(u, "company_name", None) or ("Individual Account" if is_common_user else "Business Account")
            gst_pan = (f"{org_p.gstin or ''} / {org_p.pan_number or ''}".strip(" /") if (org_p and (org_p.gstin or org_p.pan_number)) else None) or \
                      (f"{exh_p.gstin or ''} / {exh_p.pan_number or ''}".strip(" /") if (exh_p and (exh_p.gstin or exh_p.pan_number)) else None) or \
                      getattr(u, "gst_pan", "N/A")
            bank_acc = (org_p.account_number if org_p else None) or (exh_p.account_number if exh_p else None) or getattr(u, "bank_account", "N/A")
            ifsc = (org_p.ifsc_code if org_p else None) or (exh_p.ifsc_code if exh_p else None) or getattr(u, "ifsc", "N/A")

            user_list.append({
                "id": str(u.id),
                "name": u.name or "Unnamed User",
                "email": u.email,
                "role": u.active_role or (roles_list[0] if roles_list else "user"),
                "roles": roles_list,
                "is_organizer": is_organizer,
                "is_exhibitor": is_exhibitor,
                "is_common_user": is_common_user,
                "organizer_kyc": org_kyc,
                "exhibitor_kyc": exh_kyc,
                "organizer_company": org_p.company_name if org_p else None,
                "exhibitor_company": exh_p.company_name if exh_p else None,
                "mobile": getattr(u, "mobile", "") or "N/A",
                "company_name": company,
                "gst_pan": gst_pan or "N/A",
                "bank_account": bank_acc or "N/A",
                "ifsc": ifsc or "N/A",
                "kyc_status": combined_kyc,
                "created_at": str(getattr(u, "created_at", "")) if getattr(u, "created_at", None) else None
            })

        if pagination_info is not None:
            return {
                "users": user_list,
                "pagination": pagination_info
            }
        return user_list

    @staticmethod
    def get_user_details(user_id: str) -> dict:
        from app.models.user import User
        from app.models.organizer_profile import OrganizerProfile
        from app.models.exhibitor_profile import ExhibitorProfile
        from app.models.event import EventDetails
        from app.models.exhibitor import ExhibitorStallBooking

        u = db.session.get(User, user_id)
        if not u:
            raise ApiError("User not found", 404)

        org_p = db.session.scalars(select(OrganizerProfile).where(OrganizerProfile.user_id == u.id)).first()
        exh_p = db.session.scalars(select(ExhibitorProfile).where(ExhibitorProfile.user_id == u.id)).first()

        roles_list = list(u.roles) if u.roles else [getattr(u, "role", "user") or "user"]
        roles_lower = [str(r).lower() for r in roles_list]
        is_organizer = "organizer" in roles_lower or (u.active_role or "").lower() == "organizer"
        is_exhibitor = "exhibitor" in roles_lower or (u.active_role or "").lower() == "exhibitor"
        is_common_user = not is_organizer and not is_exhibitor

        # Auto-provision profile defaults if user has role but no row yet
        if is_organizer and not org_p:
            try:
                org_p = OrganizerProfile(
                    user_id=u.id,
                    company_name=u.organization_name or f"{u.name} Events",
                    gstin="33ABCDE1234F1Z5",
                    pan_number="ABCDE1234F",
                    account_number="987654321098",
                    ifsc_code="HDFC0001234",
                    kyc_status="PENDING"
                )
                db.session.add(org_p)
                db.session.commit()
            except Exception:
                db.session.rollback()

        if is_exhibitor and not exh_p:
            try:
                exh_p = ExhibitorProfile(
                    user_id=u.id,
                    company_name=u.organization_name or f"{u.name} Expo Ltd",
                    gstin="29ABCDE5678F1Z9",
                    pan_number="ABCDE5678F",
                    account_number="567812349012",
                    ifsc_code="ICIC0002345",
                    kyc_status="PENDING"
                )
                db.session.add(exh_p)
                db.session.commit()
            except Exception:
                db.session.rollback()

        # Fetch events created by this organizer
        user_events = []
        if is_organizer:
            evs = db.session.scalars(
                select(EventDetails).where(
                    EventDetails.user_id == u.id,
                    EventDetails.deleted_at.is_(None)
                ).order_by(desc(EventDetails.created_at))
            ).all()
            for e in evs:
                user_events.append({
                    "id": str(e.id),
                    "event_name": e.event_name or "Untitled Event",
                    "event_code": getattr(e, "event_code", None) or f"EVT-{str(e.id)[:8]}",
                    "category": e.category or "General",
                    "start_date": str(e.start_date) if e.start_date else None,
                    "status": e.status or "Active",
                    "venue": getattr(e, "venue", None) or getattr(e, "address", None) or "Venue Setup"
                })

        # Fetch stall bookings by this exhibitor
        user_stall_bookings = []
        if is_exhibitor:
            stalls = db.session.scalars(
                select(ExhibitorStallBooking).where(
                    ExhibitorStallBooking.user_id == u.id
                ).order_by(desc(ExhibitorStallBooking.created_at))
            ).all()
            for s in stalls:
                user_stall_bookings.append({
                    "id": str(s.id),
                    "event_id": str(s.event_id) if s.event_id else None,
                    "stall_area": getattr(s, "stall_area", ""),
                    "status": getattr(s, "status", "Pending"),
                    "created_at": str(s.created_at) if getattr(s, "created_at", None) else None
                })

        org_kyc = (org_p.kyc_status or "PENDING") if (is_organizer and org_p) else (org_p.kyc_status if org_p else None)
        exh_kyc = (exh_p.kyc_status or "PENDING") if (is_exhibitor and exh_p) else (exh_p.kyc_status if exh_p else None)

        if is_common_user:
            combined_kyc = "NOT_REQUIRED"
        else:
            active_kycs = [k for k in [org_kyc, exh_kyc] if k is not None]
            if any(str(k).upper() == "PENDING" for k in active_kycs):
                combined_kyc = "PENDING"
            elif all(str(k).upper() == "VERIFIED" for k in active_kycs):
                combined_kyc = "VERIFIED"
            elif any(str(k).upper() == "REJECTED" for k in active_kycs):
                combined_kyc = "REJECTED"
            else:
                combined_kyc = "PENDING"

        company = (org_p.company_name if org_p else None) or (exh_p.company_name if exh_p else None) or getattr(u, "organization_name", None) or getattr(u, "company_name", None) or ("Individual Account" if is_common_user else "Business Account")

        return {
            "id": str(u.id),
            "name": u.name or "Unnamed User",
            "email": u.email,
            "mobile": getattr(u, "mobile", "") or "N/A",
            "role": u.active_role or (roles_list[0] if roles_list else "user"),
            "roles": roles_list,
            "is_organizer": is_organizer,
            "is_exhibitor": is_exhibitor,
            "is_common_user": is_common_user,
            "company_name": company,
            "kyc_status": combined_kyc,
            "organizer_kyc": org_kyc,
            "exhibitor_kyc": exh_kyc,
            "organizer_profile": {
                "company_name": org_p.company_name if org_p else getattr(u, "organization_name", None),
                "gstin": org_p.gstin if org_p else None,
                "pan_number": org_p.pan_number if org_p else None,
                "account_number": org_p.account_number if org_p else None,
                "ifsc_code": org_p.ifsc_code if org_p else None,
                "kyc_status": org_kyc,
            } if (org_p or is_organizer) else None,
            "exhibitor_profile": {
                "company_name": exh_p.company_name if exh_p else getattr(u, "organization_name", None),
                "gstin": exh_p.gstin if exh_p else None,
                "pan_number": exh_p.pan_number if exh_p else None,
                "account_number": exh_p.account_number if exh_p else None,
                "ifsc_code": exh_p.ifsc_code if exh_p else None,
                "kyc_status": exh_kyc,
            } if (exh_p or is_exhibitor) else None,
            "events": user_events,
            "stall_bookings": user_stall_bookings,
            "created_at": str(getattr(u, "created_at", "")) if getattr(u, "created_at", None) else None
        }


    @staticmethod
    def get_category_requests() -> list[dict]:
        from app.models.category_request import CategoryRequest
        requests = db.session.scalars(select(CategoryRequest).order_by(desc(CategoryRequest.created_at))).all()
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
    def update_category_request_status(request_id, raw_data: dict) -> dict:
        from app.models.category_request import CategoryRequest
        from app.models.category import CategoryMaster
        cat_req = db.session.get(CategoryRequest, request_id)
        if not cat_req:
            raise ApiError("Category request not found", 404)
        status = raw_data.get("status", "Approved")
        cat_req.status = status

        # On Approval → auto-insert into category_master_table
        if status == "Approved" and cat_req.category_name:
            existing = db.session.scalars(
                select(CategoryMaster).where(CategoryMaster.name == cat_req.category_name)
            ).first()

            if existing:
                # Category exists — append new subcategory if provided and not already present
                if cat_req.subcategory_name:
                    current_subs = [s.strip() for s in (existing.subcategories or "").split(",") if s.strip()]
                    if cat_req.subcategory_name.strip() not in current_subs:
                        current_subs.append(cat_req.subcategory_name.strip())
                        existing.subcategories = ", ".join(current_subs)
            else:
                # Create brand new category
                new_cat = CategoryMaster(
                    name=cat_req.category_name.strip(),
                    subcategories=cat_req.subcategory_name.strip() if cat_req.subcategory_name else "",
                    status="Active"
                )
                db.session.add(new_cat)

        db.session.commit()
        return cat_req.to_dict()

