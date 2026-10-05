import os
import base64
import hashlib
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

class Settings(BaseSettings):
    ENVIRONMENT: str = "development"
    APP_NAME: str = "Social Automation Hub"
    SECRET_KEY: str = "dev-secret-key-social-automation-hub-2026-must-be-changed-in-prod"
    ENCRYPTION_KEY: str = ""
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000,http://127.0.0.1:5173"

    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./social_hub.db"
    REDIS_URL: str = "redis://localhost:6379/0"

    # Timezone & Business Hours
    DEFAULT_TIMEZONE: str = "UTC"
    BUSINESS_HOURS_START: str = "09:00"
    BUSINESS_HOURS_END: str = "18:00"
    BUSINESS_DAYS: str = "Monday,Tuesday,Wednesday,Thursday,Friday"

    # AI Configuration
    AI_PROVIDER: str = "mock"  # mock, gemini, openai, anthropic, local
    AI_API_KEY: str = ""
    AI_MODEL_NAME: str = "gemini-1.5-flash"
    AI_DEFAULT_MODE: str = "APPROVAL_REQUIRED"  # AUTO_SEND, APPROVAL_REQUIRED, SUGGEST_ONLY, OFF

    # Safeguards
    MAX_MESSAGES_PER_HOUR: int = 60
    MAX_POSTS_PER_DAY: int = 30
    GLOBAL_COOLDOWN_SECONDS: int = 10
    AUTO_REPLY_LOOP_LIMIT: int = 3

    # Media Storage
    MEDIA_UPLOAD_DIR: str = "./media_storage"
    MAX_UPLOAD_SIZE_MB: int = 50

    # OAuth and Webhooks
    FACEBOOK_APP_ID: str = ""
    FACEBOOK_APP_SECRET: str = ""
    FACEBOOK_REDIRECT_URI: str = "http://localhost:8000/api/v1/auth/callback/facebook"

    TWITTER_CLIENT_ID: str = ""
    TWITTER_CLIENT_SECRET: str = ""
    TWITTER_REDIRECT_URI: str = "http://localhost:8000/api/v1/auth/callback/twitter"

    LINKEDIN_CLIENT_ID: str = ""
    LINKEDIN_CLIENT_SECRET: str = ""
    LINKEDIN_REDIRECT_URI: str = "http://localhost:8000/api/v1/auth/callback/linkedin"

    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    GOOGLE_REDIRECT_URI: str = "http://localhost:8000/api/v1/auth/callback/google"

    TIKTOK_CLIENT_KEY: str = ""
    TIKTOK_CLIENT_SECRET: str = ""
    TIKTOK_REDIRECT_URI: str = "http://localhost:8000/api/v1/auth/callback/tiktok"

    TELEGRAM_BOT_TOKEN: str = ""

    WHATSAPP_PHONE_NUMBER_ID: str = ""
    WHATSAPP_ACCESS_TOKEN: str = ""
    WHATSAPP_VERIFY_TOKEN: str = "social_hub_verify_token"

    REDDIT_CLIENT_ID: str = ""
    REDDIT_CLIENT_SECRET: str = ""
    REDDIT_REDIRECT_URI: str = "http://localhost:8000/api/v1/auth/callback/reddit"

    PINTEREST_APP_ID: str = ""
    PINTEREST_APP_SECRET: str = ""
    PINTEREST_REDIRECT_URI: str = "http://localhost:8000/api/v1/auth/callback/pinterest"

    THREADS_APP_ID: str = ""
    THREADS_APP_SECRET: str = ""
    THREADS_REDIRECT_URI: str = "http://localhost:8000/api/v1/auth/callback/threads"
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    def get_cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    def get_fernet_key(self) -> bytes:
        """Returns a valid 32-byte urlsafe base64-encoded key for Fernet encryption."""
        if self.ENCRYPTION_KEY and len(self.ENCRYPTION_KEY) >= 32:
            try:
                base64.urlsafe_b64decode(self.ENCRYPTION_KEY.encode())
                return self.ENCRYPTION_KEY.encode()
            except Exception:
                pass
        # Derive a deterministic key from SECRET_KEY
        digest = hashlib.sha256(self.SECRET_KEY.encode()).digest()
        return base64.urlsafe_b64encode(digest)

settings = Settings()
