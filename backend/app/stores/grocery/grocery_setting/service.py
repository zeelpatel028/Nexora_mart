import datetime
from sqlalchemy.orm import Session
from .models import GrocerySetting
from .schemas import GrocerySettingUpdate
from .cache import get_cached_setting, set_cached_setting, invalidate_setting_cache
from ....models.store import Store


class GrocerySettingService:
    @staticmethod
    def get_or_create_settings(db: Session, store_id: int) -> dict:
        cached = get_cached_setting(store_id)
        if cached:
            return cached

        setting = db.query(GrocerySetting).filter(GrocerySetting.store_id == store_id).first()
        if not setting:
            # Check store for currency defaults
            store = db.query(Store).filter(Store.id == store_id).first()
            curr_code = getattr(store, "currency", "INR") or "INR"
            curr_sym = getattr(store, "currency_symbol", "₹") or "₹"

            setting = GrocerySetting(
                store_id=store_id,
                user_id=getattr(store, "user_id", None) if store else None,
                theme="system",
                language="en",
                currency_code=curr_code,
                currency_symbol=curr_sym,
                bill_template_id="modern_orange",
                bill_sound_enabled=True,
                bill_sound_id="sound_gpay"
            )
            db.add(setting)
            db.commit()
            db.refresh(setting)

        res = {
            "store_id": setting.store_id,
            "theme": setting.theme,
            "language": setting.language,
            "currency_code": setting.currency_code,
            "currency_symbol": setting.currency_symbol,
            "bill_template_id": setting.bill_template_id,
            "bill_sound_enabled": setting.bill_sound_enabled,
            "bill_sound_id": setting.bill_sound_id
        }
        set_cached_setting(store_id, res)
        return res

    @staticmethod
    def update_settings(db: Session, store_id: int, data: GrocerySettingUpdate) -> dict:
        setting = db.query(GrocerySetting).filter(GrocerySetting.store_id == store_id).first()
        if not setting:
            GrocerySettingService.get_or_create_settings(db, store_id)
            setting = db.query(GrocerySetting).filter(GrocerySetting.store_id == store_id).first()

        for key, val in data.model_dump(exclude_unset=True).items():
            if val is not None:
                setattr(setting, key, val)

        # Sync currency with store model if changed
        if data.currency_code:
            store = db.query(Store).filter(Store.id == store_id).first()
            if store:
                store.currency = data.currency_code
                if data.currency_symbol:
                    store.currency_symbol = data.currency_symbol
                elif data.currency_code == "USD":
                    store.currency_symbol = "$"
                    setting.currency_symbol = "$"
                elif data.currency_code == "EUR":
                    store.currency_symbol = "€"
                    setting.currency_symbol = "€"
                else:
                    store.currency_symbol = "₹"
                    setting.currency_symbol = "₹"

        setting.updated_at = datetime.datetime.now(datetime.timezone.utc)
        db.commit()
        invalidate_setting_cache(store_id)
        return GrocerySettingService.get_or_create_settings(db, store_id)
