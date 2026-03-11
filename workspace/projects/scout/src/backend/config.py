"""Application configuration loaded from environment variables."""

from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache
from typing import Optional


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Database
    database_url: str = "postgresql+asyncpg://scout:scout_dev_password@localhost:5432/scout"

    # Redis
    redis_url: str = "redis://localhost:6379/0"

    # LLM API Keys
    anthropic_api_key: Optional[str] = None
    openai_api_key: Optional[str] = None
    google_api_key: Optional[str] = None

    # Email delivery
    resend_api_key: Optional[str] = None
    email_from: str = "scout@example.com"

    # Auth
    secret_key: str = "change-this-in-production-use-openssl-rand-hex-32"
    encryption_key: Optional[str] = None  # AES-256 key for encrypting stored API keys
    nextauth_secret: Optional[str] = None

    # App
    frontend_url: str = "http://localhost:3000"
    environment: str = "development"
    admin_email: Optional[str] = None

    # Rate limiting
    chat_rate_limit_per_hour: int = 20
    magic_link_rate_limit_per_hour: int = 5

    # Brief scheduling (CT timezone offset handled in scheduler)
    brief_generation_hour_ct: int = 6
    brief_generation_minute_ct: int = 30

    # Alert threshold
    alert_score_threshold: int = 85
    feed_min_score: int = 40

    @property
    def is_production(self) -> bool:
        return self.environment == "production"


@lru_cache
def get_settings() -> Settings:
    return Settings()
