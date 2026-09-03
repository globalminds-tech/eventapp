from app.exceptions.api_error import ApiError
from app.modules.stalls.repository.stall_repository import StallRepository

class StallService:
    @staticmethod
    def get_event_stalls(event_id) -> dict:
        stalls = StallRepository.get_stalls_by_event(event_id)
        amenities = StallRepository.get_amenities_by_event(event_id)

        stalls_data = [s.to_dict() if hasattr(s, "to_dict") else {"id": str(s.id), "stall_name": getattr(s, "stall_name", None), "price": getattr(s, "price", None)} for s in stalls]
        amenities_data = [a.to_dict() if hasattr(a, "to_dict") else {"id": str(a.id), "name": getattr(a, "name", None)} for a in amenities]

        return {
            "stalls": stalls_data,
            "amenities": amenities_data
        }
