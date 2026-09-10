import logging
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from pydantic import ValidationError
from app.exceptions.api_error import ApiError
from app.extensions.database import db

from sqlalchemy.exc import OperationalError, InterfaceError, DBAPIError

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
    except Exception as e:
        logger.debug(f"Session rollback notice: {e}")
    finally:
        try:
            db.session.remove()
        except Exception:
            pass

def register_error_handlers(app: FastAPI):
    @app.exception_handler(OperationalError)
    @app.exception_handler(InterfaceError)
    @app.exception_handler(DBAPIError)
    async def db_connection_error_handler(request: Request, exc: Exception):
        safe_rollback()
        logger.error(f"Database connection interrupted on {request.url}: {exc}")
        return JSONResponse(
            status_code=503,
            headers=get_cors_headers(request),
            content={
                "success": False,
                "error_code": "DB_CONNECTION_LOST",
                "message": "Database is temporarily unreachable. Please check your internet connection or try again."
            }
        )

    @app.exception_handler(ApiError)
    async def api_error_handler(request: Request, exc: ApiError):
        safe_rollback()
        content = {
            "success": False,
            "message": exc.message
        }
        if getattr(exc, "data", None) is not None:
            content["data"] = exc.data
        return JSONResponse(
            status_code=exc.status_code,
            headers=get_cors_headers(request),
            content=content
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
