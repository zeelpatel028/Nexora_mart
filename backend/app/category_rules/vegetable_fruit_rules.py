from typing import Dict, Any
from .base_rule import BaseCategoryRule, ValidationResult

class VegetableFruitRules(BaseCategoryRule):
    code = "vegetable_fruit"
    name = "Vegetable & Fruit Shop"

    def validate_product_data(self, product_data: Dict[str, Any], attributes: Dict[str, Any]) -> ValidationResult:
        errors = []
        warnings = []

        unit = attributes.get("unit") or product_data.get("unit")
        if not unit:
            errors.append("Unit (kg, g, bunch, dozen) is required for produce.")

        if not attributes.get("quality"):
            warnings.append("Quality grade not specified. Defaulting to standard grade.")

        return ValidationResult(is_valid=len(errors) == 0, errors=errors, warnings=warnings)

