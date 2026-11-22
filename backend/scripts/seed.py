"""
Tulsi Mart Database Seeder
Seeds:
1. Standard GST rates (0%, 5%, 12%, 18%, 28%)
2. Standard Measurement units (kg, g, litre, ml, piece, packet, box, dozen)
3. Default 10 prefixes for every store (invoice: INV, debit_customer: KHT, walk_in_customer: WLK, supplier: SUP, order: ORD, product: PRD, employee: EMP, return: RTN, refund: RFD, expense: EXP)
4. Initialized ID sequence counters (grocery_id_counters)
5. Initialized Grocery Settings (theme, language, currency, template, sound)
"""
import sys
import datetime
from pathlib import Path

# Add backend directory to sys.path
_SCRIPTS_DIR = Path(__file__).resolve().parent
_BACKEND_DIR = _SCRIPTS_DIR.parent
if str(_BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(_BACKEND_DIR))

from app.config.database import Base, engine, SessionLocal
import app.models  # Ensure all core models (Store, User, etc.) are in metadata
from app.models.store import Store
from app.stores.grocery.grocery_lookup.models import GroceryGSTRate, GroceryUnit
from app.stores.grocery.grocery_prefix.models import GroceryPrefix, GroceryIdCounter
from app.stores.grocery.grocery_setting.models import GrocerySetting
from app.utils.id_generator import DEFAULT_PREFIXES

STANDARD_GST_RATES = [0.0, 5.0, 12.0, 18.0, 28.0]

STANDARD_UNITS = [
    ("Kilogram", "kg"),
    ("Gram", "g"),
    ("Litre", "litre"),
    ("Millilitre", "ml"),
    ("Piece", "piece"),
    ("Packet", "packet"),
    ("Box", "box"),
    ("Dozen", "dozen"),
]


def seed_all():
    print("=" * 60)
    print("SEEDING TULSI MART STANDARD DATA")
    print("=" * 60)

    db = SessionLocal()
    try:
        # 1. Seed GST Rates
        print("\n[1/4] Seeding GST Rates...")
        for rate in STANDARD_GST_RATES:
            existing = db.query(GroceryGSTRate).filter(GroceryGSTRate.rate == rate).first()
            if not existing:
                db.add(GroceryGSTRate(rate=rate))
                print(f"  + Added GST Rate: {rate}%")
        db.commit()

        # 2. Seed Measurement Units
        print("\n[2/4] Seeding Measurement Units...")
        for name, short in STANDARD_UNITS:
            existing = db.query(GroceryUnit).filter(GroceryUnit.name == name).first()
            if not existing:
                db.add(GroceryUnit(name=name, short_name=short))
                print(f"  + Added Unit: {name} ({short})")
        db.commit()

        # 3. Seed Prefixes and Counters for Stores
        print("\n[3/4] Initializing Store Prefixes and ID Counters...")
        stores = db.query(Store).filter(Store.is_active == True).all()
        now = datetime.datetime.now(datetime.timezone.utc)
        print(f"  Found {len(stores)} store(s) to initialize.")

        for store in stores:
            # Prefixes
            for key, val in DEFAULT_PREFIXES.items():
                pfx = db.query(GroceryPrefix).filter(
                    GroceryPrefix.store_id == store.id,
                    GroceryPrefix.key == key
                ).first()
                if not pfx:
                    db.add(GroceryPrefix(store_id=store.id, key=key, prefix_value=val))

                # Counter
                counter = db.query(GroceryIdCounter).filter(
                    GroceryIdCounter.store_id == store.id,
                    GroceryIdCounter.key == key
                ).first()
                if not counter:
                    db.add(GroceryIdCounter(store_id=store.id, key=key, last_number=0))

            # Settings
            st = db.query(GrocerySetting).filter(GrocerySetting.store_id == store.id).first()
            if not st:
                db.add(GrocerySetting(
                    store_id=store.id,
                    theme="system",
                    language="en",
                    currency_code=store.currency or "INR",
                    currency_symbol=store.currency_symbol or "₹",
                    bill_template_id="modern_orange",
                    bill_sound_enabled=True,
                    bill_sound_id="sound_gpay"
                ))
                print(f"  + Initialized settings for Store ID {store.id} ({store.name})")

        db.commit()

        print("\n[4/4] Verification Complete.")
        print("=" * 60)
        print("TULSI MART DATABASE SEEDING COMPLETED SUCCESSFULLY!")
        print("=" * 60)
    except Exception as e:
        db.rollback()
        print(f"Error during seeding: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_all()
