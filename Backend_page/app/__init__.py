import os
import sys

# Disable __pycache__ generation automatically
sys.dont_write_bytecode = True

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.extensions.database import db
from app.exceptions.handlers import register_error_handlers

from app.modules.auth import auth_router, legacy_auth_router, root_auth_router
from app.modules.users import users_router
from app.modules.events import event_router
from app.modules.organizer import organizer_router, root_organizer_router
from app.modules.bookings import booking_router
from app.modules.exhibitors import exhibitor_router
from app.modules.stalls import stall_router
from app.modules.payments import payment_router
from app.modules.checkins import checkin_router
from app.modules.admin import admin_router, root_admin_router
from app.modules.chatbot import chatbot_router

def create_app() -> FastAPI:
    app = FastAPI(
        title="BookMyEvent Mobile REST API",
        description="High-performance domain-driven backend for BookMyEvent powered by FastAPI, SQLAlchemy & PostgreSQL.",
        version="1.0.0",
        docs_url="/docs",
        redoc_url="/redoc"
    )

    # Enable Production CORS with Credential Support
    app.add_middleware(
        CORSMiddleware,
        allow_origin_regex=r"https?://.*",
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Automatic SQLAlchemy session teardown & rollback middleware
    @app.middleware("http")
    async def db_session_middleware(request: Request, call_next):
        try:
            response = await call_next(request)
            return response
        except Exception as exc:
            try:
                db.session.rollback()
            except Exception:
                pass
            raise exc
        finally:
            try:
                db.session.remove()
            except Exception:
                pass

    # Register Exception Handlers
    register_error_handlers(app)

    # Mount static uploads directory if present
    basedir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    uploads_path = os.path.join(basedir, "uploads")
    os.makedirs(uploads_path, exist_ok=True)
    app.mount("/uploads", StaticFiles(directory=uploads_path), name="uploads")

    # Include all FastAPI Domain Routers
    app.include_router(auth_router)
    app.include_router(legacy_auth_router)
    app.include_router(root_auth_router)
    app.include_router(users_router)
    app.include_router(event_router)
    app.include_router(organizer_router)
    app.include_router(root_organizer_router)
    app.include_router(booking_router)
    app.include_router(exhibitor_router)
    app.include_router(stall_router)
    app.include_router(payment_router)
    app.include_router(checkin_router)
    app.include_router(admin_router)
    app.include_router(root_admin_router)
    app.include_router(chatbot_router)

    return app