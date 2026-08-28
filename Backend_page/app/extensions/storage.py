import os
import uuid
import base64
import urllib.request
import urllib.error

SUPABASE_URL = os.getenv("SUPABASE_URL", "https://oebnblvwjvtsngubzcic.supabase.co").rstrip("/")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
BUCKET_NAME = os.getenv("STORAGE_BUCKET", "event-assets")

class StorageService:
    @staticmethod
    def upload_file_bytes(file_bytes: bytes, filename: str, mime_type: str = "image/jpeg", folder: str = "banners") -> str:
        """
        Uploads binary file data to Supabase Storage bucket 'event-assets'.
        Falls back to local /uploads/ static folder if Supabase upload fails.
        Returns the public CDN / asset URL.
        """
        ext = os.path.splitext(filename)[1] or ".jpg"
        unique_path = f"{folder}/{uuid.uuid4().hex}{ext}"

        if SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY:
            try:
                url = f"{SUPABASE_URL}/storage/v1/object/{BUCKET_NAME}/{unique_path}"
                headers = {
                    "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
                    "apiKey": SUPABASE_SERVICE_ROLE_KEY,
                    "Content-Type": mime_type,
                    "x-upsert": "true"
                }
                req = urllib.request.Request(url=url, data=file_bytes, headers=headers, method="POST")
                with urllib.request.urlopen(req) as resp:
                    if resp.status in (200, 201):
                        public_url = f"{SUPABASE_URL}/storage/v1/object/public/{BUCKET_NAME}/{unique_path}"
                        print(f"[StorageService] Successfully uploaded to Supabase Storage: {public_url}")
                        return public_url
            except Exception as e:
                print(f"[StorageService] Supabase Upload Exception: {e}. Falling back to local static storage.")

        # Local static directory fallback
        basedir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
        local_dir = os.path.join(basedir, "uploads", folder)
        os.makedirs(local_dir, exist_ok=True)
        local_filename = f"{uuid.uuid4().hex}{ext}"
        local_filepath = os.path.join(local_dir, local_filename)

        with open(local_filepath, "wb") as f:
            f.write(file_bytes)

        return f"/uploads/{folder}/{local_filename}"

    @staticmethod
    def upload_base64_data(base64_str: str, folder: str = "banners") -> str:
        """
        Decodes a Base64 Data URL (data:image/png;base64,...), uploads to Supabase/local storage,
        and returns the stored public URL.
        """
        if not base64_str:
            return ""
        if not base64_str.startswith("data:"):
            # Already a stored URL
            return base64_str

        try:
            header, encoded = base64_str.split(",", 1)
            mime_type = header.split(";")[0].split(":")[1] if ":" in header else "image/jpeg"
            if "pdf" in mime_type:
                ext = ".pdf"
            elif "png" in mime_type:
                ext = ".png"
            elif "webp" in mime_type:
                ext = ".webp"
            elif "gif" in mime_type:
                ext = ".gif"
            elif "mp4" in mime_type:
                ext = ".mp4"
            elif "svg" in mime_type:
                ext = ".svg"
            else:
                ext = ".jpg"

            file_bytes = base64.b64decode(encoded)
            return StorageService.upload_file_bytes(file_bytes, f"asset{ext}", mime_type, folder)
        except Exception as e:
            print(f"[StorageService] Failed to parse base64 image: {e}")
            return base64_str
