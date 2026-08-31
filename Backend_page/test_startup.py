import time

print("[1] Importing app.extensions.database...")
import app.extensions.database
print("[2] Importing app.exceptions.handlers...")
import app.exceptions.handlers
print("[3] Importing routers...")
import app.modules.auth
import app.modules.users
import app.modules.events
import app.modules.organizer
import app.modules.bookings
import app.modules.exhibitors
import app.modules.stalls
import app.modules.payments
import app.modules.checkins
import app.modules.admin
import app.modules.chatbot
print("[4] Calling create_app()...")
from app import create_app
app = create_app()
print("[5] app created. Now testing startup tasks...")

print("[5.1] ensure_schema_columns...")
from app.extensions.database import ensure_schema_columns, db
ensure_schema_columns()
print("[5.2] AdminRepository.create_default_superuser...")
from app.modules.admin.repository.admin_repository import AdminRepository
AdminRepository.create_default_superuser()
print("[5.3] backfill_missing_slugs...")
from app.utils.slug import backfill_missing_slugs
backfill_missing_slugs(db.session)
print("[6] DONE ALL!")
