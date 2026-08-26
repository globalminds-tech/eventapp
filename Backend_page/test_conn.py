from app.extensions.database import engine, db_session
from sqlalchemy import text

try:
    with engine.connect() as conn:
        result = conn.execute(text("SELECT current_database(), current_user;")).fetchone()
        print("✅ Database Connection Successful!")
        print(f"Connected Host: {engine.url.host}")
        print(f"Database Name: {result[0]}")
        print(f"Database User: {result[1]}")
except Exception as e:
    print(f"❌ Connection Failed: {e}")
