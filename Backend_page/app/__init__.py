import os
import sys

# Configure sys.pycache_prefix so Python stores all bytecode in .python_cache
if getattr(sys, "pycache_prefix", None) is None:
    workspace_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    cache_dir = os.path.join(workspace_root, ".python_cache")
    os.makedirs(cache_dir, exist_ok=True)
    sys.pycache_prefix = cache_dir

from flask import Flask
from flask_cors import CORS
from werkzeug.middleware.proxy_fix import ProxyFix

from app.config import config_by_name
from app.extensions import db, jwt, redis_client
from app.middleware import register_error_handlers, register_logging_middleware

# Import Legacy & Modular Blueprints
from app.auth.routes import auth_bp
from app.super_admin.routes import super_admin_bp
from app.auth.otp_routes import otp_bp
from app.users.booking_routes import user_bp
from app.exhibitor.exhibitor_routers import exhibitor_bp
from app.super_user.superuser_routers import superuser_bp
from app.chatbot import chatbot_bp

# Import Modular Monolith Blueprints
from app.modules.auth import auth_module_bp
from app.modules.events import events_module_bp
from app.modules.users import users_module_bp
from app.modules.exhibitors import exhibitors_module_bp
from app.modules.stalls import stalls_module_bp
from app.modules.bookings import bookings_module_bp
from app.modules.tickets import tickets_module_bp
from app.modules.payments import payments_module_bp
from app.modules.checkins import checkins_module_bp
from app.modules.admin import admin_module_bp
from app.modules.chatbot import chatbot_module_bp

def create_app(config_name=None):
    if config_name is None:
        config_name = os.environ.get('FLASK_ENV', 'default')

    basedir = os.path.abspath(os.path.dirname(__file__))
    app = Flask(__name__, static_url_path='/uploads', static_folder=os.path.join(basedir, 'uploads'))

    # Load configuration
    app.config.from_object(config_by_name[config_name])

    # CORS configuration
    CORS(app)

    # Proxy headers support (essential for HTTPS / AWS load balancers)
    app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1, x_prefix=1)

    # Initialize Extensions
    db.init_app(app)
    jwt.init_app(app)
    redis_client.init_app(app)

    # Register Middleware & Error Handlers
    register_error_handlers(app)
    register_logging_middleware(app)

    # Register Legacy Blueprints (Preserving exact frontend URL prefixes)
    app.register_blueprint(auth_bp, url_prefix="/auth")
    app.register_blueprint(super_admin_bp, url_prefix="/superadmin")
    app.register_blueprint(superuser_bp, url_prefix="/superuser")
    app.register_blueprint(otp_bp, url_prefix="/otp")
    app.register_blueprint(user_bp, url_prefix="/user")
    app.register_blueprint(exhibitor_bp, url_prefix="/exhibitor")
    app.register_blueprint(chatbot_bp, url_prefix="/chatbot")

    # Register Modular Monolith API Blueprints
    app.register_blueprint(auth_module_bp, url_prefix="/api/auth")
    app.register_blueprint(events_module_bp, url_prefix="/api/events")
    app.register_blueprint(users_module_bp, url_prefix="/api/users")
    app.register_blueprint(exhibitors_module_bp, url_prefix="/api/exhibitors")
    app.register_blueprint(stalls_module_bp, url_prefix="/api/stalls")
    app.register_blueprint(bookings_module_bp, url_prefix="/api/bookings")
    app.register_blueprint(tickets_module_bp, url_prefix="/api/tickets")
    app.register_blueprint(payments_module_bp, url_prefix="/api/payments")
    app.register_blueprint(checkins_module_bp, url_prefix="/api/checkins")
    app.register_blueprint(admin_module_bp, url_prefix="/api/admin")
    app.register_blueprint(chatbot_module_bp, url_prefix="/api/chatbot")

    return app