from pathlib import Path
from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict

_CORE_DIR = Path(__file__).resolve().parent
_APP_DIR = _CORE_DIR.parent
_BACKEND_DIR = _APP_DIR.parent

_CANDIDATE_ENVS = [
    _BACKEND_DIR / ".env",
    _APP_DIR / ".env",
    Path(".env").resolve()
]
_ENV_FILE = next((f for f in _CANDIDATE_ENVS if f.exists()), None)

class Settings(BaseSettings):
    PROJECT_NAME: str = "NMART API"
    ENVIRONMENT: str = "development"
    API_V1_PREFIX: str = "/api"
    
    SECRET_KEY: str = "nmart_development_super_secret_jwt_key_2026_change_in_production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    
    DATABASE_URL: str = "sqlite:///./nmart.db"
    MYSQL_URL: Optional[str] = None
    DB_NAME: Optional[str] = None
    DB_USER: Optional[str] = None
    DB_PASSWORD: Optional[str] = None
    DB_HOST: Optional[str] = None
    DB_PORT: Optional[str] = None
    DB_SSL_MODE: Optional[str] = None

    ALLOWED_ORIGINS: str = "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173"

    # Redis In-Memory Cache & Session Management
    REDIS_URL: str = "redis://localhost:6379/0"
    REDIS_ENABLED: bool = True
    REDIS_CACHE_TTL_SECONDS: int = 3600

    model_config = SettingsConfigDict(
        env_file=str(_ENV_FILE) if _ENV_FILE.exists() else ".env",
        extra="ignore",
        case_sensitive=True
    )

    @property
    def cors_origins(self) -> List[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]

settings = Settings()
