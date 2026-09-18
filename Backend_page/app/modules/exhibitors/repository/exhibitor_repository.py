from sqlalchemy import select
from app.extensions.database import db
from app.models.exhibitor import ExhibitorStallBooking, ExhibitorLead
from app.models.event import EventDetails

class ExhibitorRepository:
    @staticmethod
    def get_existing_booking(email: str = None, event_id = None, user_id = None, active_only: bool = True):
        from sqlalchemy import or_, func
        import uuid

        conditions = []
        if user_id:
            try:
                from app.modules.rbac.services.tenant_service import TenantService
                tenant_uids = TenantService.resolve_tenant_user_ids(user_id, "EXHIBITOR")
            except Exception:
                tenant_uids = [user_id]

            parsed_uids = []
            for uid in tenant_uids:
                try:
                    parsed_uids.append(uuid.UUID(str(uid)))
                except Exception:
                    parsed_uids.append(uid)
            if parsed_uids:
                conditions.append(ExhibitorStallBooking.user_id.in_(parsed_uids))
        if email:
            conditions.append(func.lower(ExhibitorStallBooking.email) == email.strip().lower())

        if not conditions or not event_id:
            return None

        event_uid = None
        try:
            event_uid = uuid.UUID(str(event_id))
        except Exception:
            event_uid = event_id

        stmt = select(ExhibitorStallBooking).where(
            ExhibitorStallBooking.event_id == event_uid,
            or_(*conditions)
        )

        if active_only:
            # Active applications that block duplicate bookings
            stmt = stmt.where(
                func.lower(ExhibitorStallBooking.status).in_(["pending", "approved", "confirmed", "paid"])
            )

        stmt = stmt.order_by(ExhibitorStallBooking.created_at.desc()).with_for_update()
        return db.session.scalar(stmt)

    @staticmethod
    def create_stall_booking(data_dict: dict) -> ExhibitorStallBooking:
        booking = ExhibitorStallBooking(**data_dict)
        db.session.add(booking)
        db.session.commit()
        return booking

    @staticmethod
    def get_user_bookings(user_id, status: str = None, search: str = None):
        from sqlalchemy import or_, and_, func
        import uuid
        conditions = []
        if user_id:
            try:
                from app.modules.rbac.services.tenant_service import TenantService
                tenant_uids = TenantService.resolve_tenant_user_ids(user_id, "EXHIBITOR")
            except Exception:
                tenant_uids = [user_id]

            parsed_uids = []
            for uid in tenant_uids:
                try:
                    parsed_uids.append(uuid.UUID(str(uid)))
                except Exception:
                    parsed_uids.append(uid)
            if parsed_uids:
                conditions.append(ExhibitorStallBooking.user_id.in_(parsed_uids))

        stmt = select(
            ExhibitorStallBooking,
            EventDetails.event_name,
            EventDetails.status
        ).outerjoin(
            EventDetails, ExhibitorStallBooking.event_id == EventDetails.id
        )
        if conditions:
            stmt = stmt.where(or_(*conditions))

        if status and status.strip() and status.strip().lower() != "all":
            clean_status = status.strip().lower()
            if clean_status == "confirmed":
                stmt = stmt.where(func.lower(ExhibitorStallBooking.status).in_(["confirmed", "paid"]))
            else:
                stmt = stmt.where(func.lower(ExhibitorStallBooking.status) == clean_status)

        if search and search.strip():
            term = f"%{search.strip().lower()}%"
            stmt = stmt.where(
                or_(
                    func.lower(EventDetails.event_name).like(term),
                    func.lower(ExhibitorStallBooking.company_name).like(term),
                    func.lower(ExhibitorStallBooking.stall_area).like(term)
                )
            )

        stmt = stmt.order_by(ExhibitorStallBooking.created_at.desc())
        return db.session.execute(stmt).all()

    @staticmethod
    def get_booking_by_id(booking_id) -> ExhibitorStallBooking | None:
        return db.session.get(ExhibitorStallBooking, booking_id)

    @staticmethod
    def get_stall_pricing(booking: ExhibitorStallBooking) -> dict:
        """
        Dynamically looks up and calculates the exact base rental price, prime surcharge,
        and total price set for the stall from the EventStall configuration in the database.
        Never relies on hardcoded magic values or defaults.
        """
        from app.models.stall import EventStall
        import re

        base_price = 0.0
        prime_price = 0.0
        total_price = 0.0
        stall_size = ""

        # 1. Direct database lookup against EventStall configured by organizer for this event
        if getattr(booking, "event_id", None):
            try:
                stalls = db.session.scalars(
                    select(EventStall).where(
                        EventStall.event_id == booking.event_id,
                        EventStall.deleted_at.is_(None)
                    )
                ).all()

                area_clean = (booking.stall_area or "").strip().lower()
                matched_stall = None
                for s in stalls:
                    s_name = (s.stall_name or "").strip().lower()
                    if s_name and (s_name == area_clean or s_name in area_clean or area_clean in s_name):
                        matched_stall = s
                        break

                if matched_stall:
                    stall_size = matched_stall.stall_size or ""
                    try:
                        base_price = float(matched_stall.price_inr) if matched_stall.price_inr else 0.0
                    except Exception:
                        base_price = 0.0

                    is_prime = False
                    if booking.messages and "[prime location: yes" in booking.messages.lower():
                        is_prime = True
                    elif matched_stall.prime_seat:
                        is_prime = True

                    if is_prime and matched_stall.prime_price_inr:
                        try:
                            prime_price = float(matched_stall.prime_price_inr)
                        except Exception:
                            prime_price = 0.0

                    total_price = base_price + prime_price
            except Exception as e:
                print(f"[get_stall_pricing] Error querying EventStall: {e}")

        # 2. Extract recorded Estimated Cost from booking.messages if total_price is still 0
        if total_price <= 0.0 and getattr(booking, "messages", None):
            m = re.search(r'\[Estimated Cost:\s*[₹Rs\.\?]*\s*([0-9,]+)\]', booking.messages)
            if m:
                try:
                    parsed_cost = float(m.group(1).replace(",", ""))
                    total_price = parsed_cost
                    if base_price <= 0.0:
                        base_price = total_price
                except Exception:
                    pass

        # 3. If price_paid is recorded on the booking record
        if total_price <= 0.0 and getattr(booking, "price_paid", None):
            try:
                total_price = float(booking.price_paid)
                if base_price <= 0.0:
                    base_price = total_price
            except Exception:
                pass

        return {
            "base_price": base_price,
            "prime_price": prime_price,
            "total_price": total_price,
            "stall_size": stall_size,
        }

    @staticmethod
    def serialize_application(b: ExhibitorStallBooking, event_name: str = None, event_status: str = None) -> dict:
        full_name = f"{getattr(b, 'first_name', '') or ''} {getattr(b, 'last_name', '') or ''}".strip()
        contact_name = full_name or getattr(b, "company_name", "") or ""

        # Lookup exact stall pricing configured for this booking
        pricing = ExhibitorRepository.get_stall_pricing(b)
        price = pricing["total_price"]

        return {
            "id": str(b.id),
            "event_id": str(b.event_id) if b.event_id else None,
            "event_name": event_name or getattr(b, "event_name", None) or "",
            "event_status": event_status or "ACTIVE",
            "user_id": str(b.user_id) if b.user_id else None,
            "title": getattr(b, "title", "") or "",
            "first_name": getattr(b, "first_name", "") or "",
            "last_name": getattr(b, "last_name", "") or "",
            "name": contact_name,
            "company_name": getattr(b, "company_name", "") or "",
            "email": b.email or "",
            "mobile": getattr(b, "mobile", "") or "",
            "designation": getattr(b, "designation", "") or "",
            "company_type": getattr(b, "company_type", "") or "",
            "industry_type": getattr(b, "industry_type", "") or getattr(b, "products", "") or "",
            "company_website": getattr(b, "company_website", "") or "",
            "business_description": getattr(b, "business_description", "") or "",
            "country": getattr(b, "country", "") or "",
            "state": getattr(b, "state", "") or "",
            "city": getattr(b, "city", "") or "",
            "address": getattr(b, "address", "") or "",
            "pin_code": getattr(b, "pin_code", "") or "",
            "stall_area": getattr(b, "stall_area", "") or "",
            "stall_size": pricing["stall_size"],
            "products": getattr(b, "products", "") or "",
            "visiting_card": getattr(b, "visiting_card", "") or "",
            "status": getattr(b, "status", "pending") or "pending",
            "approval_message": getattr(b, "approval_message", "") or "",
            "rejection_reason": getattr(b, "rejection_reason", "") or "",
            "payment_expiry_at": str(b.payment_expiry_at) if getattr(b, "payment_expiry_at", None) else None,
            "created_at": str(b.created_at) if getattr(b, "created_at", None) else None,
            "price": price,
            "rental_price": price,
            "base_price": pricing["base_price"],
            "prime_price": pricing["prime_price"],
            "total_price": price,
            "messages": getattr(b, "messages", "") or "",
        }

    @staticmethod
    def get_all_applications(organizer_id=None, event_id=None, status: str = None, search: str = None):
        from sqlalchemy import or_, and_, func
        import uuid

        stmt = select(
            ExhibitorStallBooking,
            EventDetails.event_name,
            EventDetails.status
        ).outerjoin(
            EventDetails, ExhibitorStallBooking.event_id == EventDetails.id
        )

        conditions = []
        if organizer_id:
            try:
                org_uuid = uuid.UUID(str(organizer_id))
                conditions.append(EventDetails.user_id == org_uuid)
            except Exception:
                conditions.append(EventDetails.user_id == organizer_id)

        if event_id and str(event_id).strip() and str(event_id).strip().lower() != "all":
            try:
                evt_uuid = uuid.UUID(str(event_id))
                conditions.append(ExhibitorStallBooking.event_id == evt_uuid)
            except Exception:
                conditions.append(ExhibitorStallBooking.event_id == event_id)

        if status and status.strip() and status.strip().lower() != "all":
            clean_st = status.strip().lower()
            if clean_st == "confirmed":
                conditions.append(func.lower(ExhibitorStallBooking.status).in_(["confirmed", "paid"]))
            else:
                conditions.append(func.lower(ExhibitorStallBooking.status) == clean_st)

        if search and search.strip():
            term = f"%{search.strip().lower()}%"
            conditions.append(
                or_(
                    func.lower(ExhibitorStallBooking.company_name).like(term),
                    func.lower(ExhibitorStallBooking.email).like(term),
                    func.lower(ExhibitorStallBooking.mobile).like(term),
                    func.lower(ExhibitorStallBooking.first_name).like(term),
                    func.lower(ExhibitorStallBooking.last_name).like(term),
                    func.lower(EventDetails.event_name).like(term),
                    func.lower(ExhibitorStallBooking.stall_area).like(term),
                    func.lower(ExhibitorStallBooking.products).like(term)
                )
            )

        if conditions:
            stmt = stmt.where(and_(*conditions))

        stmt = stmt.order_by(ExhibitorStallBooking.created_at.desc())
        return db.session.execute(stmt).all()

    @staticmethod
    def get_exhibitor_directory(organizer_id=None, search: str = None) -> dict:
        """
        Aggregates stall bookings into unique Exhibitor Company Profiles with live KPI statistics.
        """
        rows = ExhibitorRepository.get_all_applications(organizer_id=organizer_id, search=search)
        
        companies_map = {}
        for row in rows:
            b = row[0]
            evt_name = row[1] if len(row) > 1 else None
            evt_status = row[2] if len(row) > 2 else None
            app_dict = ExhibitorRepository.serialize_application(b, evt_name, evt_status)

            # Key by normalized company name or fallback to email
            key = (b.company_name or "").strip().lower() or (b.email or "").strip().lower() or str(b.id)
            
            if key not in companies_map:
                companies_map[key] = {
                    "id": str(b.id),
                    "company_name": b.company_name or app_dict["name"] or "",
                    "name": app_dict["name"],
                    "first_name": app_dict["first_name"],
                    "last_name": app_dict["last_name"],
                    "email": b.email,
                    "mobile": app_dict["mobile"],
                    "designation": app_dict["designation"],
                    "company_type": app_dict["company_type"],
                    "industry_type": app_dict["industry_type"] or "",
                    "company_website": app_dict["company_website"],
                    "business_description": app_dict["business_description"],
                    "city": app_dict["city"],
                    "state": app_dict["state"],
                    "country": app_dict["country"],
                    "address": app_dict["address"],
                    "pin_code": app_dict["pin_code"],
                    "visiting_card": app_dict["visiting_card"],
                    "products": app_dict["products"],
                    "stall_area": app_dict["stall_area"],
                    "total_applications": 0,
                    "active_stalls": 0,
                    "pending_stalls": 0,
                    "events_participated": set(),
                    "status": "Registered",
                    "last_participated": app_dict["created_at"],
                    "applications": []
                }

            comp = companies_map[key]
            comp["total_applications"] += 1
            st_lower = (b.status or "pending").lower()
            if st_lower in ["approved", "confirmed", "paid"]:
                comp["active_stalls"] += 1
                comp["status"] = "Approved"
            elif st_lower == "pending":
                comp["pending_stalls"] += 1

            if evt_name:
                comp["events_participated"].add(evt_name)
            
            comp["applications"].append({
                "id": str(b.id),
                "event_id": str(b.event_id) if b.event_id else None,
                "event_name": evt_name or "",
                "stall_area": b.stall_area or "",
                "status": b.status or "pending",
                "created_at": str(b.created_at) if b.created_at else None
            })

        # Finalize list
        directory_list = []
        distinct_industries = set()
        total_active_stalls = 0
        total_pending_apps = 0

        for comp in companies_map.values():
            comp["events_list"] = sorted(list(comp["events_participated"]))
            comp["events_count"] = len(comp["events_participated"])
            comp["events_participated"] = ", ".join(comp["events_list"]) if comp["events_list"] else "None"
            
            if comp["industry_type"]:
                distinct_industries.add(comp["industry_type"].strip().lower())
            
            total_active_stalls += comp["active_stalls"]
            total_pending_apps += comp["pending_stalls"]
            directory_list.append(comp)

        # Sort companies by active stalls descending, then company name
        directory_list.sort(key=lambda x: (x["active_stalls"], x["total_applications"]), reverse=True)

        return {
            "exhibitors": directory_list,
            "stats": {
                "total_exhibitors": len(directory_list),
                "active_stalls": total_active_stalls,
                "industries_count": len(distinct_industries),
                "pending_applications": total_pending_apps
            }
        }

    @staticmethod
    def update_application_status(booking_id, status: str, rejection_reason: str = ""):
        booking = db.session.get(ExhibitorStallBooking, booking_id)
        if booking:
            booking.status = status
            if rejection_reason and hasattr(booking, "rejection_reason"):
                booking.rejection_reason = rejection_reason
            db.session.commit()
            return booking
        return None

    @staticmethod
    def create_lead(data_dict: dict) -> ExhibitorLead:
        import uuid
        cleaned = dict(data_dict)
        if "event_id" in cleaned and cleaned["event_id"]:
            try:
                cleaned["event_id"] = uuid.UUID(str(cleaned["event_id"]))
            except Exception:
                pass
        if "user_id" in cleaned and cleaned["user_id"]:
            try:
                cleaned["user_id"] = uuid.UUID(str(cleaned["user_id"]))
            except Exception:
                pass

        # Allowed model fields
        valid_fields = {"event_id", "user_id", "visitor_name", "company_name", "email", "mobile", "buying_intent", "notes"}
        model_kwargs = {k: v for k, v in cleaned.items() if k in valid_fields}

        lead = ExhibitorLead(**model_kwargs)
        db.session.add(lead)
        db.session.commit()
        return lead

    @staticmethod
    def get_leads_by_event(event_id, user_id, search: str = None):
        import uuid
        from sqlalchemy import or_, func
        ev_uuid = None
        if event_id:
            try:
                ev_uuid = uuid.UUID(str(event_id))
            except Exception:
                ev_uuid = event_id

        u_uuids = []
        if user_id:
            try:
                from app.modules.rbac.services.tenant_service import TenantService
                tenant_uids = TenantService.resolve_tenant_user_ids(user_id, "EXHIBITOR")
            except Exception:
                tenant_uids = [user_id]

            for uid in tenant_uids:
                try:
                    u_uuids.append(uuid.UUID(str(uid)))
                except Exception:
                    u_uuids.append(uid)

        stmt = select(ExhibitorLead).where(
            ExhibitorLead.event_id == ev_uuid
        )
        if u_uuids:
            stmt = stmt.where(ExhibitorLead.user_id.in_(u_uuids))

        if search and search.strip():
            term = f"%{search.strip().lower()}%"
            stmt = stmt.where(
                or_(
                    func.lower(ExhibitorLead.visitor_name).like(term),
                    func.lower(ExhibitorLead.company_name).like(term),
                    func.lower(ExhibitorLead.email).like(term),
                    func.lower(ExhibitorLead.mobile).like(term)
                )
            )

        stmt = stmt.order_by(ExhibitorLead.created_at.desc())
        return db.session.scalars(stmt).all()
