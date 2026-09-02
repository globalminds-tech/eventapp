import logging
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from pydantic import ValidationError
from app.exceptions.api_error import ApiError
from app.extensions.database import db

logger = logging.getLogger(__name__)

def get_cors_headers(request: Request) -> dict:
    origin = request.headers.get("origin") or "http://localhost:5173"
    return {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With, Accept, Origin",
    }

def safe_rollback():
    """Safely roll back and clear failed SQLAlchemy sessions."""
    try:
        db.session.rollback()
        db.session.remove()
    except Exception as e:
        logger.warning(f"Session rollback notice: {e}")

def register_error_handlers(app: FastAPI):
    @app.exception_handler(ApiError)
    async def api_error_handler(request: Request, exc: ApiError):
        safe_rollback()
        return JSONResponse(
            status_code=exc.status_code,
            headers=get_cors_headers(request),
            content={
                "success": False,
                "message": exc.message
            }
        )

    @app.exception_handler(ValidationError)
    async def validation_error_handler(request: Request, exc: ValidationError):
        safe_rollback()
        errors = exc.errors()
        message = errors[0].get("msg", "Validation error") if errors else "Invalid request payload"
        return JSONResponse(
            status_code=422,
            headers=get_cors_headers(request),
            content={
                "success": False,
                "message": message,
                "details": errors
            }
        )

    @app.exception_handler(Exception)
    async def generic_exception_handler(request: Request, exc: Exception):
        safe_rollback()
        logger.error(f"Unhandled exception on {request.url}: {exc}", exc_info=True)
        return JSONResponse(
            status_code=500,
            headers=get_cors_headers(request),
            content={
                "success": False,
                "message": f"Server error: {str(exc)}"
            }
        )
