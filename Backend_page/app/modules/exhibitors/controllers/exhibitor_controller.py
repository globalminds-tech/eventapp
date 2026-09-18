from app.modules.exhibitors.services.exhibitor_service import ExhibitorService

class ExhibitorController:
    @staticmethod
    def book_stall(form_data: dict, file_obj=None, upload_folder: str = "uploads"):
        result = ExhibitorService.book_stall(form_data, file_obj, upload_folder)
        return {
            "success": True,
            "data": result
        }

    @staticmethod
    def get_user_bookings(user_id, host_url: str = "", status: str = None, search: str = None):
        bookings = ExhibitorService.get_user_bookings(user_id, host_url, status=status, search=search)
        return {
            "success": True,
            "data": bookings
        }

    @staticmethod
    def get_booking_by_id(booking_id, host_url: str = ""):
        booking = ExhibitorService.get_booking_by_id(booking_id, host_url)
        return {
            "success": True,
            "data": booking
        }

    @staticmethod
    def add_visitor_lead(data: dict):
        result = ExhibitorService.add_visitor_lead(data)
        return {
            "success": True,
            "data": result
        }

    @staticmethod
    def get_visitor_leads(event_id: str, user_id: str, search: str = None):
        leads = ExhibitorService.get_visitor_leads(event_id, user_id, search=search)
        return {
            "success": True,
            "data": leads
        }

    @staticmethod
    def get_event_booking_status(event_id: str, user_id: str = None, email: str = None):
        res = ExhibitorService.get_event_booking_status(event_id, user_id, email)
        return {
            "success": True,
            "data": res
        }
