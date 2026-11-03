import logging
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker
from ..core.config import settings

logger = logging.getLogger("nmart.database")

Base = declarative_base()

def _get_target_database_url() -> str:
    """
    Determine the primary database URL from configuration (.env / environment variables).
    Supports DATABASE_URL, MYSQL_URL, or discrete DB_* environment variables.
    """
    # 1. Explicit DATABASE_URL if configured
    if settings.DATABASE_URL and settings.DATABASE_URL.strip():
        return settings.DATABASE_URL.strip()

    # 2. MYSQL_URL if provided
    if settings.MYSQL_URL and settings.MYSQL_URL.strip():
        return settings.MYSQL_URL.strip()

    # 3. Assemble from discrete DB_* env variables
    if settings.DB_HOST and settings.DB_USER:
        port = settings.DB_PORT or "18925"
        dbname = settings.DB_NAME or "defaultdb"
        password = settings.DB_PASSWORD or ""
        return f"mysql+pymysql://{settings.DB_USER}:{password}@{settings.DB_HOST}:{port}/{dbname}"

    raise ValueError(
        "No database configuration found. Please set DATABASE_URL, MYSQL_URL, "
        "or DB_HOST, DB_USER, DB_PASSWORD, DB_NAME in backend/.env"
    )

def _build_engine(raw_url: str):
    db_url = raw_url.strip()
    connect_args = {}
    engine_kwargs = {}

    # Handle Render-style postgres URL: postgres:// -> postgresql://
    if db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql://", 1)

    # Ensure MySQL connection uses pymysql driver for pure Python compatibility
    if db_url.startswith("mysql://"):
        db_url = db_url.replace("mysql://", "mysql+pymysql://", 1)

    if "postgresql" in db_url:
        connect_args = {"connect_timeout": 10}
        engine_kwargs.update({
            "connect_args": connect_args,
            "pool_pre_ping": True,
            "pool_recycle": 300,
            "pool_size": 10,
            "max_overflow": 20
        })
    elif "mysql" in db_url:
        import ssl
        connect_args = {"connect_timeout": 10}
        # SSL configuration for Aiven Cloud MySQL and managed cloud providers
        if settings.DB_SSL_MODE or "aivencloud.com" in db_url or "ssl" in db_url.lower():
            try:
                ssl_ctx = ssl.create_default_context()
                ssl_ctx.check_hostname = False
                ssl_ctx.verify_mode = ssl.CERT_NONE
                connect_args["ssl"] = ssl_ctx
            except Exception:
                connect_args["ssl"] = {}

        engine_kwargs.update({
            "connect_args": connect_args,
            "pool_pre_ping": True,
            "pool_recycle": 300,
            "pool_size": 10,
            "max_overflow": 20
        })

    return create_engine(db_url, **engine_kwargs), db_url

def _initialize_engine():
    target_url = _get_target_database_url()
    try:
        eng, resolved_url = _build_engine(target_url)
        with eng.connect() as conn:
            conn.execute(text("SELECT 1"))
        safe_url = resolved_url
        if "@" in safe_url:
            parts = safe_url.split("@")
            user_part = parts[0].split("://")
            proto = user_part[0]
            credentials = user_part[1].split(":")
            username = credentials[0]
            safe_url = f"{proto}://{username}:****@{parts[1]}"
        logger.info(f"Database connected successfully: {safe_url}")
        print(f"[OK] Database connected successfully: {safe_url}")
        return eng
    except Exception as e:
        logger.error(f"Fatal: Could not connect to database ({e})")
        print(f"[ERROR] Fatal: Could not connect to database ({e})")
        raise

engine = _initialize_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    """
    FastAPI dependency yielding a database session
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
