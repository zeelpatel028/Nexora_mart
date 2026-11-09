import logging
import os
from pathlib import Path
from typing import List, Optional
from dotenv import load_dotenv
from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

logger = logging.getLogger("nmart.config")

_CORE_DIR = Path(__file__).resolve().parent
_APP_DIR = _CORE_DIR.parent
_BACKEND_DIR = _APP_DIR.parent
_ROOT_DIR = _BACKEND_DIR.parent

# Locate candidate .env files in priority order
_CANDIDATE_ENVS = [
    _BACKEND_DIR / ".env",
    _APP_DIR / ".env",
    _ROOT_DIR / ".env",
    Path(".env").resolve()
]
_ENV_FILE = next((f for f in _CANDIDATE_ENVS if f.exists()), None)

# Load into system environment variables if .env file exists
if _ENV_FILE:
    load_dotenv(dotenv_path=_ENV_FILE, override=False)

class Settings(BaseSettings):
    """
    Application Settings
    Strictly loads all sensitive credentials (passwords, JWT secret, database URLs, Redis URLs)
    from environment variables / .env file. No sensitive secrets are stored statically in code.
    """
    # General API Configuration
    PROJECT_NAME: str = "NMART API"
    ENVIRONMENT: str = "development"
    API_V1_PREFIX: str = "/api"

    # Security & Tokens (Loaded exclusively from .env)
    SECRET_KEY: Optional[str] = None
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_HOURS: int = 15
    JWT_ISSUER: str = "nexora-mart-api"
    JWT_AUDIENCE: str = "nexora-mart-client"

    # Database Configuration (Loaded exclusively from .env)
    DATABASE_URL: Optional[str] = None
    MYSQL_URL: Optional[str] = None
    DB_NAME: Optional[str] = None
    DB_USER: Optional[str] = None
    DB_PASSWORD: Optional[str] = None
    DB_HOST: Optional[str] = None
    DB_PORT: Optional[str] = None
    DB_SSL_MODE: Optional[str] = None

    # CORS Allowed Origins (Comma-separated in .env)
    ALLOWED_ORIGINS: Optional[str] = None

    # Redis In-Memory Cache (Loaded exclusively from .env)
    REDIS_URL: Optional[str] = None
    REDIS_ENABLED: bool = False
    REDIS_CACHE_TTL_SECONDS: int = 3600

    @model_validator(mode="after")
    def validate_sensitive_keys(self):
        """
        Ensure sensitive private data is supplied by .env or environment variables.
        No static private fallback strings exist in code.
        """
        if not self.SECRET_KEY:
            env_secret = os.getenv("SECRET_KEY")
            if env_secret:
                self.SECRET_KEY = env_secret
            else:
                raise ValueError(
                    "CRITICAL SECURITY CONFIGURATION: SECRET_KEY is missing. "
                    "Define SECRET_KEY in your backend/.env file or environment variables."
                )
        return self

    model_config = SettingsConfigDict(
        env_file=str(_ENV_FILE) if _ENV_FILE is not None else None,
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=True
    )

    @property
    def cors_origins(self) -> List[str]:
        if not self.ALLOWED_ORIGINS:
            return ["*"]
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]

settings = Settings()
