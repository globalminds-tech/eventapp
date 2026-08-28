import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, scoped_session

load_dotenv()

# Fallback to SQLite if PostgreSQL/Supabase DB is not provided or connected
def create_resilient_engine():
    db_url = os.getenv("DATABASE_URL", "")
    
    if db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql://", 1)

    if db_url and not db_url.startswith("sqlite") and "YOUR-PROJECT-REF" not in db_url and "[YOUR-PASSWORD]" not in db_url:
        try:
            eng = create_engine(
                db_url,
                pool_pre_ping=True,
                pool_size=10,
                max_overflow=20
            )
            with eng.connect() as conn:
                pass
            return eng
        except Exception as e:
            print(f"Notice: PostgreSQL DB unavailable ({e}). Initializing resilient local SQLite database.")
    
    return create_engine("sqlite:///./eventapp.db", connect_args={"check_same_thread": False})

engine = create_resilient_engine()

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
