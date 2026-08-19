import logging
from flask import request

logger = logging.getLogger("app.access")

def register_logging_middleware(app):
    @app.after_request
    def log_request_info(response):
        logger.info(f"{request.method} {request.path} - {response.status_code}")
        return response
