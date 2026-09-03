import os
import sys

# Disable __pycache__ generation automatically
sys.dont_write_bytecode = True

from app import create_app
from app.extensions.database import db
from app.modules.admin.repository.admin_repository import AdminRepository
from app.utils.slug import backfill_missing_slugs

app = create_app()

@app.on_event("startup")
def on_startup():
    try:
        db.create_all()
        AdminRepository.create_default_superuser()
        backfill_missing_slugs(db.session)
    except Exception as e:
        print(f"Notice: Startup check: {e}")
    finally:
        db.session.remove()


@app.get("/", tags=["Health"])
def root():
    return {
        "success": True,
        "message": "BookMyEvent FastAPI Backend is Running!",
        "docs_url": "/docs",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=5001, reload=True)