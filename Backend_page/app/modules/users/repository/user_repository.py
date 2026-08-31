from typing import Optional
from datetime import datetime
from sqlalchemy import select
from app.extensions.database import db
from app.models.event import EventDetails
from app.models.booking import UserBookingDetails
from app.models.user import User

class UserRepository:
    @staticmethod
    def get_user_by_id(user_id: int) -> User | None:
        return db.session.get(User, user_id)

    @staticmethod
    def update_user_profile(user_id: int, data_dict: dict) -> User | None:
        user = UserRepository.get_user_by_id(user_id)
        if user:
            for key, value in data_dict.items():
                if value is not None and hasattr(user, key):
                    setattr(user, key, value)
            db.session.commit()
        return user

    @staticmethod
    def get_event_by_id(event_id: int) -> EventDetails | None:
        return db.session.get(EventDetails, event_id)

    @staticmethod
    def create_booking(event_id: int, name: str, email: str, phone: str, food_preference: str, qr_data: str = "PENDING", user_id: Optional[int] = None) -> UserBookingDetails:
        booking = UserBookingDetails(
            event_id=event_id,
            user_id=user_id,
            name=name,
            email=email.strip().lower(),
            phone=phone,
            food_preference=food_preference,
            qr_data=qr_data,
            is_scanned=False
        )
        db.session.add(booking)
        db.session.commit()
        return booking

    @staticmethod
    def update_qr_data(booking_id: int, qr_text: str) -> UserBookingDetails | None:
        booking = db.session.get(UserBookingDetails, booking_id)
        if booking:
            booking.qr_data = qr_text
            db.session.commit()
            return booking
        return None

    @staticmethod
    def get_booking_with_event(booking_id: int):
        stmt = select(UserBookingDetails, EventDetails).join(
            EventDetails, UserBookingDetails.event_id == EventDetails.id
        ).where(UserBookingDetails.id == booking_id)
        return db.session.execute(stmt).first()

    @staticmethod
    def mark_booking_scanned(booking_id: int):
        booking = db.session.get(UserBookingDetails, booking_id)
        if booking and not booking.is_scanned:
            booking.is_scanned = True
            booking.scanned_at = datetime.utcnow()
            db.session.commit()
            return True, booking
        return False, booking

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
                "id": booking.id,
                "booking_id": booking.id,
                "event_id": event.id,
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
