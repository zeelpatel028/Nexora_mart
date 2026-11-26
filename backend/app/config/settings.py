"""
Application Configuration
Re-exports centralized Settings from app.core.config to maintain a single source of truth.
"""
from ..core.config import Settings, settings

__all__ = ["Settings", "settings"]
