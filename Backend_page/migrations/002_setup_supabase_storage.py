import os
import json
import urllib.request
import urllib.error
from dotenv import load_dotenv

# Load environment variables
dotenv_path = os.path.join(os.path.dirname(__file__), "..", ".env")
load_dotenv(dotenv_path)

SUPABASE_URL = os.getenv("SUPABASE_URL", "https://oebnblvwjvtsngubzcic.supabase.co").rstrip("/")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
BUCKET_NAME = os.getenv("STORAGE_BUCKET", "event-assets")

def setup_supabase_bucket():
    print(f"[+] Initializing Supabase Public Bucket: '{BUCKET_NAME}'...")
    print(f"[+] Target Supabase URL: {SUPABASE_URL}")

    if not SUPABASE_SERVICE_ROLE_KEY:
        print("[!] Error: SUPABASE_SERVICE_ROLE_KEY missing in .env file.")
        return False

    url = f"{SUPABASE_URL}/storage/v1/bucket"
    headers = {
        "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
        "apiKey": SUPABASE_SERVICE_ROLE_KEY,
        "Content-Type": "application/json"
    }

    payload = {
        "id": BUCKET_NAME,
        "name": BUCKET_NAME,
        "public": True,
        "file_size_limit": 52428800,  # 50MB
        "allowed_mime_types": ["image/jpeg", "image/png", "image/webp", "image/gif", "video/mp4"]
    }

    req = urllib.request.Request(
        url=url,
        data=json.dumps(payload).encode("utf-8"),
        headers=headers,
        method="POST"
    )

    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            print(f"[SUCCESS] Public Bucket '{BUCKET_NAME}' created successfully in Supabase!")
            return True
    except urllib.error.HTTPError as e:
        err_body = e.read().decode("utf-8")
        if "Duplicate" in err_body or "already exists" in err_body:
            print(f"[OK] Bucket '{BUCKET_NAME}' already exists in Supabase and is ready to use!")
            return True
        else:
            print(f"[ERROR] Failed to create bucket (HTTP {e.code}): {err_body}")
            return False
    except Exception as err:
        print(f"[ERROR] Connection Error: {err}")
        return False

if __name__ == "__main__":
    setup_supabase_bucket()
