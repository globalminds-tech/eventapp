from typing import Optional
from datetime import datetime
from sqlalchemy import select
from app.extensions.database import db
from app.models.event import EventDetails
from app.models.booking import UserBookingDetails
from app.models.user import User

class UserRepository:
    @staticmethod
    def get_user_by_id(user_id) -> User | None:
        return db.session.get(User, user_id)

    @staticmethod
    def update_user_profile(user_id, data_dict: dict) -> User | None:
        user = UserRepository.get_user_by_id(user_id)
        if user:
            for key, value in data_dict.items():
                if value is not None and hasattr(user, key):
                    setattr(user, key, value)
            db.session.commit()
        return user

    @staticmethod
    def get_event_by_id(event_id) -> EventDetails | None:
        import uuid
        try:
            eid = uuid.UUID(str(event_id))
            return db.session.get(EventDetails, eid)
        except Exception:
            return db.session.scalars(select(EventDetails).where(
                (EventDetails.event_code == str(event_id)) | (EventDetails.slug == str(event_id))
            )).first()

    @staticmethod
    def generate_ticket_code(event_id) -> str:
        import uuid
        hex_token = uuid.uuid4().hex[:8].upper()
        prefix = str(event_id)[:6]
        return f"BME-{prefix}-{hex_token}"

    @staticmethod
    def create_booking(event_id, name: str, email: str, phone: str, food_preference: str, qr_data: str = "PENDING", user_id = None) -> UserBookingDetails:
        import uuid
        try:
            parsed_event_id = uuid.UUID(str(event_id))
        except Exception:
            parsed_event_id = event_id

        parsed_user_id = None
        if user_id:
            try:
                parsed_user_id = uuid.UUID(str(user_id))
            except Exception:
                parsed_user_id = None

        ticket_code = UserRepository.generate_ticket_code(event_id)
        booking = UserBookingDetails(
            event_id=parsed_event_id,
            user_id=parsed_user_id,
            name=name,
            email=email.strip().lower(),
            phone=phone,
            food_preference=food_preference,
            ticket_code=ticket_code,
            qr_data=qr_data,
            is_scanned=False
        )
        db.session.add(booking)
        db.session.commit()
        return booking

    @staticmethod
    def update_qr_data(booking_id, qr_text: str) -> UserBookingDetails | None:
        booking = db.session.get(UserBookingDetails, booking_id)
        if booking:
            booking.qr_data = qr_text
            db.session.commit()
            return booking
        return None

    @staticmethod
    def extract_clean_ticket_code(raw_input: str) -> str:
        """Intelligently normalize QR/Barcode input handling URLs, JSON payloads, and clean codes."""
        import json
        from urllib.parse import urlparse, parse_qs

        text = str(raw_input or "").strip()
        if not text:
            return ""

        # 1. JSON payload check
        if text.startswith("{") and text.endswith("}"):
            try:
                data = json.loads(text)
                for key in ["ticket_code", "code", "ticket", "id", "booking_id", "pass_code"]:
                    if key in data and data[key]:
                        return str(data[key]).strip()
            except Exception:
                pass

        # 2. URL check (e.g. https://.../verify?code=BME-1234 or .../ticket/BME-1234)
        if text.startswith("http://") or text.startswith("https://"):
            try:
                parsed = urlparse(text)
                qs = parse_qs(parsed.query)
                for key in ["code", "ticket", "ticket_code", "id", "ref"]:
                    if key in qs and qs[key]:
                        return str(qs[key][0]).strip()
                path_parts = [p for p in parsed.path.split("/") if p]
                if path_parts:
                    return path_parts[-1].strip()
            except Exception:
                pass

        return text

    @staticmethod
    def get_booking_with_event(code_or_id: str):
        from sqlalchemy import or_, func
        import uuid
        identifier_str = UserRepository.extract_clean_ticket_code(code_or_id)
        if not identifier_str:
            return None
        
        stmt = select(UserBookingDetails, EventDetails).join(
            EventDetails, UserBookingDetails.event_id == EventDetails.id
        )
        
        # Check if identifier is valid UUID
        try:
            parsed_uuid = uuid.UUID(identifier_str)
            stmt = stmt.where(or_(
                func.lower(UserBookingDetails.ticket_code) == identifier_str.lower(),
                UserBookingDetails.id == parsed_uuid
            ))
        except (ValueError, AttributeError):
            stmt = stmt.where(func.lower(UserBookingDetails.ticket_code) == identifier_str.lower())
            
        return db.session.execute(stmt).first()

    @staticmethod
    def mark_booking_checkin(
        code_or_id: str | int,
        scanner_id: Optional[str] = None,
        gate_name: Optional[str] = None,
        expected_event_id: Optional[str] = None,
        override_duplicate: bool = False
    ):
        from app.models.booking import AttendeeCheckinLog
        result = UserRepository.get_booking_with_event(code_or_id)
        if not result:
            return False, None, "Invalid Ticket: Pass code not found in database", "NOT_FOUND"
        booking, event = result

        # Check Event Scoping
        if expected_event_id:
            try:
                import uuid
                expected_uuid = uuid.UUID(str(expected_event_id))
                if booking.event_id != expected_uuid:
                    return False, booking, f"Wrong Event: Ticket is registered for '{event.event_name}', not this event.", "WRONG_EVENT"
            except Exception:
                if str(booking.event_id) != str(expected_event_id):
                    return False, booking, f"Wrong Event: Ticket is registered for '{event.event_name}', not this event.", "WRONG_EVENT"

        # Check Duplicate Check-In (Anti-Fraud)
        if booking.is_checked_in and not booking.is_checked_out and not override_duplicate:
            checkin_time_str = booking.checkin_at.strftime("%I:%M %p") if booking.checkin_at else "earlier"
            gate_str = booking.checkin_scanner_id or "Gate"
            return False, booking, f"Duplicate Scan: Attendee already checked in at {checkin_time_str} ({gate_str}).", "ALREADY_CHECKED_IN"

        now = datetime.utcnow()
        booking.is_scanned = True
        booking.scanned_at = now
        booking.is_checked_in = True
        booking.is_checked_out = False
        booking.checkin_at = now
        effective_scanner = scanner_id or gate_name or "MAIN_GATE"
        booking.checkin_scanner_id = effective_scanner
        booking.scanner_id = effective_scanner
        booking.total_checkins = (booking.total_checkins or 0) + 1

        try:
            log_entry = AttendeeCheckinLog(
                booking_id=booking.id,
                ticket_code=booking.ticket_code,
                event_id=booking.event_id,
                action="CHECK_IN",
                gate_name=gate_name or "MAIN_GATE",
                scanner_id=scanner_id or "GATE_SCANNER",
                timestamp=now
            )
            db.session.add(log_entry)
        except Exception as err:
            print(f"[WARN] Failed to write checkin log: {err}")

        db.session.commit()
        return True, booking, "Check-in verified successfully. Access granted!", "ACCESS_GRANTED"

    @staticmethod
    def mark_booking_checkout(
        code_or_id: str | int,
        scanner_id: Optional[str] = None,
        gate_name: Optional[str] = None,
        expected_event_id: Optional[str] = None
    ):
        from app.models.booking import AttendeeCheckinLog
        result = UserRepository.get_booking_with_event(code_or_id)
        if not result:
            return False, None, "Invalid Ticket: Pass code not found in database", "NOT_FOUND"
        booking, event = result

        # Check Event Scoping
        if expected_event_id:
            try:
                import uuid
                expected_uuid = uuid.UUID(str(expected_event_id))
                if booking.event_id != expected_uuid:
                    return False, booking, f"Wrong Event: Ticket belongs to '{event.event_name}', not this event.", "WRONG_EVENT"
            except Exception:
                if str(booking.event_id) != str(expected_event_id):
                    return False, booking, f"Wrong Event: Ticket belongs to '{event.event_name}', not this event.", "WRONG_EVENT"

        if not booking.is_checked_in and booking.is_checked_out:
            checkout_time_str = booking.checkout_at.strftime("%I:%M %p") if booking.checkout_at else "earlier"
            return False, booking, f"Attendee has already checked out at {checkout_time_str}.", "ALREADY_CHECKED_OUT"

        if not booking.is_checked_in and not booking.is_scanned:
            return False, booking, "Cannot check out: Attendee has not checked in to this event yet.", "NOT_CHECKED_IN"

        now = datetime.utcnow()
        booking.is_checked_in = False
        booking.is_checked_out = True
        booking.checkout_at = now
        effective_scanner = scanner_id or gate_name or "EXIT_GATE"
        booking.checkout_scanner_id = effective_scanner
        booking.total_checkouts = (booking.total_checkouts or 0) + 1

        try:
            log_entry = AttendeeCheckinLog(
                booking_id=booking.id,
                ticket_code=booking.ticket_code,
                event_id=booking.event_id,
                action="CHECK_OUT",
                gate_name=gate_name or "EXIT_GATE",
                scanner_id=scanner_id or "EXIT_SCANNER",
                timestamp=now
            )
            db.session.add(log_entry)
        except Exception as err:
            print(f"[WARN] Failed to write checkout log: {err}")

        db.session.commit()
        return True, booking, "Check-out logged successfully. Exit recorded!", "CHECKED_OUT"

    @staticmethod
    def mark_booking_scanned(code_or_id: str | int, scanner_id: Optional[str] = None):
        success, booking, msg, code = UserRepository.mark_booking_checkin(code_or_id, scanner_id=scanner_id)
        return success, booking

    @staticmethod
    def get_user_bookings(email: Optional[str] = None, user_id: Optional[int] = None):
        from sqlalchemy import or_
        import qrcode
        import io
        import base64

        stmt = select(UserBookingDetails, EventDetails).join(
            EventDetails, UserBookingDetails.event_id == EventDetails.id
        )

        clean_email = email.strip().lower() if email else None
        if user_id and clean_email:
            stmt = stmt.where(or_(UserBookingDetails.user_id == user_id, UserBookingDetails.email == clean_email))
        elif user_id:
            stmt = stmt.where(UserBookingDetails.user_id == user_id)
        elif clean_email:
            stmt = stmt.where(UserBookingDetails.email == clean_email)
        else:
            return []

        stmt = stmt.order_by(UserBookingDetails.created_at.desc())
        results = db.session.execute(stmt).all()

        booking_list = []
        for booking, event in results:
            qr_text = booking.qr_data or booking.ticket_code or str(booking.id)
            qr_base64 = ""
            if qrcode is not None and qr_text:
                try:
                    qr = qrcode.QRCode(version=1, box_size=10, border=4)
                    qr.add_data(qr_text)
                    qr.make(fit=True)
                    img = qr.make_image(fill_color="black", back_color="white")
                    buffered = io.BytesIO()
                    img.save(buffered)
                    qr_base64 = base64.b64encode(buffered.getvalue()).decode()
                except Exception:
                    pass

            banner_img = getattr(event, "banner_url", getattr(event, "banner", getattr(event, "image", ""))) or ""
            if not banner_img:
                try:
                    from app.models.event import EventFile
                    bf = db.session.scalars(select(EventFile).where(EventFile.event_id == event.id, EventFile.file_type == "banner")).first()
                    if bf:
                        banner_img = bf.file_path or ""
                except Exception:
                    pass

            booking_list.append({
                "id": str(booking.id),
                "booking_id": str(booking.id),
                "ticket_code": booking.ticket_code or f"BME-{str(booking.id)[:8].upper()}",
                "event_id": str(event.id),
                "event_name": event.event_name,
                "eventName": event.event_name,
                "event_status": (event.status or "ACTIVE").upper(),
                "is_suspended": (event.status or "").upper() == "SUSPENDED",
                "category": event.category or "Live Event",
                "venue": event.venue or "Exhibition Venue",
                "address": event.address or "",
                "start_date": str(event.start_date or ""),
                "start_time": str(event.start_time or ""),
                "banner_url": banner_img,
                "name": booking.name,
                "email": booking.email,
                "phone": booking.phone,
                "food_preference": booking.food_preference,
                "is_scanned": booking.is_scanned,
                "is_checked_in": bool(booking.is_checked_in),
                "is_checked_out": bool(booking.is_checked_out),
                "checkin_at": booking.checkin_at.isoformat() if booking.checkin_at else None,
                "checkout_at": booking.checkout_at.isoformat() if booking.checkout_at else None,
                "total_checkins": booking.total_checkins or 0,
                "total_checkouts": booking.total_checkouts or 0,
                "created_at": str(booking.created_at or ""),
                "qr_code": qr_base64,
                "qr_data": qr_text
            })
        return booking_list

