import os
from sqlalchemy import text
from app.extensions.database import engine

try:
    with engine.connect() as conn:
        conn.execute(text("ALTER TABLE venues ADD COLUMN IF NOT EXISTS total_area_sqft FLOAT DEFAULT 50000.0;"))
        conn.commit()
        print("Successfully added total_area_sqft to venues table.")
except Exception as e:
    print("Error:", e)
