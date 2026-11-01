from typing import Dict, Any
from .base_rule import BaseCategoryRule, ValidationResult

class GroceryRules(BaseCategoryRule):
    code = "grocery"
    name = "Grocery Store"

    def validate_product_data(self, product_data: Dict[str, Any], attributes: Dict[str, Any]) -> ValidationResult:
        errors = []
        warnings = []

        unit = attributes.get("unit") or product_data.get("unit")
        if not unit:
            errors.append("Unit (kg, g, liter, packet) is required for grocery items.")

        return ValidationResult(is_valid=len(errors) == 0, errors=errors, warnings=warnings)

