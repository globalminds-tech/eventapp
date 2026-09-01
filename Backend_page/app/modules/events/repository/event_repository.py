from typing import Optional, Any
from datetime import datetime, date, time
from sqlalchemy import select, desc, func
from app.extensions.database import db
from app.extensions.storage import StorageService
from app.models.event import EventDetails, EventBookingDetails, EventLayout, EventFile, EventTerm, EventGuest
from app.models.venue import Venue
from app.models.vendor import VendorDetails, EventVendor
from app.models.sponsor import SponsorDetails, EventSponsor
from app.models.policy import Policy
from app.models.program import EventProgram
from app.models.meal import EventFoodItem
from app.models.parking import EventVehicleDetail, EventVehicleAddon
from app.models.stall import EventStall, StallAmenity

def parse_date(val: Any) -> Optional[date]:
    if not val:
        return None
    if isinstance(val, date):
        return val
    if isinstance(val, datetime):
        return val.date()
    if isinstance(val, str):
        v = val.strip()
        if not v:
            return None
        for fmt in ("%Y-%m-%d", "%d/%m/%Y", "%d-%m-%Y", "%m/%d/%Y", "%Y/%m/%d"):
            try:
                return datetime.strptime(v[:10], fmt).date()
            except ValueError:
                pass
    return None

def parse_time(val: Any) -> Optional[time]:
    if not val:
        return None
    if isinstance(val, time):
        return val
    if isinstance(val, str):
        v = val.strip().upper()
        for fmt in ("%H:%M:%S", "%H:%M", "%I:%M %p", "%I:%M:%S %p", "%I:%M%p"):
            try:
                return datetime.strptime(v, fmt).time()
            except ValueError:
                pass
        try:
            parts = v.split(":")
            h = int(parts[0])
            m = int(parts[1][:2])
            return time(h, m)
        except Exception:
            return None
    return None

class EventRepository:
    @staticmethod
    def get_all() -> list[EventDetails]:
        stmt = select(EventDetails).order_by(desc(EventDetails.id))
        return list(db.session.scalars(stmt).all())

    @staticmethod
    def get_all_event_summaries() -> list[dict]:
        stmt = select(EventDetails.id, EventDetails.event_code, EventDetails.event_name, EventDetails.start_date, EventDetails.venue, EventDetails.category, EventDetails.status, EventDetails.slug)
        rows = db.session.execute(stmt).all()
        return [
            {
                "id": r[0],
                "event_code": r[1],
                "event_name": r[2],
                "start_date": str(r[3]) if r[3] else "",
                "venue": r[4] or "",
                "category": r[5] or "",
                "status": r[6] or "Active",
                "slug": r[7] or ""
            }
            for r in rows
        ]

    @staticmethod
    def get_by_id(event_id: int) -> EventDetails | None:
        return db.session.get(EventDetails, event_id)

    @staticmethod
    def get_full_event_by_id(event_identifier) -> Optional[dict]:
        import json
        import urllib.parse
        try:
            db.session.rollback()
        except Exception:
            pass
        if not event_identifier:
            return None
        if isinstance(event_identifier, int) or (isinstance(event_identifier, str) and str(event_identifier).isdigit()):
            event_id = int(event_identifier)
            event = db.session.get(EventDetails, event_id)
        else:
            ident_str = urllib.parse.unquote(str(event_identifier)).strip()
            slug_str = ident_str.lower().replace(" ", "-")
            stmt = select(EventDetails).where(
                (EventDetails.event_code == ident_str) |
                (EventDetails.slug == ident_str) |
                (EventDetails.slug == slug_str) |
                (EventDetails.uuid == ident_str) |
                (func.lower(EventDetails.event_name) == ident_str.lower())
            )
            event = db.session.scalars(stmt).first()

        if not event:
            return None

        event_id = event.id

        # Fetch child entities
        booking = db.session.scalars(select(EventBookingDetails).where(EventBookingDetails.event_id == event_id)).first()
        layout = db.session.scalars(select(EventLayout).where(EventLayout.event_id == event_id)).first()
        stalls = list(db.session.scalars(select(EventStall).where(EventStall.event_id == event_id)).all())
        vendors = list(db.session.scalars(select(EventVendor).where(EventVendor.event_id == event_id)).all())
        sponsors = list(db.session.scalars(select(EventSponsor).where(EventSponsor.event_id == event_id)).all())
        terms = list(db.session.scalars(select(EventTerm).where(EventTerm.event_id == event_id)).all())
        files = list(db.session.scalars(select(EventFile).where(EventFile.event_id == event_id)).all())
        food_items = list(db.session.scalars(select(EventFoodItem).where(EventFoodItem.event_id == event_id)).all())
        vehicles = list(db.session.scalars(select(EventVehicleDetail).where(EventVehicleDetail.event_id == event_id)).all())
        vehicle_addons = list(db.session.scalars(select(EventVehicleAddon).where(EventVehicleAddon.event_id == event_id)).all())
        guests = list(db.session.scalars(select(EventGuest).where(EventGuest.event_id == event_id)).all())

        banner_file = next((f for f in files if f.file_type == "banner"), None)
        banner_preview = banner_file.file_path if banner_file else ""
        banner_type = banner_file.doc_type if banner_file else "image"

        booking_taxes = []
        if booking and booking.taxes:
            try:
                booking_taxes = json.loads(booking.taxes) if booking.taxes.startswith("[") else [t.strip() for t in booking.taxes.split(",")]
            except Exception:
                booking_taxes = [booking.taxes]

        layout_taxes = []
        if layout and layout.taxes:
            try:
                layout_taxes = json.loads(layout.taxes) if layout.taxes.startswith("[") else [t.strip() for t in layout.taxes.split(",")]
            except Exception:
                layout_taxes = [layout.taxes]

        guest_dicts = [
            {
                "name": g.guest_name,
                "guest_name": g.guest_name,
                "guestName": g.guest_name,
                "designation": g.designation,
                "contact": g.contact,
                "image": g.image
            }
            for g in guests
        ]

        term_dicts = [
            {
                "policy_group": t.policy_group,
                "policyGroup": t.policy_group,
                "policy_type": t.policy_type,
                "policyType": t.policy_type,
                "policy_name": t.policy_name,
                "policyName": t.policy_name,
                "is_default": bool(t.is_default),
                "isDefault": bool(t.is_default)
            }
            for t in terms
        ]

        a_stmt = select(StallAmenity).where(StallAmenity.event_id == event.id)
        amenity_records = db.session.scalars(a_stmt).all()

        if amenity_records:
            layout_amenities = [
                {
                    "id": a.id,
                    "stallName": a.stall_name,
                    "stall_name": a.stall_name,
                    "amenity": a.amenity,
                    "qty": a.qty or 1
                }
                for a in amenity_records
            ]
        elif event.amenities:
            try:
                layout_amenities = json.loads(event.amenities) if event.amenities.startswith("[") else [{"amenity": event.amenities}]
            except Exception:
                layout_amenities = []
        else:
            layout_amenities = []

        stall_dicts = [
            {
                "stall_name": s.stall_name,
                "stallName": s.stall_name,
                "stall_size": s.stall_size,
                "size": s.stall_size,
                "size_range": s.size_range,
                "sizeRange": s.size_range,
                "price_inr": s.price_inr,
                "priceINR": s.price_inr,
                "visibility": s.visibility or "Public",
                "stall_type": s.stall_type or "",
                "type": s.stall_type or "",
                "prime_seat": bool(s.prime_seat),
                "primeSeat": bool(s.prime_seat),
                "prime_price_inr": s.prime_price_inr or "",
                "primePriceINR": s.prime_price_inr or ""
            }
            for s in stalls
        ]

        food_dicts = [
            {
                "caterer_name": f.caterer_name,
                "catererName": f.caterer_name,
                "meal_type": f.meal_type,
                "mealType": f.meal_type,
                "food_type": f.food_type,
                "foodType": f.food_type,
                "price_inr": float(f.price_inr) if f.price_inr is not None else 0,
                "priceINR": float(f.price_inr) if f.price_inr is not None else 0,
                "menu_details": f.menu_details,
                "menuDetails": f.menu_details
            }
            for f in food_items
        ]

        vehicle_dicts = [
            {
                "vehicle_type": v.vehicle_type,
                "vehicleType": v.vehicle_type,
                "price_inr": float(v.price_inr) if v.price_inr is not None else 0,
                "priceINR": float(v.price_inr) if v.price_inr is not None else 0
            }
            for v in vehicles
        ]

        addon_dicts = [
            {
                "isParent": bool(a.is_parent),
                "is_parent": bool(a.is_parent),
                "addOnName": a.addon_name,
                "addon_name": a.addon_name,
                "name": a.addon_name,
                "price": float(a.price) if a.price is not None else 0
            }
            for a in vehicle_addons
        ]

        return {
            "id": event.id,
            "uuid": getattr(event, "uuid", None) or "",
            "event_code": event.event_code or f"EVT-{event.id}",
            "slug": event.slug or "",
            "event_name": event.event_name or "",
            "category": event.category or "",
            "sub_category": getattr(event, "sub_category", "") or "",
            "event_type": event.event_type or "OneTime",
            "start_date": str(event.start_date) if event.start_date else "",
            "end_date": str(event.end_date) if event.end_date else "",
            "start_time": str(event.start_time) if event.start_time else "",
            "end_time": str(event.end_time) if event.end_time else "",
            "venue": event.venue or "",
            "address": event.address or "",
            "description": event.description or "",
            "visibility": event.visibility or "Public",
            "occurrence": event.occurrence or "",
            "status": event.status or "Active",
            "user_id": event.user_id,
            "banner_url": banner_preview,
            "banner": banner_preview,
            "image": banner_preview,

            "eventDetails": {
                "eventName": event.event_name or "",
                "event_name": event.event_name or "",
                "eventCode": event.event_code or "",
                "event_code": event.event_code or "",
                "slug": event.slug or "",
                "category": event.category or "",
                "subCategory": getattr(event, "sub_category", "") or "",
                "sub_category": getattr(event, "sub_category", "") or "",
                "eventType": event.event_type or "OneTime",
                "event_type": event.event_type or "OneTime",
                "occurrence": event.occurrence or "",
                "startDate": str(event.start_date) if event.start_date else "",
                "start_date": str(event.start_date) if event.start_date else "",
                "endDate": str(event.end_date) if event.end_date else "",
                "end_date": str(event.end_date) if event.end_date else "",
                "startTime": str(event.start_time) if event.start_time else "",
                "start_time": str(event.start_time) if event.start_time else "",
                "endTime": str(event.end_time) if event.end_time else "",
                "end_time": str(event.end_time) if event.end_time else "",
                "venue": event.venue or "",
                "address": event.address or "",
                "description": event.description or "",
                "visibility": event.visibility or "Public",
                "mail": bool(event.mail),
                "whatsapp": bool(event.whatsapp),
                "print": bool(event.print),
                "visitorMail": bool(event.visitor_mail),
                "visitor_mail": bool(event.visitor_mail),
                "visitorName": bool(event.visitor_name),
                "visitor_name": bool(event.visitor_name),
                "visitorPhoto": bool(event.visitor_photo),
                "visitor_photo": bool(event.visitor_photo),
                "visitorMobile": bool(event.visitor_mobile),
                "visitor_mobile": bool(event.visitor_mobile),
                "documentProof": bool(event.document_proof),
                "document_proof": bool(event.document_proof),
                "dayPass": bool(event.day_pass),
                "day_pass": bool(event.day_pass),
                "isInternationalInclude": bool(event.is_international_include),
                "is_international_include": bool(event.is_international_include),
                "aadhar": bool(event.aadhar),
                "passport": bool(event.passport),
                "welcomeKit": bool(event.welcome_kit),
                "welcome_kit": bool(event.welcome_kit),
                "food": bool(event.food),
                "vehiclePass": bool(event.vehicle_pass),
                "vehicle_pass": bool(event.vehicle_pass),
                "vehicleNumber": bool(event.vehicle_number),
                "vehicle_number": bool(event.vehicle_number),
                "includeProgram": event.include_program or "No",
                "include_program": event.include_program or "No",
                "amenities": event.amenities or "",
                "tags": event.tags or "",
                "banner_url": banner_preview,
                "banner_type": banner_type,
                "status": event.status or "Active"
            },
            "booking": {
                "priceINR": float(booking.price_inr) if booking and booking.price_inr is not None else 0,
                "price_inr": float(booking.price_inr) if booking and booking.price_inr is not None else 0,
                "capacity": booking.capacity if booking and booking.capacity is not None else 500,
                "totalCapacity": booking.capacity if booking and booking.capacity is not None else 500,
                "maxPass": booking.max_pass if booking and booking.max_pass is not None else 4,
                "max_pass": booking.max_pass if booking and booking.max_pass is not None else 4,
                "maxPerUser": booking.max_pass if booking and booking.max_pass is not None else 4,
                "entryType": booking.entry_type if booking else "Paid",
                "entry_type": booking.entry_type if booking else "Paid",
                "chargeType": booking.charge_type if booking else "Paid",
                "charge_type": booking.charge_type if booking else "Paid",
                "passType": booking.pass_type if booking else "Single Pass",
                "pass_type": booking.pass_type if booking else "Single Pass",
                "title": booking.title if booking else "",
                "titleType": booking.title_type if booking else "Editable",
                "title_type": booking.title_type if booking else "Editable",
                "titleSelection": booking.title_selection if booking else "",
                "title_selection": booking.title_selection if booking else "",
                "designation": booking.designation if booking else "",
                "designationType": booking.designation_type if booking else "Editable",
                "designation_type": booking.designation_type if booking else "Editable",
                "designationSelection": booking.designation_selection if booking else "",
                "designation_selection": booking.designation_selection if booking else "",
                "company": booking.company if booking else "",
                "companyType": booking.company_type if booking else "Editable",
                "company_type": booking.company_type if booking else "Editable",
                "companySelection": booking.company_selection if booking else "",
                "company_selection": booking.company_selection if booking else "",
                "currency": booking.currency if booking else "",
                "priceType": booking.price_type if booking else "National",
                "price_type": booking.price_type if booking else "National",
                "includeTax": bool(booking.include_tax) if booking else False,
                "include_tax": bool(booking.include_tax) if booking else False,
                "taxes": booking_taxes,
                "earlyBirdExpire": str(booking.early_bird_expire) if booking and booking.early_bird_expire else "",
                "early_bird_expire": str(booking.early_bird_expire) if booking and booking.early_bird_expire else "",
                "bookingStartDate": str(booking.booking_start_date) if booking and booking.booking_start_date else "",
                "booking_start_date": str(booking.booking_start_date) if booking and booking.booking_start_date else "",
                "bookingEndDate": str(booking.booking_end_date) if booking and booking.booking_end_date else "",
                "booking_end_date": str(booking.booking_end_date) if booking and booking.booking_end_date else ""
            } if booking else {},
            "layout": {
                "floorType": layout.floor_type if layout else "",
                "floor_type": layout.floor_type if layout else "",
                "dayBased": layout.day_based if layout else False,
                "day_based": layout.day_based if layout else False,
                "personPass": layout.person_pass if layout else 1,
                "person_pass": layout.person_pass if layout else 1,
                "includeTax": bool(layout.include_tax) if layout else False,
                "include_tax": bool(layout.include_tax) if layout else False,
                "taxes": layout_taxes,
                "stalls": stall_dicts,
                "stallList": stall_dicts,
                "amenities": layout_amenities,
                "layout": {
                    "floor_type": layout.floor_type if layout else "",
                    "floorType": layout.floor_type if layout else "",
                    "day_based": layout.day_based if layout else False,
                    "dayBased": layout.day_based if layout else False,
                    "include_tax": bool(layout.include_tax) if layout else False,
                    "includeTax": bool(layout.include_tax) if layout else False,
                }
            } if layout else { "amenities": layout_amenities, "stalls": stall_dicts },
            "amenities": layout_amenities,
            "foodProvision": {
                "catererName": food_items[0].caterer_name if food_items else "",
                "mealType": food_items[0].meal_type if food_items else "",
                "foodType": food_items[0].food_type if food_items else "",
                "priceINR": float(food_items[0].price_inr) if food_items and food_items[0].price_inr is not None else 0,
                "menuDetails": food_items[0].menu_details if food_items else "",
                "foodItems": food_dicts,
                "items": food_dicts
            },
            "vehicleProvision": {
                "vehicleType": vehicles[0].vehicle_type if vehicles else "",
                "priceINR": float(vehicles[0].price_inr) if vehicles and vehicles[0].price_inr is not None else 0,
                "vehicles": vehicle_dicts,
                "details": vehicle_dicts,
                "addons": addon_dicts,
                "vehicle_addons": addon_dicts
            },
            "documents": {
                "bannerPreview": banner_preview,
                "bannerType": banner_type,
                "existingFiles": [{"file_name": f.file_name, "file_path": f.file_path, "file_type": f.file_type, "doc_type": f.doc_type} for f in files],
                "additionalDocs": [{"file_name": f.file_name, "name": f.file_name, "file_path": f.file_path, "preview": f.file_path, "type": f.doc_type} for f in files if f.file_type == "document"],
                "docs": [{"file_name": f.file_name, "name": f.file_name, "file_path": f.file_path, "file_url": f.file_path, "file_type": f.file_type, "doc_type": f.doc_type, "type": f.doc_type} for f in files if f.file_type == "document"]
            },
            "termsDetails": {
                "policies": term_dicts
            },
            "vendorSponsor": {
                "vendors": [{"vendor_name": v.vendor_name, "vendorName": v.vendor_name, "vendor_type": v.vendor_type, "vendorType": v.vendor_type, "pass_count": v.pass_count, "passCount": v.pass_count} for v in vendors],
                "sponsors": [{"sponsor_name": sp.sponsor_name, "sponsorName": sp.sponsor_name, "sponsorship_type": sp.sponsorship_type, "sponsorshipType": sp.sponsorship_type, "sponsorship": sp.sponsorship_type} for sp in sponsors],
                "guests": guest_dicts
            },
            "stalls": stall_dicts,
            "vendors": [{"vendor_name": v.vendor_name, "vendorName": v.vendor_name, "vendor_type": v.vendor_type, "vendorType": v.vendor_type, "pass_count": v.pass_count} for v in vendors],
            "sponsors": [{"sponsor_name": sp.sponsor_name, "sponsorName": sp.sponsor_name, "sponsorship_type": sp.sponsorship_type, "sponsorshipType": sp.sponsorship_type, "sponsorship": sp.sponsorship_type} for sp in sponsors],
            "guests": guest_dicts,
            "terms": term_dicts,
            "files": [{"file_name": f.file_name, "file_path": f.file_path, "file_type": f.file_type} for f in files],
            "food": food_dicts,
            "food_items": food_dicts,
            "vehicles": vehicle_dicts,
            "vehicle_details": vehicle_dicts,
            "vehicle_addons": addon_dicts
        }

    @staticmethod
    def save_full_event(raw_data: dict, user_id: int = None, event_id: int = None) -> dict:
        import json
        event_details = raw_data.get("eventDetails", {}) or raw_data
        booking_data = raw_data.get("booking", {})
        layout_data = raw_data.get("layout", {})
        food_data = raw_data.get("foodProvision", {})
        vehicle_data = raw_data.get("vehicleProvision", {})
        documents_data = raw_data.get("documents", {})
        terms_data = raw_data.get("termsDetails", {})
        vendor_sponsor_data = raw_data.get("vendorSponsor", {}) or raw_data.get("vendors", {})

        # 1. Save core EventDetails
        event = None
        if event_id:
            if isinstance(event_id, int) or (isinstance(event_id, str) and str(event_id).isdigit()):
                event = db.session.get(EventDetails, int(event_id))
            else:
                event = db.session.scalars(select(EventDetails).where(
                    (EventDetails.event_code == str(event_id)) | (EventDetails.slug == str(event_id)) | (EventDetails.uuid == str(event_id))
                )).first()

        if not event:
            import uuid
            event = EventDetails()
            event.uuid = str(uuid.uuid4())
            db.session.add(event)

        event.event_name = event_details.get("eventName") or event_details.get("event_name") or raw_data.get("event_name") or "Untitled Event"
        event.event_code = event_details.get("eventCode") or event_details.get("event_code") or raw_data.get("event_code") or f"EVT-{int(datetime.utcnow().timestamp())}"

        from app.utils.slug import generate_unique_slug, slugify
        if not event.slug or (event.event_name and slugify(event.event_name) not in (event.slug or "")):
            event.slug = generate_unique_slug(db.session, EventDetails, event.event_name, current_id=event.id, default_prefix="event")
        event.category = event_details.get("category") or raw_data.get("category") or ""
        
        sub_cat = event_details.get("subCategory") or event_details.get("sub_category") or raw_data.get("sub_category") or ""
        if hasattr(event, "sub_category"):
            event.sub_category = sub_cat

        event.description = event_details.get("description") or raw_data.get("description") or ""
        event.venue = event_details.get("venue") or raw_data.get("venue") or ""
        event.address = event_details.get("address") or raw_data.get("address") or ""
        event.event_type = event_details.get("eventType") or event_details.get("event_type") or raw_data.get("event_type") or "OneTime"
        event.occurrence = event_details.get("occurrence") or raw_data.get("occurrence") or ""
        event.visibility = event_details.get("visibility") or raw_data.get("visibility") or "Public"
        event.status = raw_data.get("status") or "Pending"
        
        # Checkbox & facility toggles
        event.mail = bool(event_details.get("mail"))
        event.whatsapp = bool(event_details.get("whatsapp"))
        event.print = bool(event_details.get("print"))
        event.visitor_mail = bool(event_details.get("visitorMail"))
        event.visitor_name = bool(event_details.get("visitorName"))
        event.visitor_photo = bool(event_details.get("visitorPhoto"))
        event.visitor_mobile = bool(event_details.get("visitorMobile"))
        event.document_proof = bool(event_details.get("documentProof"))
        event.day_pass = bool(event_details.get("dayPass"))
        event.is_international_include = bool(event_details.get("isInternationalInclude"))
        event.aadhar = bool(event_details.get("aadhar"))
        event.passport = bool(event_details.get("passport"))
        event.welcome_kit = bool(event_details.get("welcomeKit"))
        event.food = bool(event_details.get("food"))
        event.vehicle_pass = bool(event_details.get("vehiclePass"))
        event.vehicle_number = bool(event_details.get("vehicleNumber"))
        
        inc_prog = event_details.get("includeProgram")
        event.include_program = "Yes" if inc_prog in [True, "Yes", "yes"] else "No"
        event.amenities = event_details.get("amenities") or ""
        event.tags = event_details.get("tags") or ""

        if user_id:
            event.user_id = user_id
        elif not event.user_id:
            event.user_id = raw_data.get("user_id") or 1

        start_date_val = event_details.get("startDate") or event_details.get("start_date") or raw_data.get("start_date")
        end_date_val = event_details.get("endDate") or event_details.get("end_date") or raw_data.get("end_date")
        start_time_val = event_details.get("startTime") or event_details.get("start_time") or raw_data.get("start_time")
        end_time_val = event_details.get("endTime") or event_details.get("end_time") or raw_data.get("end_time")

        event.start_date = parse_date(start_date_val)
        event.end_date = parse_date(end_date_val)
        event.start_time = parse_time(start_time_val)
        event.end_time = parse_time(end_time_val)

        db.session.flush() # Generate event.id if new

        # 2. Clear old child entities on edit to prevent duplicates
        if event.id:
            db.session.query(EventStall).filter(EventStall.event_id == event.id).delete(synchronize_session=False)
            db.session.query(StallAmenity).filter(StallAmenity.event_id == event.id).delete(synchronize_session=False)
            db.session.query(EventVendor).filter(EventVendor.event_id == event.id).delete(synchronize_session=False)
            db.session.query(EventSponsor).filter(EventSponsor.event_id == event.id).delete(synchronize_session=False)
            db.session.query(EventGuest).filter(EventGuest.event_id == event.id).delete(synchronize_session=False)
            db.session.query(EventTerm).filter(EventTerm.event_id == event.id).delete(synchronize_session=False)
            db.session.query(EventFoodItem).filter(EventFoodItem.event_id == event.id).delete(synchronize_session=False)
            db.session.query(EventVehicleDetail).filter(EventVehicleDetail.event_id == event.id).delete(synchronize_session=False)
            db.session.query(EventVehicleAddon).filter(EventVehicleAddon.event_id == event.id).delete(synchronize_session=False)

        # 3. Save EventBookingDetails
        if booking_data:
            b_stmt = select(EventBookingDetails).where(EventBookingDetails.event_id == event.id)
            booking = db.session.scalars(b_stmt).first()
            if not booking:
                booking = EventBookingDetails(event_id=event.id)
                db.session.add(booking)

            price_inr_val = booking_data.get("priceINR") or booking_data.get("price_inr") or 0
            capacity_val = booking_data.get("capacity") or booking_data.get("totalCapacity") or 500
            max_pass_val = booking_data.get("maxPass") or booking_data.get("maxPerUser") or booking_data.get("max_pass") or 4
            
            try:
                booking.price_inr = float(price_inr_val) if price_inr_val else 0.0
            except Exception:
                booking.price_inr = 0.0

            try:
                booking.capacity = int(capacity_val) if capacity_val else 500
            except Exception:
                booking.capacity = 500

            try:
                booking.max_pass = int(max_pass_val) if max_pass_val else 4
            except Exception:
                booking.max_pass = 4

            booking.entry_type = booking_data.get("entryType") or booking_data.get("entry_type") or "Paid"
            booking.charge_type = booking_data.get("chargeType") or booking_data.get("charge_type") or "Paid"
            booking.pass_type = booking_data.get("passType") or "Single Pass"
            booking.title = booking_data.get("title") or ""
            booking.title_type = booking_data.get("titleType") or "Editable"
            booking.title_selection = booking_data.get("titleSelection") or ""
            booking.designation = booking_data.get("designation") or ""
            booking.designation_type = booking_data.get("designationType") or "Editable"
            booking.designation_selection = booking_data.get("designationSelection") or ""
            booking.company = booking_data.get("company") or ""
            booking.company_type = booking_data.get("companyType") or "Editable"
            booking.company_selection = booking_data.get("companySelection") or ""
            booking.currency = booking_data.get("currency") or ""
            booking.price_type = booking_data.get("priceType") or "National"
            booking.include_tax = bool(booking_data.get("includeTax"))

            taxes_val = booking_data.get("taxes")
            if isinstance(taxes_val, list):
                booking.taxes = json.dumps(taxes_val)
            elif isinstance(taxes_val, str):
                booking.taxes = taxes_val

            b_start = booking_data.get("bookingStartDate")
            b_end = booking_data.get("bookingEndDate")
            if b_start:
                booking.booking_start_date = parse_date(str(b_start).replace("/", "-"))
            if b_end:
                booking.booking_end_date = parse_date(str(b_end).replace("/", "-"))

        # 4. Save EventLayout & Stalls
        if layout_data:
            l_stmt = select(EventLayout).where(EventLayout.event_id == event.id)
            layout = db.session.scalars(l_stmt).first()
            if not layout:
                layout = EventLayout(event_id=event.id)
                db.session.add(layout)

            layout.floor_type = layout_data.get("floorType") or layout_data.get("floor_type") or ""
            layout.day_based = bool(layout_data.get("dayBased") or layout_data.get("day_based"))
            person_pass = layout_data.get("personPass") or layout_data.get("person_pass")
            try:
                layout.person_pass = int(person_pass) if person_pass else 1
            except Exception:
                layout.person_pass = 1

            layout.include_tax = bool(layout_data.get("includeTax"))
            l_taxes = layout_data.get("taxes")
            if isinstance(l_taxes, list):
                layout.taxes = json.dumps(l_taxes)
            elif isinstance(l_taxes, str):
                layout.taxes = l_taxes

            stalls_list = layout_data.get("stalls") or layout_data.get("stallList") or []
            if isinstance(stalls_list, list) and stalls_list:
                for st in stalls_list:
                    if isinstance(st, dict):
                        s_name = st.get("stall_name") or st.get("stallName")
                        if s_name:
                            stall_obj = EventStall(
                                event_id=event.id,
                                stall_name=s_name,
                                stall_size=st.get("stall_size") or st.get("size") or "",
                                size_range=st.get("size_range") or st.get("sizeRange") or "",
                                price_inr=str(st.get("price_inr") or st.get("priceINR") or st.get("price") or "0"),
                                visibility=st.get("visibility") or "Public",
                                stall_type=st.get("stall_type") or st.get("type") or "",
                                prime_seat=bool(st.get("prime_seat") or st.get("primeSeat")),
                                prime_price_inr=str(st.get("prime_price_inr") or st.get("primePriceINR") or "")
                            )
                            db.session.add(stall_obj)

            # Save Stall Amenities
            amenities_list = layout_data.get("amenities") or raw_data.get("amenities") or []
            if isinstance(amenities_list, str):
                try:
                    amenities_list = json.loads(amenities_list)
                except Exception:
                    amenities_list = []

            if isinstance(amenities_list, list) and len(amenities_list) > 0:
                for am in amenities_list:
                    if isinstance(am, dict):
                        a_obj = StallAmenity(
                            event_id=event.id,
                            stall_name=am.get("stallName") or am.get("stall_name") or "",
                            amenity=am.get("amenity") or am.get("name") or "",
                            qty=int(am.get("qty") or am.get("quantity") or 1)
                        )
                        db.session.add(a_obj)
                event.amenities = json.dumps(amenities_list)

        # 5. Save Vendors, Sponsors & Guests
        if vendor_sponsor_data or raw_data.get("vendors"):
            vs_source = vendor_sponsor_data if isinstance(vendor_sponsor_data, dict) else {}
            vendors_list = vs_source.get("vendors") or raw_data.get("vendors") or []
            if isinstance(vendors_list, dict):
                vendors_list = vendors_list.get("vendors") or []
            if isinstance(vendors_list, list):
                for v in vendors_list:
                    if isinstance(v, dict) and (v.get("vendor_name") or v.get("vendorName")):
                        v_obj = EventVendor(
                            event_id=event.id,
                            vendor_name=v.get("vendor_name") or v.get("vendorName"),
                            vendor_type=v.get("vendor_type") or v.get("vendorType") or "",
                            pass_count=int(v.get("pass_count") or v.get("passCount") or 0)
                        )
                        db.session.add(v_obj)

            sponsors_list = vs_source.get("sponsors") or []
            if isinstance(sponsors_list, list):
                for sp in sponsors_list:
                    if isinstance(sp, dict) and (sp.get("sponsor_name") or sp.get("sponsorName")):
                        sp_obj = EventSponsor(
                            event_id=event.id,
                            sponsor_name=sp.get("sponsor_name") or sp.get("sponsorName"),
                            sponsorship_type=sp.get("sponsorship_type") or sp.get("sponsorshipType") or sp.get("sponsorship") or ""
                        )
                        db.session.add(sp_obj)

            guests_list = vs_source.get("guests") or raw_data.get("guests") or []
            if isinstance(guests_list, list):
                for g in guests_list:
                    if isinstance(g, dict):
                        g_name = g.get("guest_name") or g.get("guestName") or g.get("name")
                        if g_name:
                            g_image = g.get("image") or g.get("guestImage") or g.get("preview") or ""
                            if g_image and g_image.startswith("data:"):
                                g_image = StorageService.upload_base64_data(g_image, folder="guests")
                            g_obj = EventGuest(
                                event_id=event.id,
                                guest_name=g_name,
                                designation=g.get("designation") or "",
                                contact=g.get("contact") or "",
                                image=g_image
                            )
                            db.session.add(g_obj)

        # 6. Save Terms & Policies
        policies_list = []
        if terms_data and isinstance(terms_data, dict):
            policies_list = terms_data.get("policies") or terms_data.get("terms") or []
        elif terms_data and isinstance(terms_data, list):
            policies_list = terms_data
        if not policies_list and raw_data.get("terms"):
            policies_list = raw_data.get("terms")

        if isinstance(policies_list, list):
            for p in policies_list:
                if isinstance(p, dict):
                    p_name = p.get("policy_name") or p.get("policyName")
                    if p_name:
                        t_obj = EventTerm(
                            event_id=event.id,
                            policy_group=p.get("policy_group") or p.get("policyGroup") or "General",
                            policy_type=p.get("policy_type") or p.get("policyType") or "Terms",
                            policy_name=p_name,
                            is_default=bool(p.get("is_default") or p.get("isDefault"))
                        )
                        db.session.add(t_obj)

        # 7. Save Food Provisions
        if food_data and isinstance(food_data, dict):
            food_items_list = food_data.get("foodItems") or food_data.get("items") or []
            if isinstance(food_items_list, list) and food_items_list:
                for fi in food_items_list:
                    if isinstance(fi, dict) and (fi.get("caterer_name") or fi.get("catererName")):
                        food_obj = EventFoodItem(
                            event_id=event.id,
                            caterer_name=fi.get("caterer_name") or fi.get("catererName"),
                            meal_type=fi.get("meal_type") or fi.get("mealType") or "",
                            food_type=fi.get("food_type") or fi.get("foodType") or "",
                            price_inr=float(fi.get("price_inr") or fi.get("priceINR") or 0),
                            menu_details=fi.get("menu_details") or fi.get("menuDetails") or ""
                        )
                        db.session.add(food_obj)
            else:
                caterer = food_data.get("catererName") or food_data.get("caterer_name")
                if caterer:
                    food_obj = EventFoodItem(
                        event_id=event.id,
                        caterer_name=caterer,
                        meal_type=food_data.get("mealType") or food_data.get("meal_type") or "",
                        food_type=food_data.get("foodType") or food_data.get("food_type") or "",
                        price_inr=float(food_data.get("priceINR") or food_data.get("price_inr") or 0),
                        menu_details=food_data.get("menuDetails") or food_data.get("menu_details") or ""
                    )
                    db.session.add(food_obj)

        # 8. Save Vehicle Provisions & Parking Add-Ons
        if vehicle_data and isinstance(vehicle_data, dict):
            vehicles_list = vehicle_data.get("vehicles") or vehicle_data.get("details") or []
            if isinstance(vehicles_list, list) and vehicles_list:
                for v in vehicles_list:
                    if isinstance(v, dict) and (v.get("vehicle_type") or v.get("vehicleType")):
                        v_obj = EventVehicleDetail(
                            event_id=event.id,
                            vehicle_type=v.get("vehicle_type") or v.get("vehicleType"),
                            price_inr=float(v.get("price_inr") or v.get("priceINR") or 0)
                        )
                        db.session.add(v_obj)
            else:
                v_type = vehicle_data.get("vehicleType") or vehicle_data.get("vehicle_type")
                if v_type:
                    v_obj = EventVehicleDetail(
                        event_id=event.id,
                        vehicle_type=v_type,
                        price_inr=float(vehicle_data.get("priceINR") or vehicle_data.get("price_inr") or 0)
                    )
                    db.session.add(v_obj)

            addons_list = vehicle_data.get("addons") or vehicle_data.get("vehicle_addons") or raw_data.get("vehicle_addons") or []
            if isinstance(addons_list, list) and addons_list:
                for addon in addons_list:
                    if isinstance(addon, dict):
                        a_name = addon.get("addOnName") or addon.get("addon_name") or addon.get("name")
                        if a_name:
                            a_obj = EventVehicleAddon(
                                event_id=event.id,
                                is_parent=bool(addon.get("isParent") or addon.get("is_parent")),
                                addon_name=a_name,
                                price=float(addon.get("price") or addon.get("price_inr") or 0)
                            )
                            db.session.add(a_obj)

        # 9. Save Banner & Documents to Supabase Storage
        if documents_data and isinstance(documents_data, dict):
            banner_preview = documents_data.get("bannerPreview") or documents_data.get("banner_url") or documents_data.get("banner")
            banner_type = documents_data.get("bannerType") or "image"
            if banner_preview:
                b_file = db.session.scalars(select(EventFile).where(EventFile.event_id == event.id, EventFile.file_type == "banner")).first()
                if not b_file:
                    b_file = EventFile(event_id=event.id, file_type="banner")
                    db.session.add(b_file)
                b_file.file_name = "event_banner"
                b_file.file_path = StorageService.upload_base64_data(banner_preview, folder="banners")
                b_file.doc_type = banner_type

            # Additional documents
            doc_list = documents_data.get("additionalDocs") or documents_data.get("existingFiles") or documents_data.get("fileList") or []
            if isinstance(doc_list, list):
                for doc in doc_list:
                    if isinstance(doc, dict):
                        f_path = doc.get("file_path") or doc.get("preview") or doc.get("url")
                        if f_path:
                            if f_path.startswith("data:"):
                                f_path = StorageService.upload_base64_data(f_path, folder="documents")
                            doc_obj = EventFile(
                                event_id=event.id,
                                file_name=doc.get("file_name") or doc.get("name") or "document",
                                file_path=f_path,
                                file_type="document",
                                doc_type=doc.get("doc_type") or doc.get("type") or "file"
                            )
                            db.session.add(doc_obj)

        db.session.commit()
        return EventRepository.get_full_event_by_id(event.id)

    @staticmethod
    def create(event_data: dict) -> EventDetails:
        return EventRepository.save_full_event(event_data)

    @staticmethod
    def update(event_id: int, update_data: dict) -> EventDetails | None:
        result = EventRepository.save_full_event(update_data, event_id=event_id)
        return EventRepository.get_by_id(event_id)

    @staticmethod
    def delete(event_id: int) -> bool:
        event = db.session.get(EventDetails, event_id)
        if event:
            db.session.delete(event)
            db.session.commit()
            return True
        return False

    @staticmethod
    def get_all_venues() -> list[Venue]:
        stmt = select(Venue).order_by(desc(Venue.id))
        return list(db.session.scalars(stmt).all())

    @staticmethod
    def get_all_vendors() -> list[VendorDetails]:
        stmt = select(VendorDetails).order_by(desc(VendorDetails.id))
        return list(db.session.scalars(stmt).all())

    @staticmethod
    def get_all_sponsors() -> list[SponsorDetails]:
        stmt = select(SponsorDetails).order_by(desc(SponsorDetails.id))
        return list(db.session.scalars(stmt).all())

    @staticmethod
    def get_all_policies() -> list[Policy]:
        stmt = select(Policy).order_by(desc(Policy.id))
        return list(db.session.scalars(stmt).all())

    @staticmethod
    def get_event_programs(event_id: int) -> list[EventProgram]:
        stmt = select(EventProgram).where(EventProgram.event_id == event_id)
        return list(db.session.scalars(stmt).all())

