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
        return db.session.get(EventDetails, event_id)

    @staticmethod
    def generate_ticket_code(event_id) -> str:
        import uuid
        hex_token = uuid.uuid4().hex[:8].upper()
        prefix = str(event_id)[:6]
        return f"BME-{prefix}-{hex_token}"

    @staticmethod
    def create_booking(event_id, name: str, email: str, phone: str, food_preference: str, qr_data: str = "PENDING", user_id = None) -> UserBookingDetails:
        ticket_code = UserRepository.generate_ticket_code(event_id)
        booking = UserBookingDetails(
            event_id=event_id,
            user_id=user_id,
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
    def get_booking_with_event(code_or_id: str):
        from sqlalchemy import or_
        import uuid
        identifier_str = str(code_or_id).strip()
        
        stmt = select(UserBookingDetails, EventDetails).join(
            EventDetails, UserBookingDetails.event_id == EventDetails.id
        )
        
        # Check if identifier is valid UUID
        try:
            parsed_uuid = uuid.UUID(identifier_str)
            stmt = stmt.where(or_(UserBookingDetails.ticket_code == identifier_str, UserBookingDetails.id == parsed_uuid))
        except (ValueError, AttributeError):
            stmt = stmt.where(UserBookingDetails.ticket_code == identifier_str)
            
        return db.session.execute(stmt).first()

    @staticmethod
    def mark_booking_checkin(code_or_id: str | int, scanner_id: Optional[str] = None, gate_name: Optional[str] = None):
        from app.models.booking import AttendeeCheckinLog
        result = UserRepository.get_booking_with_event(code_or_id)
        if not result:
            return False, None, "Booking not found"
        booking, event = result

        now = datetime.utcnow()
        booking.is_scanned = True
        booking.scanned_at = now
        booking.is_checked_in = True
        booking.is_checked_out = False
        booking.checkin_at = now
        if scanner_id:
            booking.checkin_scanner_id = scanner_id
            booking.scanner_id = scanner_id
        booking.total_checkins = (booking.total_checkins or 0) + 1

        try:
            log_entry = AttendeeCheckinLog(
                booking_id=booking.id,
                ticket_code=booking.ticket_code,
                event_id=booking.event_id,
                action="CHECK_IN",
                gate_name=gate_name,
                scanner_id=scanner_id,
                timestamp=now
            )
            db.session.add(log_entry)
        except Exception as err:
            print(f"[WARN] Failed to write checkin log: {err}")

        db.session.commit()
        return True, booking, "Check-in successful"

    @staticmethod
    def mark_booking_checkout(code_or_id: str | int, scanner_id: Optional[str] = None, gate_name: Optional[str] = None):
        from app.models.booking import AttendeeCheckinLog
        result = UserRepository.get_booking_with_event(code_or_id)
        if not result:
            return False, None, "Booking not found"
        booking, event = result

        if not booking.is_checked_in and booking.is_checked_out:
            return False, booking, "Attendee has already checked out"

        now = datetime.utcnow()
        booking.is_checked_in = False
        booking.is_checked_out = True
        booking.checkout_at = now
        if scanner_id:
            booking.checkout_scanner_id = scanner_id
        booking.total_checkouts = (booking.total_checkouts or 0) + 1

        try:
            log_entry = AttendeeCheckinLog(
                booking_id=booking.id,
                ticket_code=booking.ticket_code,
                event_id=booking.event_id,
                action="CHECK_OUT",
                gate_name=gate_name,
                scanner_id=scanner_id,
                timestamp=now
            )
            db.session.add(log_entry)
        except Exception as err:
            print(f"[WARN] Failed to write checkout log: {err}")

        db.session.commit()
        return True, booking, "Check-out successful"

    @staticmethod
    def mark_booking_scanned(code_or_id: str | int, scanner_id: Optional[str] = None):
        success, booking, msg = UserRepository.mark_booking_checkin(code_or_id, scanner_id=scanner_id)
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
            qr_text = booking.qr_data or ""
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
                "event_id": str(event.id),
                "event_name": event.event_name,
                "eventName": event.event_name,
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
                "created_at": str(booking.created_at or ""),
                "qr_code": qr_base64,
                "qr_data": qr_text
            })
        return booking_list
