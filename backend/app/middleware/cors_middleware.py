import logging
from typing import List
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from ..core.config import settings

logger = logging.getLogger("nmart.cors")

DEFAULT_CORS_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost:5174",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "http://127.0.0.1:3000",
    "https://nexora-mart.vercel.app",
    "https://nexora-mart-i996.onrender.com"
]

def setup_cors(app: FastAPI) -> None:
    """
    Configures production-safe Cross-Origin Resource Sharing (CORS).
    Supports exact Vercel frontend domains, branch previews, local Vite servers,
    and credentials (cookies/Bearer headers) without wildcard security vulnerabilities.
    """
    # 1. Gather origins from configuration and defaults
    raw_origins: List[str] = settings.cors_origins if settings.ALLOWED_ORIGINS else []
    
    # 2. Merge, strip trailing slashes, and filter out wildcard '*'
    cleaned_origins = set()
    for origin in raw_origins + DEFAULT_CORS_ORIGINS:
        o = origin.strip().rstrip("/")
        if o and o != "*":
            cleaned_origins.add(o)

    origins_list = sorted(list(cleaned_origins))

    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins_list,
        # Regex permits all localhost/127.0.0.1 ports, *.vercel.app deployments, and *.onrender.com
        allow_origin_regex=r"^(https?://(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?|https://([a-zA-Z0-9_-]+\.)*(vercel\.app|onrender\.com))$",
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"],
        allow_headers=[
            "Content-Type",
            "Authorization",
            "Accept",
            "Origin",
            "X-Requested-With",
            "Access-Control-Request-Method",
            "Access-Control-Request-Headers"
        ],
        expose_headers=[
            "Content-Length",
            "Content-Range",
            "X-Total-Count"
        ],
        max_age=600
    )
