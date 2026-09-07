from datetime import datetime
from typing import Optional
from sqlalchemy import select, func, or_, desc
from app.extensions.database import db
from app.models.booking import UserBookingDetails, AttendeeCheckinLog
from app.models.event import EventDetails
from app.models.meal import EventFoodItem
from app.models.parking import EventVehicleAddon
from app.modules.users.repository.user_repository import UserRepository

class CheckinRepository:
    @staticmethod
    def mark_scanned(code_or_id: str | int, scanner_id: Optional[str] = None):
        return UserRepository.mark_booking_scanned(code_or_id, scanner_id=scanner_id)

    @staticmethod
    def get_events_checkin_summary(organizer_id: Optional[str] = None):
        stmt = select(EventDetails).order_by(desc(EventDetails.created_at))
        if organizer_id:
            stmt = stmt.where(or_(EventDetails.user_id == organizer_id, EventDetails.organization_id == organizer_id))
        
        events = db.session.scalars(stmt).all()
        results = []
        for e in events:
            total_bookings = db.session.scalar(
                select(func.count(UserBookingDetails.id)).where(UserBookingDetails.event_id == e.id)
            ) or 0
            arrived = db.session.scalar(
                select(func.count(UserBookingDetails.id)).where(
                    UserBookingDetails.event_id == e.id,
                    or_(UserBookingDetails.is_checked_in == True, UserBookingDetails.is_scanned == True)
                )
            ) or 0
            departed = db.session.scalar(
                select(func.count(UserBookingDetails.id)).where(
                    UserBookingDetails.event_id == e.id,
                    UserBookingDetails.is_checked_out == True
                )
            ) or 0
            present = max(0, arrived - departed)

            results.append({
                "id": str(e.id),
                "event_code": e.event_code or f"EVT-{str(e.id)[:6].upper()}",
                "event_name": e.event_name or "Untitled Event",
                "start_date": str(e.start_date) if e.start_date else "",
                "end_date": str(e.end_date) if e.end_date else "",
                "total_bookings": total_bookings,
                "arrived": arrived,
                "departed": departed,
                "present": present,
                "status": e.status or "Active"
            })
        return results

    @staticmethod
    def get_event_attendees(event_id: str):
        stmt = select(UserBookingDetails).where(UserBookingDetails.event_id == event_id).order_by(UserBookingDetails.created_at.desc())
        bookings = db.session.scalars(stmt).all()
        data = []
        for b in bookings:
            data.append({
                "id": str(b.id),
                "visitor_code": b.ticket_code or f"PAS-{str(b.id)[:6].upper()}",
                "ticket_code": b.ticket_code or f"PAS-{str(b.id)[:6].upper()}",
                "name": b.name or "Attendee",
                "phone": b.phone or "N/A",
                "email": b.email or "",
                "food_preference": b.food_preference or "None",
                "checkin_time": b.checkin_at.strftime("%I:%M %p") if b.checkin_at else "",
                "checkout_time": b.checkout_at.strftime("%I:%M %p") if b.checkout_at else "",
                "is_checked_in": bool(b.is_checked_in),
                "is_checked_out": bool(b.is_checked_out),
                "total_checkins": b.total_checkins or 0,
                "total_checkouts": b.total_checkouts or 0,
                "created_at": b.created_at.isoformat() if b.created_at else ""
            })
        return data

    @staticmethod
    def get_event_checkin_logs(event_id: str, limit: int = 30):
        import uuid
        try:
            parsed_id = uuid.UUID(str(event_id))
        except Exception:
            parsed_id = event_id

        stmt = (
            select(AttendeeCheckinLog, UserBookingDetails.name, UserBookingDetails.food_preference)
            .outerjoin(UserBookingDetails, AttendeeCheckinLog.booking_id == UserBookingDetails.id)
            .where(AttendeeCheckinLog.event_id == parsed_id)
            .order_by(AttendeeCheckinLog.timestamp.desc())
            .limit(limit)
        )
        records = db.session.execute(stmt).all()
        logs = []
        for log, attendee_name, food_pref in records:
            logs.append({
                "id": str(log.id),
                "booking_id": str(log.booking_id),
                "ticket_code": log.ticket_code,
                "attendee_name": attendee_name or "Attendee",
                "food_preference": food_pref or "None",
                "action": log.action,
                "gate_name": log.gate_name or "MAIN_GATE",
                "scanner_id": log.scanner_id or "GATE_SCANNER",
                "timestamp": log.timestamp.strftime("%I:%M:%S %p") if log.timestamp else "",
                "created_at": log.timestamp.isoformat() if log.timestamp else ""
            })
        return logs


    @staticmethod
    def get_food_checkin_summary(organizer_id: Optional[str] = None):
        stmt = select(EventDetails).order_by(desc(EventDetails.created_at))
        if organizer_id:
            stmt = stmt.where(or_(EventDetails.user_id == organizer_id, EventDetails.organization_id == organizer_id))
        
        events = db.session.scalars(stmt).all()
        event_list = []
        total_tokens_all = 0
        total_redeemed_all = 0

        for e in events:
            total_tokens = db.session.scalar(
                select(func.count(UserBookingDetails.id)).where(
                    UserBookingDetails.event_id == e.id,
                    UserBookingDetails.food_preference != 'None'
                )
            ) or 0
            scanned_tokens = db.session.scalar(
                select(func.count(UserBookingDetails.id)).where(
                    UserBookingDetails.event_id == e.id,
                    UserBookingDetails.food_preference != 'None',
                    or_(UserBookingDetails.is_checked_in == True, UserBookingDetails.is_scanned == True)
                )
            ) or 0

            # Fallback to total attendees if specific food_preference is not selected
            if total_tokens == 0 and e.food:
                total_tokens = db.session.scalar(
                    select(func.count(UserBookingDetails.id)).where(UserBookingDetails.event_id == e.id)
                ) or 0
                scanned_tokens = db.session.scalar(
                    select(func.count(UserBookingDetails.id)).where(
                        UserBookingDetails.event_id == e.id,
                        or_(UserBookingDetails.is_checked_in == True, UserBookingDetails.is_scanned == True)
                    )
                ) or 0

            total_tokens_all += total_tokens
            total_redeemed_all += scanned_tokens

            event_list.append({
                "id": str(e.id),
                "code": e.event_code or f"EVT-{str(e.id)[:6].upper()}",
                "name": e.event_name or "Event",
                "startDate": str(e.start_date) if e.start_date else "",
                "endDate": str(e.end_date) if e.end_date else "",
                "totalFoodTokens": total_tokens,
                "scannedTokens": scanned_tokens,
                "status": e.status or "Active"
            })

        return {
            "totalFoodTokens": total_tokens_all,
            "mealsServed": total_redeemed_all,
            "pendingRedemptions": max(0, total_tokens_all - total_redeemed_all),
            "events": event_list
        }

    @staticmethod
    def get_addon_checkins(organizer_id: Optional[str] = None):
        stmt = select(EventVehicleAddon, EventDetails).join(EventDetails, EventVehicleAddon.event_id == EventDetails.id).order_by(desc(EventVehicleAddon.created_at))
        records = db.session.execute(stmt).all()
        data = []
        idx = 1
        for addon, evt in records:
            data.append({
                "id": str(addon.id),
                "addon": addon.addon_name or "Add-on",
                "code": f"AD-{str(addon.id)[:6].upper()}",
                "visitor": evt.event_name or "General Attendee",
                "time": addon.created_at.strftime("%I:%M %p") if addon.created_at else "",
                "status": "Active"
            })
            idx += 1
        return data

