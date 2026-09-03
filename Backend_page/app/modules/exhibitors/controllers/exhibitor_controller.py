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
    def get_user_bookings(user_id, host_url: str = ""):
        bookings = ExhibitorService.get_user_bookings(user_id, host_url)
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
