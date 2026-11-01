from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from ..core.config import settings

db_url = settings.DATABASE_URL
connect_args = {}

if db_url.startswith("sqlite:///./"):
    backend_dir = Path(__file__).resolve().parent.parent.parent
    db_file = (backend_dir / db_url.replace("sqlite:///./", "")).resolve()
    db_url = f"sqlite:///{db_file.as_posix()}"
    connect_args = {"check_same_thread": False}
elif db_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}
elif "mysql" in db_url:
    # Aiven Cloud MySQL requires SSL.
    import ssl
    try:
        ssl_ctx = ssl.create_default_context()
        ssl_ctx.check_hostname = False
        ssl_ctx.verify_mode = ssl.CERT_NONE
        connect_args = {"ssl": ssl_ctx}
    except Exception:
        connect_args = {"ssl": {}}

engine_kwargs = {"connect_args": connect_args}
if "mysql" in db_url:
    engine_kwargs.update({
        "pool_pre_ping": True,
        "pool_recycle": 300,
        "pool_size": 10,
        "max_overflow": 20
    })

engine = create_engine(
    db_url,
    **engine_kwargs
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    """
    FastAPI dependency yielding a database session
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
