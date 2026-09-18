import os
import base64
import hashlib
import hmac
from typing import Optional
from cryptography.fernet import Fernet

def _get_encryption_key() -> bytes:
    raw_key = os.getenv("DATA_ENCRYPTION_KEY")
    if raw_key and len(raw_key.strip()) == 44:
        return raw_key.strip().encode()
    # Deterministically derive 32-byte URL-safe base64 key from SECRET_KEY
    secret = os.getenv("SECRET_KEY", "dev-secret-key-12345")
    derived_32 = hashlib.sha256(f"{secret}-eventapp-data-enc-v1".encode()).digest()
    return base64.urlsafe_b64encode(derived_32)

def _get_blind_index_key() -> bytes:
    raw_key = os.getenv("DATA_BLIND_INDEX_KEY")
    if raw_key:
        return raw_key.strip().encode()
    secret = os.getenv("SECRET_KEY", "dev-secret-key-12345")
    return hashlib.sha256(f"{secret}-eventapp-blind-index-v1".encode()).digest()

def get_fernet() -> Fernet:
    return Fernet(_get_encryption_key())

def encrypt_field(plaintext: Optional[str]) -> Optional[str]:
    """
    Encrypts sensitive string field using AES-256 (Fernet) and prepends 'enc::'.
    Safe to call multiple times (idempotent).
    """
    if not plaintext:
        return plaintext
    str_val = str(plaintext).strip()
    if not str_val:
        return str_val
    if str_val.startswith("enc::"):
        return str_val
    fernet = get_fernet()
    encrypted = fernet.encrypt(str_val.encode()).decode()
    return f"enc::{encrypted}"

def decrypt_field(ciphertext: Optional[str]) -> Optional[str]:
    """
    Decrypts field if it has the 'enc::' prefix.
    If plain text (legacy or unencrypted), returns as-is gracefully without error.
    """
    if not ciphertext:
        return ciphertext
    str_val = str(ciphertext).strip()
    if not str_val.startswith("enc::"):
        return str_val
    token = str_val[5:]
    try:
        fernet = get_fernet()
        return fernet.decrypt(token.encode()).decode()
    except Exception as e:
        print(f"[SECURITY ERROR] Failed to decrypt field: {e}")
        return str_val

def mask_account_number(acc: Optional[str]) -> Optional[str]:
    """
    Masks bank account number, preserving only the last 4 digits (e.g. ••••••••7890).
    Decryption is performed automatically if the input is encrypted.
    """
    if not acc:
        return acc
    plain = decrypt_field(acc)
    clean = str(plain).strip()
    if len(clean) <= 4:
        return clean
    last4 = clean[-4:]
    return f"••••••••{last4}"

def mask_pan_number(pan: Optional[str]) -> Optional[str]:
    """
    Masks PAN number, preserving only the last 4 characters (e.g. ••••••1234F).
    Decryption is performed automatically if the input is encrypted.
    """
    if not pan:
        return pan
    plain = decrypt_field(pan)
    clean = str(plain).strip().upper()
    if len(clean) <= 4:
        return clean
    last4 = clean[-4:]
    return f"••••••{last4}"

def blind_index_hash(value: Optional[str]) -> Optional[str]:
    """
    Computes a deterministic HMAC-SHA256 blind index hex digest for exact search
    and duplicate checking without decrypting database records.
    """
    if not value:
        return None
    plain = decrypt_field(value)
    normalized = str(plain).strip().upper()
    if not normalized:
        return None
    key = _get_blind_index_key()
    return hmac.new(key, normalized.encode(), hashlib.sha256).hexdigest()
