import logging
from flask import jsonify
from app.common.exceptions import APIException

logger = logging.getLogger(__name__)

def register_error_handlers(app):
    @app.errorhandler(APIException)
    def handle_api_exception(error):
        response = jsonify(error.to_dict())
        response.status_code = error.status_code
        return response

    @app.errorhandler(404)
    def handle_404(error):
        return jsonify({"status": False, "message": "Resource not found"}), 404

    @app.errorhandler(500)
    def handle_500(error):
        logger.exception("Internal Server Error")
        return jsonify({"status": False, "message": "An internal server error occurred"}), 500
