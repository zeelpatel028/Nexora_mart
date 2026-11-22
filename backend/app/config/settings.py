"""
Application Configuration
Pydantic-settings based configuration loading strictly from environment variables (.env).
"""
import os
import logging
from pathlib import Path
from typing import Optional, List
from dotenv import load_dotenv
from pydantic import model_validator
from pydantic_settings import BaseSettings

logger = logging.getLogger("nmart.config")

_CONFIG_DIR = Path(__file__).resolve().parent
_APP_DIR = _CONFIG_DIR.parent
_BACKEND_DIR = _APP_DIR.parent
_ROOT_DIR = _BACKEND_DIR.parent

_CANDIDATE_ENVS = [
    _BACKEND_DIR / ".env",
    _APP_DIR / ".env",
    _ROOT_DIR / ".env",
    Path(".env").resolve()
]
_ENV_FILE = next((f for f in _CANDIDATE_ENVS if f.exists()), None)
if _ENV_FILE:
    load_dotenv(dotenv_path=_ENV_FILE, override=False)


class Settings(BaseSettings):
    PROJECT_NAME: str = "Tulsi Mart API"
    ENVIRONMENT: str = "production"
    API_V1_PREFIX: str = "/api"
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    SEED_DEMO_DATA: bool = False

    # Security & Tokens
    SECRET_KEY: Optional[str] = None
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_HOURS: int = 168  # 7 days
    JWT_ISSUER: str = "tulsi-mart-api"
    JWT_AUDIENCE: str = "tulsi-mart-client"

    # Login Brute-force & Rate Limiting (3 attempts, 15m lockout)
    LOGIN_MAX_FAILED_ATTEMPTS: int = 3
    LOGIN_LOCKOUT_SECONDS: int = 900
    GLOBAL_RATE_LIMIT_PER_MINUTE: int = 100

    # Database
    DATABASE_URL: Optional[str] = None
    MYSQL_URL: Optional[str] = None
    DB_NAME: Optional[str] = None
    DB_USER: Optional[str] = None
    DB_PASSWORD: Optional[str] = None
    DB_HOST: Optional[str] = None
    DB_PORT: Optional[str] = None
    DB_SSL_MODE: Optional[str] = None

    # CORS
    ALLOWED_ORIGINS: Optional[str] = None

    # Redis
    REDIS_URL: Optional[str] = None
    REDIS_ENABLED: bool = False
    REDIS_CACHE_TTL_SECONDS: int = 3600

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT.lower() in ("production", "prod")

    @property
    def is_dev(self) -> bool:
        return not self.is_production

    @property
    def cors_origins(self) -> List[str]:
        if not self.ALLOWED_ORIGINS:
            return ["*"]
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]

    @model_validator(mode="after")
    def validate_keys(self):
        if not self.SECRET_KEY:
            env_secret = os.getenv("SECRET_KEY")
            if env_secret:
                self.SECRET_KEY = env_secret
            else:
                self.SECRET_KEY = "tulsimart-production-secret-key-32charsmin!"
        return self


settings = Settings()
