from app.modules.admin.services.admin_service import AdminService

class AdminController:
    @staticmethod
    def get_events(
        host_url: str = "",
        organizer_id: str = None,
        only_approved: bool = False,
        search: str = None,
        status: str = None,
        page: int = None,
        limit: int = None,
        sort_by: str = "created_at",
        sort_order: str = "desc"
    ):
        res = AdminService.get_events(
            host_url=host_url,
            organizer_id=organizer_id,
            only_approved=only_approved,
            search=search,
            status=status,
            page=page,
            limit=limit,
            sort_by=sort_by,
            sort_order=sort_order
        )
        if isinstance(res, dict) and "pagination" in res:
            return {
                "success": True,
                "data": res.get("events", []),
                "pagination": res.get("pagination")
            }
        return {
            "success": True,
            "data": res
        }

    @staticmethod
    def update_event_status(event_id, raw_data: dict):
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
    def update_category(cat_id, raw_data: dict):
        category = AdminService.update_category(cat_id, raw_data)
        return {
            "success": True,
            "data": category
        }

    @staticmethod
    def delete_category(cat_id):
        result = AdminService.delete_category(cat_id)
        return {
            "success": True,
            "data": result
        }

    @staticmethod
    def get_pending_organizers():
        organizers = AdminService.get_pending_organizers()
        return {
            "success": True,
            "data": organizers
        }

    @staticmethod
    def update_organizer_kyc_status(user_id, raw_data: dict):
        result = AdminService.update_organizer_kyc_status(user_id, raw_data)
        return {
            "success": True,
            "data": result
        }

    @staticmethod
    def get_dashboard_stats(period: str = "30d"):
        stats = AdminService.get_dashboard_stats(period=period)
        return {
            "success": True,
            "data": stats
        }

    @staticmethod
    def get_all_users(
        search: str = None,
        role: str = None,
        kyc_status: str = None,
        page: int = None,
        limit: int = None,
        sort_by: str = "created_at",
        sort_order: str = "desc"
    ):
        res = AdminService.get_all_users(
            search=search,
            role=role,
            kyc_status=kyc_status,
            page=page,
            limit=limit,
            sort_by=sort_by,
            sort_order=sort_order
        )
        if isinstance(res, dict) and "pagination" in res:
            return {
                "success": True,
                "data": res.get("users", []),
                "pagination": res.get("pagination")
            }
        return {
            "success": True,
            "data": res
        }

    @staticmethod
    def get_category_requests():
        requests = AdminService.get_category_requests()
        return {
            "success": True,
            "data": requests
        }

    @staticmethod
    def submit_category_request(raw_data: dict):
        result = AdminService.submit_category_request(raw_data)
        return {
            "success": True,
            "data": result
        }

    @staticmethod
    def update_category_request_status(request_id, raw_data: dict):
        result = AdminService.update_category_request_status(request_id, raw_data)
        return {
            "success": True,
            "data": result
        }
