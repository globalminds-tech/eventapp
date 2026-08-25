import logging
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from pydantic import ValidationError
from app.exceptions.api_error import ApiError

logger = logging.getLogger(__name__)

def register_error_handlers(app: FastAPI):
    @app.exception_handler(ApiError)
    async def api_error_handler(request: Request, exc: ApiError):
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "success": False,
                "message": exc.message
            }
        )

    @app.exception_handler(ValidationError)
    async def validation_error_handler(request: Request, exc: ValidationError):
        errors = exc.errors()
        message = errors[0].get("msg", "Validation error") if errors else "Invalid request payload"
        return JSONResponse(
            status_code=422,
            content={
                "success": False,
                "message": message,
                "details": errors
            }
        )

    @app.exception_handler(Exception)
    async def generic_exception_handler(request: Request, exc: Exception):
        logger.error(f"Unhandled exception on {request.url}: {exc}", exc_info=True)
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "message": "An unexpected server error occurred"
            }
        )
