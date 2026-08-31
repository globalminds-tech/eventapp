import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker, scoped_session

load_dotenv()

# Exclusive Supabase PostgreSQL Engine Setup
def create_supabase_engine():
    db_url = os.getenv("DATABASE_URL", "")
    
    if db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql://", 1)

    if not db_url or "sqlite" in db_url:
        raise RuntimeError("DATABASE_URL must be configured with a valid Supabase PostgreSQL connection string.")

    engine = create_engine(
        db_url,
        pool_pre_ping=True,
        pool_size=10,
        max_overflow=20
    )
    return engine

engine = create_supabase_engine()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db_session = scoped_session(SessionLocal)

Base = declarative_base()
Base.query = db_session.query_property()

class DBWrapper:
    Model = Base
    session = db_session

    @staticmethod
    def create_all():
        Base.metadata.create_all(bind=engine)

    @staticmethod
    def drop_all():
        Base.metadata.drop_all(bind=engine)

db = DBWrapper()

def get_db():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()

def ensure_schema_columns():
    """Auto-heals missing database columns using non-destructive ADD COLUMN IF NOT EXISTS."""
    try:
        with engine.connect() as conn:
            conn.execute(text("ALTER TABLE event_booking_details ADD COLUMN IF NOT EXISTS group_member_limit INTEGER DEFAULT 5;"))
            conn.execute(text("ALTER TABLE event_booking_details ADD COLUMN IF NOT EXISTS max_reentries VARCHAR(50) DEFAULT 'Unlimited';"))
            conn.execute(text("ALTER TABLE event_stalls ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1;"))
            conn.execute(text("ALTER TABLE event_stalls ADD COLUMN IF NOT EXISTS single_area_sqft FLOAT DEFAULT 100.0;"))
            conn.execute(text("ALTER TABLE event_stalls ADD COLUMN IF NOT EXISTS total_area_sqft FLOAT DEFAULT 100.0;"))
            conn.execute(text("ALTER TABLE venues ADD COLUMN IF NOT EXISTS total_area_sqft FLOAT DEFAULT 50000.0;"))
            conn.commit()
            print("[INFO] Supabase PostgreSQL schema columns verified.")
    except Exception as err:
        print(f"[WARN] Schema column verification note: {err}")
