import os
from dotenv import load_dotenv

# Load environment variables from .env file
base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
env_path = os.path.join(base_dir, '.env')
if os.path.exists(env_path):
    load_dotenv(env_path)
else:
    load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', '123')
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', SECRET_KEY)

    # Database Settings
    DB_HOST = os.environ.get('DB_HOST', 'localhost')
    DB_PORT = os.environ.get('DB_PORT', '3306')
    DB_USER = os.environ.get('DB_USER', 'root')
    DB_PASSWORD = os.environ.get('DB_PASSWORD', '')
    DB_NAME = os.environ.get('DB_NAME', 'event_db')
    DB_SSL_CA = os.environ.get('DB_SSL_CA', None)

    # Build SSL path if relative
    ssl_ca_path = None
    if DB_SSL_CA:
        ssl_ca_path = DB_SSL_CA if os.path.isabs(DB_SSL_CA) else os.path.join(base_dir, DB_SSL_CA)

    # Build SQLAlchemy URI if not explicitly provided
    DEFAULT_URI = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    if ssl_ca_path and os.path.exists(ssl_ca_path):
        DEFAULT_URI += f"?ssl_ca={ssl_ca_path}"

    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL', DEFAULT_URI)
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_recycle": 280,
        "pool_pre_ping": True,
    }

    # Redis Settings
    REDIS_URL = os.environ.get('REDIS_URL', None)

    # AWS SQS Settings
    AWS_REGION = os.environ.get('AWS_REGION', 'us-east-1')
    SQS_QUEUE_URL = os.environ.get('SQS_QUEUE_URL', None)

    # Third Party Credentials
    GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY', '')
    MAIL_HOST = os.environ.get('MAIL_HOST', 'smtp.gmail.com')
    MAIL_PORT = int(os.environ.get('MAIL_PORT', 587))
    MAIL_USERNAME = os.environ.get('MAIL_USERNAME', '')
    MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD', '')
