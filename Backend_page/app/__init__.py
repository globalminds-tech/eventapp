import os
import sys

# Disable __pycache__ generation automatically
sys.dont_write_bytecode = True

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.extensions.database import db
from app.exceptions.handlers import register_error_handlers

from app.modules.auth import auth_router
from app.modules.users import users_router
from app.modules.events import event_router
from app.modules.bookings import booking_router
from app.modules.exhibitors import exhibitor_router
from app.modules.stalls import stall_router
from app.modules.payments import payment_router
from app.modules.checkins import checkin_router
from app.modules.admin import admin_router
from app.modules.chatbot import chatbot_router

def create_app() -> FastAPI:
    app = FastAPI(
        title="BookMyEvent Mobile REST API",
        description="High-performance domain-driven backend for BookMyEvent powered by FastAPI, SQLAlchemy & PostgreSQL.",
        version="1.0.0",
        docs_url="/docs",
        redoc_url="/redoc"
    )

    # Enable CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Register Exception Handlers
    register_error_handlers(app)

    # Mount static uploads directory if present
    basedir = os.path.abspath(os.path.dirname(__file__))
    uploads_path = os.path.join(basedir, "uploads")
    os.makedirs(uploads_path, exist_ok=True)
    app.mount("/uploads", StaticFiles(directory=uploads_path), name="uploads")

    # Include all 10 FastAPI Domain Routers
    app.include_router(auth_router)
    app.include_router(users_router)
    app.include_router(event_router)
    app.include_router(booking_router)
    app.include_router(exhibitor_router)
    app.include_router(stall_router)
    app.include_router(payment_router)
    app.include_router(checkin_router)
    app.include_router(admin_router)
    app.include_router(chatbot_router)

    return app