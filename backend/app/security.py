import os
import hashlib
import hmac
import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional, Any, Dict
import jwt
from cryptography.fernet import Fernet
from app.config import settings

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

def get_fernet_cipher() -> Fernet:
    return Fernet(settings.get_fernet_key())

def encrypt_secret(raw_secret: Optional[str]) -> Optional[str]:
    """Encrypt sensitive API tokens at rest."""
    if not raw_secret:
        return None
    cipher = get_fernet_cipher()
    return cipher.encrypt(raw_secret.encode("utf-8")).decode("utf-8")

def decrypt_secret(encrypted_secret: Optional[str]) -> Optional[str]:
    """Decrypt sensitive API tokens from database."""
    if not encrypted_secret:
        return None
    try:
        cipher = get_fernet_cipher()
        return cipher.decrypt(encrypted_secret.encode("utf-8")).decode("utf-8")
    except Exception:
        # Fallback if unencrypted during development or migration
        return encrypted_secret

def hash_password(password: str) -> str:
    """Hash a password using salted PBKDF2-HMAC-SHA256."""
    salt = secrets.token_hex(16)
    key = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 100_000)
    return f"{salt}${key.hex()}"

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against the stored salted hash."""
    try:
        if "$" not in hashed_password:
            return False
        salt, key_hex = hashed_password.split("$", 1)
        computed_key = hashlib.pbkdf2_hmac("sha256", plain_password.encode("utf-8"), salt.encode("utf-8"), 100_000)
        return hmac.compare_digest(computed_key.hex(), key_hex)
    except Exception:
        return False

def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Generate a signed JWT token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """Decode and validate a JWT token."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.PyJWTError:
        return None
