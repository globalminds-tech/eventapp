
import os
import sys

# Ensure app is in python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy import text
from app.extensions.database import engine

def clean_event_tables():
    """
    Safely truncates/clears all event-related database tables for a fresh clean slate.
    """
    tables = [
        "event_booking_details",
        "event_layout",
        "event_stalls",
        "event_vendors",
        "event_sponsors",
        "event_terms",
        "event_files",
        "event_food_items",
        "event_vehicle_details",
        "event_vehicle_addons",
        "event_guests",
        "event_programs",
        "event_details_table"
    ]

    print("Cleaning all event-related database tables...")
    with engine.connect() as conn:
        for t in tables:
            try:
                conn.execute(text(f"TRUNCATE TABLE {t} RESTART IDENTITY CASCADE;"))
                conn.commit()
                print(f"  ✓ Truncated table: {t}")
            except Exception:
                try:
                    conn.rollback()
                    conn.execute(text(f"DELETE FROM {t};"))
                    conn.commit()
                    print(f"  ✓ Deleted all rows from table: {t}")
                except Exception as ex:
                    conn.rollback()
                    print(f"  Notice clearing {t}: {ex}")

    print("Database event tables clean slate completed successfully!")

if __name__ == "__main__":
    clean_event_tables()
