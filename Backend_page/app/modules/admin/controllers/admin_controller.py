from app.modules.admin.services.admin_service import AdminService

class AdminController:
    @staticmethod
    def get_events(host_url: str = ""):
        events = AdminService.get_events(host_url)
        return {
            "success": True,
            "data": events
        }

    @staticmethod
    def update_event_status(event_id: int, raw_data: dict):
        result = AdminService.update_event_status(event_id, raw_data)
        return {
            "success": True,
            "data": result
        }

    @staticmethod
    def get_categories():
        categories = AdminService.get_categories()
        return {
            "success": True,
            "data": categories
        }

    @staticmethod
    def create_category(raw_data: dict):
        category = AdminService.create_category(raw_data)
        return {
            "success": True,
            "data": category
        }

    @staticmethod
    def get_pending_organizers():
        organizers = AdminService.get_pending_organizers()
        return {
            "success": True,
            "data": organizers
        }

    @staticmethod
    def update_organizer_kyc_status(user_id: int, raw_data: dict):
        result = AdminService.update_organizer_kyc_status(user_id, raw_data)
        return {
            "success": True,
            "data": result
        }
