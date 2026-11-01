from typing import Dict, Any, List, Optional
from pydantic import BaseModel

class ValidationResult(BaseModel):
    is_valid: bool
    errors: List[str] = []
    warnings: List[str] = []

class BaseCategoryRule:
    """
    Base class for category-specific business rules.
    Default implementation provides common validation and behavior.
    """
    code: str = "default"
    name: str = "Standard Category"

    def validate_product_data(self, product_data: Dict[str, Any], attributes: Dict[str, Any]) -> ValidationResult:
        """
        Validates product attributes against category rules before save/update.
        """
        return ValidationResult(is_valid=True)

    def validate_sale_item(self, item_data: Dict[str, Any], product: Any, inventory: Any) -> ValidationResult:
        """
        Validates a sale line item (e.g. batch availability, expiry check, weight billing).
        """
        return ValidationResult(is_valid=True)

    def get_inventory_alert_type(self, product: Any, inventory: Any) -> Optional[str]:
        """
        Returns alert type if product requires attention (e.g. 'EXPIRED', 'EXPIRING_SOON', 'LOW_STOCK').
        """
        return None

