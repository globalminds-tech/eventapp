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
        pool_recycle=300,
        pool_size=25,
        max_overflow=35
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
    """Auto-heals missing database columns safely without blocking app startup on table locks."""
    columns_to_check = [
        ("event_booking_details", "group_member_limit", "INTEGER DEFAULT 5"),
        ("event_booking_details", "max_reentries", "VARCHAR(50) DEFAULT 'Unlimited'"),
        ("event_stalls", "quantity", "INTEGER DEFAULT 1"),
        ("event_stalls", "single_area_sqft", "FLOAT DEFAULT 100.0"),
        ("event_stalls", "total_area_sqft", "FLOAT DEFAULT 100.0"),
        ("user_booking_details", "user_id", "INT"),
        ("user_booking_details", "ticket_code", "VARCHAR(60)"),
        ("user_booking_details", "scanner_id", "VARCHAR(50)"),
        ("user_booking_details", "is_checked_in", "BOOLEAN DEFAULT FALSE"),
        ("user_booking_details", "checkin_at", "TIMESTAMP"),
        ("user_booking_details", "checkin_scanner_id", "VARCHAR(50)"),
        ("user_booking_details", "is_checked_out", "BOOLEAN DEFAULT FALSE"),
        ("user_booking_details", "checkout_at", "TIMESTAMP"),
        ("user_booking_details", "checkout_scanner_id", "VARCHAR(50)"),
        ("user_booking_details", "total_checkins", "INTEGER DEFAULT 0"),
        ("user_booking_details", "total_checkouts", "INTEGER DEFAULT 0"),
        ("venues", "total_area_sqft", "FLOAT DEFAULT 50000.0"),
        # Unified Identity Auth — User audit columns
        ("users", "email_verified", "BOOLEAN DEFAULT FALSE"),
        ("users", "created_at", "TIMESTAMP DEFAULT NOW()"),
        ("users", "updated_at", "TIMESTAMP"),
        # Unified Identity Auth — KYC step tracking for organizer profiles
        ("organizer_profiles", "kyc_step", "INTEGER DEFAULT 0"),
        ("organizer_profiles", "kyc_completed_at", "TIMESTAMP"),
        # Unified Identity Auth — KYC step tracking for exhibitor profiles
        ("exhibitor_profiles", "kyc_step", "INTEGER DEFAULT 0"),
        ("exhibitor_profiles", "kyc_completed_at", "TIMESTAMP"),
    ]
    try:
        with engine.connect().execution_options(isolation_level="AUTOCOMMIT") as conn:
            for table, col, col_def in columns_to_check:
                try:
                    check_stmt = text(
                        "SELECT 1 FROM information_schema.columns "
                        "WHERE table_name = :table AND column_name = :col;"
                    )
                    res = conn.execute(check_stmt, {"table": table, "col": col}).fetchone()
                    if not res:
                        alter_stmt = text(f"ALTER TABLE {table} ADD COLUMN IF NOT EXISTS {col} {col_def};")
                        conn.execute(alter_stmt)
                except Exception as inner_err:
                    print(f"[WARN] Column check/add for {table}.{col}: {inner_err}")
            print("[INFO] Supabase PostgreSQL schema columns verified.")
    except Exception as err:
        print(f"[WARN] Schema column verification note: {err}")

