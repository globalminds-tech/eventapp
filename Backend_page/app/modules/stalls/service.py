from app.modules.stalls.repository import StallRepository

class StallService:
    @staticmethod
    def get_event_stalls(event_id: int):
        stalls = StallRepository.get_stalls_by_event(event_id)
        amenities = StallRepository.get_amenities_by_event(event_id)
        return {"status": True, "data": {"stalls": [s.id for s in stalls], "amenities": [a.id for a in amenities]}}
