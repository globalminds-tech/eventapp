from app.modules.organizer.services.organizer_service import OrganizerService

class OrganizerController:
    @staticmethod
    def upload_banner(contents: bytes, filename: str, content_type: str) -> dict:
        url = OrganizerService.upload_banner(contents, filename, content_type)
        return {"success": True, "url": url, "file_path": url}

    @staticmethod
    def create_event(event_data: dict, user_id = None) -> dict:
        return OrganizerService.create_event(event_data, user_id=user_id)

    @staticmethod
    def get_event(event_id: str) -> dict:
        return OrganizerService.get_event(event_id)

    @staticmethod
    def update_event(event_id: str, event_data: dict) -> dict:
        return OrganizerService.update_event(event_id, event_data)

    @staticmethod
    def get_venues(organizer_id = None) -> list[dict]:
        return OrganizerService.get_venues(organizer_id)

    @staticmethod
    def get_vendor_types() -> list[dict]:
        return OrganizerService.get_vendor_types()

    @staticmethod
    def get_vendor_names(vendor_type: str = None) -> list[dict]:
        return OrganizerService.get_vendor_names(vendor_type)

    @staticmethod
    def get_sponsors(organizer_id: str = None) -> list[dict]:
        return OrganizerService.get_sponsors(organizer_id)

    @staticmethod
    def get_vendors(organizer_id: str = None) -> list[dict]:
        return OrganizerService.get_vendors(organizer_id)

    @staticmethod
    def create_vendor(vendor_data: dict, user_id = None) -> dict:
        return OrganizerService.create_vendor(vendor_data, user_id)

    @staticmethod
    def create_sponsor(sponsor_data: dict, user_id = None) -> dict:
        return OrganizerService.create_sponsor(sponsor_data, user_id)

    @staticmethod
    def create_venue(venue_data: dict, user_id = None) -> dict:
        return OrganizerService.create_venue(venue_data, user_id)

    @staticmethod
    def create_policy(policy_data: dict, user_id = None) -> dict:
        return OrganizerService.create_policy(policy_data, user_id)

    @staticmethod
    def get_policies(organizer_id = None) -> list[dict]:
        return OrganizerService.get_policies(organizer_id)

    @staticmethod
    def submit_kyc(user_id, kyc_data: dict) -> dict:
        return OrganizerService.submit_kyc(user_id, kyc_data)
