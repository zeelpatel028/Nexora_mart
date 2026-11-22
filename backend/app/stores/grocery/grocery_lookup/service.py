from typing import List
from sqlalchemy.orm import Session
from .models import GroceryGSTRate, GroceryUnit
from .cache import (
    get_cached_gst_rates,
    set_cached_gst_rates,
    get_cached_units,
    set_cached_units
)

DEFAULT_GST_RATES = [0.0, 5.0, 12.0, 18.0, 28.0]
DEFAULT_UNITS = [
    ("Kilogram", "kg"),
    ("Gram", "g"),
    ("Litre", "litre"),
    ("Millilitre", "ml"),
    ("Piece", "piece"),
    ("Packet", "packet"),
    ("Box", "box"),
    ("Dozen", "dozen"),
]


class GroceryLookupService:
    @staticmethod
    def get_gst_rates(db: Session) -> List[dict]:
        cached = get_cached_gst_rates()
        if cached is not None:
            return cached

        rows = db.query(GroceryGSTRate).order_by(GroceryGSTRate.rate.asc()).all()
        if not rows:
            # Auto-seed standard rates
            for r in DEFAULT_GST_RATES:
                db.add(GroceryGSTRate(rate=r))
            db.commit()
            rows = db.query(GroceryGSTRate).order_by(GroceryGSTRate.rate.asc()).all()

        res = [{"id": r.id, "rate": float(r.rate)} for r in rows]
        set_cached_gst_rates(res)
        return res

    @staticmethod
    def get_units(db: Session) -> List[dict]:
        cached = get_cached_units()
        if cached is not None:
            return cached

        rows = db.query(GroceryUnit).order_by(GroceryUnit.name.asc()).all()
        if not rows:
            # Auto-seed standard units
            for name, short in DEFAULT_UNITS:
                db.add(GroceryUnit(name=name, short_name=short))
            db.commit()
            rows = db.query(GroceryUnit).order_by(GroceryUnit.name.asc()).all()

        res = [{"id": r.id, "name": r.name, "short_name": r.short_name} for r in rows]
        set_cached_units(res)
        return res
