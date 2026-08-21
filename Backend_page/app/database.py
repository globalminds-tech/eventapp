import mysql.connector
import os
from dotenv import load_dotenv

load_dotenv()

def get_db_connection(db_name=None):
    db_host = os.getenv("DB_HOST", "localhost")
    db_user = os.getenv("DB_USER", "root")
    db_password = os.getenv("DB_PASSWORD", "")
    db_port = int(os.getenv("DB_PORT", 3306))
    env_db = os.getenv("DB_NAME", "defaultdb")

    target_db = db_name if db_name else env_db

    config = {
        'host': db_host,
        'user': db_user,
        'password': db_password,
        'port': db_port,
        'database': target_db
    }

    # SSL Configuration (required for cloud databases like Aiven)
    ssl_ca = os.getenv("DB_SSL_CA")
    if ssl_ca:
        if not os.path.isabs(ssl_ca):
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            ssl_ca = os.path.join(base_dir, ssl_ca)
        if os.path.exists(ssl_ca):
            config['ssl_ca'] = ssl_ca
            config['ssl_verify_cert'] = True

    # Retry mechanism for establishing database connection
    max_retries = 3
    for attempt in range(max_retries):
        try:
            conn = mysql.connector.connect(**config)
            if conn.is_connected():
                conn.ping(reconnect=True, attempts=3, delay=1)
                return conn
        except mysql.connector.Error as err:
            if attempt == max_retries - 1:
                print(f"Database Connection Failed after {max_retries} attempts: {err}")
                raise err
            import time
            time.sleep(1)

    return mysql.connector.connect(**config)

