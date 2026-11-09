from typing import Dict, List, Optional, Any
from .base import BaseStoreTypeStrategy
from .grocery import GroceryStoreStrategy
from .clothing import ClothingStoreStrategy
from .medical import MedicalPharmacyStoreStrategy
from .mobile_electronics import MobileElectronicsStoreStrategy
from .plastic import PlasticStoreStrategy
from .handloom import HandloomStoreStrategy
from .furniture import FurnitureStoreStrategy
from .agro import AgroStoreStrategy

class StoreTypeRegistry:
    _strategies: Dict[str, BaseStoreTypeStrategy] = {}
    _default_strategy: BaseStoreTypeStrategy = GroceryStoreStrategy()

    @classmethod
    def register(cls, strategy: BaseStoreTypeStrategy):
        cls._strategies[strategy.code.lower()] = strategy

    @classmethod
    def get_strategy(cls, code_or_name: Optional[str]) -> BaseStoreTypeStrategy:
        if not code_or_name:
            return cls._default_strategy

        key = str(code_or_name).strip().lower()
        if key in cls._strategies:
            return cls._strategies[key]

        # Handle legacy or alternative aliases
        alias_map = {
            "pharmacy": "medical",
            "electronics": "mobile_electronics",
            "mobile": "mobile_electronics",
            "supermarket": "grocery",
            "grocery store": "grocery",
            "clothing store": "clothing",
            "medical / pharmacy store": "medical",
            "mobile & electronics store": "mobile_electronics",
            "plastic store": "plastic",
            "handloom store": "handloom",
            "furniture store": "furniture",
            "agro store": "agro",
        }
        mapped_key = alias_map.get(key)
        if mapped_key and mapped_key in cls._strategies:
            return cls._strategies[mapped_key]

        # Substring search
        for s_key, strategy in cls._strategies.items():
            if s_key in key or key in s_key or strategy.name.lower() in key:
                return strategy

        return cls._default_strategy

    @classmethod
    def get_strategy_for_store(cls, store: Any) -> BaseStoreTypeStrategy:
        if hasattr(store, "store_type_rel") and store.store_type_rel:
            return cls.get_strategy(store.store_type_rel.code)
        if hasattr(store, "shop_category") and store.shop_category:
            return cls.get_strategy(store.shop_category.code)
        if hasattr(store, "store_type") and store.store_type:
            return cls.get_strategy(store.store_type)
        return cls._default_strategy

    @classmethod
    def list_all_strategies(cls) -> List[BaseStoreTypeStrategy]:
        return [
            cls._strategies["grocery"],
            cls._strategies["clothing"],
            cls._strategies["medical"],
            cls._strategies["mobile_electronics"],
            cls._strategies["plastic"],
            cls._strategies["handloom"],
            cls._strategies["furniture"],
            cls._strategies["agro"],
        ]

# Register all 8 supported store types
StoreTypeRegistry.register(GroceryStoreStrategy())
StoreTypeRegistry.register(ClothingStoreStrategy())
StoreTypeRegistry.register(MedicalPharmacyStoreStrategy())
StoreTypeRegistry.register(MobileElectronicsStoreStrategy())
StoreTypeRegistry.register(PlasticStoreStrategy())
StoreTypeRegistry.register(HandloomStoreStrategy())
StoreTypeRegistry.register(FurnitureStoreStrategy())
StoreTypeRegistry.register(AgroStoreStrategy())
