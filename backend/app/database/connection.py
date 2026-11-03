import logging
from pathlib import Path
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker
from ..core.config import settings

logger = logging.getLogger("nmart.database")

Base = declarative_base()

backend_dir = Path(__file__).resolve().parent.parent.parent
default_sqlite_file = (backend_dir / "nmart.db").resolve()
default_sqlite_url = f"sqlite:///{default_sqlite_file.as_posix()}"

def _build_engine(raw_url: str):
    db_url = raw_url.strip() if raw_url else default_sqlite_url
    connect_args = {}
    engine_kwargs = {}

    # Handle Render-style postgres URL: postgres:// -> postgresql://
    if db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql://", 1)

    if db_url.startswith("sqlite"):
        if db_url.startswith("sqlite:///./"):
            db_file = (backend_dir / db_url.replace("sqlite:///./", "")).resolve()
            db_url = f"sqlite:///{db_file.as_posix()}"
        connect_args = {"check_same_thread": False}
        engine_kwargs["connect_args"] = connect_args
    elif "postgresql" in db_url:
        engine_kwargs.update({
            "pool_pre_ping": True,
            "pool_recycle": 300,
            "pool_size": 10,
            "max_overflow": 20
        })
    elif "mysql" in db_url:
        import ssl
        try:
            ssl_ctx = ssl.create_default_context()
            ssl_ctx.check_hostname = False
            ssl_ctx.verify_mode = ssl.CERT_NONE
            connect_args = {"ssl": ssl_ctx}
        except Exception:
            connect_args = {"ssl": {}}
        engine_kwargs.update({
            "connect_args": connect_args,
            "pool_pre_ping": True,
            "pool_recycle": 300,
            "pool_size": 10,
            "max_overflow": 20
        })

    return create_engine(db_url, **engine_kwargs), db_url

def _initialize_engine():
    configured_url = settings.DATABASE_URL
    try:
        eng, resolved_url = _build_engine(configured_url)
        # Test connection if remote (PostgreSQL or MySQL)
        if not resolved_url.startswith("sqlite"):
            with eng.connect() as conn:
                conn.execute(text("SELECT 1"))
        logger.info(f"Database connected using: {resolved_url.split('@')[-1] if '@' in resolved_url else 'SQLite'}")
        return eng
    except Exception as e:
        logger.warning(f"Could not connect to configured database ({e}). Falling back to local SQLite database at {default_sqlite_file}")
        eng, _ = _build_engine(default_sqlite_url)
        return eng

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
