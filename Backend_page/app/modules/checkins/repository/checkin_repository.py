from datetime import datetime
from app.extensions.database import db
from app.models.booking import UserBookingDetails

from typing import Optional
from app.modules.users.repository.user_repository import UserRepository

class CheckinRepository:
    @staticmethod
    def mark_scanned(code_or_id: str | int, scanner_id: Optional[str] = None):
        return UserRepository.mark_booking_scanned(code_or_id, scanner_id=scanner_id)
