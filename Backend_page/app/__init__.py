import os
import sys

# Disable __pycache__ generation automatically
sys.dont_write_bytecode = True

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.extensions.database import db, db_session
from app.exceptions.handlers import register_error_handlers

from app.modules.auth import auth_router, legacy_auth_router, root_auth_router
from app.modules.users import users_router, root_users_router
from app.modules.events import event_router, root_events_router
from app.modules.organizer import organizer_router, root_organizer_router
from app.modules.bookings import booking_router
from app.modules.exhibitors import exhibitor_router
from app.modules.stalls import stall_router
from app.modules.payments import payment_router
from app.modules.checkins import checkin_router
from app.modules.admin import admin_router, root_admin_router
from app.modules.chatbot import chatbot_router
from app.modules.rbac import rbac_router

def create_app() -> FastAPI:
    app = FastAPI(
        title="BookMyEvent Mobile REST API",
        description="High-performance domain-driven backend for BookMyEvent powered by FastAPI, SQLAlchemy & PostgreSQL.",
        version="1.0.0",
        docs_url="/docs",
        redoc_url="/redoc"
    )

    # Universal Production CORS with Credential Support
    ALLOWED_ORIGINS = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:5001",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5001",
    ]

    app.add_middleware(
        CORSMiddleware,
        allow_origins=ALLOWED_ORIGINS,
        allow_origin_regex=r"http://(localhost|127\.0\.0\.1)(:\d+)?",
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["*"],
    )

    # Database Session Cleanup Middleware
    @app.middleware("http")
    async def db_session_middleware(request: Request, call_next):
        try:
            response = await call_next(request)
            return response
        finally:
            db_session.remove()



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
    app.include_router(root_users_router)
    app.include_router(event_router)
    app.include_router(root_events_router)
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
    app.include_router(rbac_router)

    return app