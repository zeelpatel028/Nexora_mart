from typing import Dict, Any
from .base_rule import BaseCategoryRule, ValidationResult

class FootwearRules(BaseCategoryRule):
    code = "footwear"
    name = "Footwear Store"

    def validate_product_data(self, product_data: Dict[str, Any], attributes: Dict[str, Any]) -> ValidationResult:
        errors = []
        warnings = []

        has_variants = product_data.get("has_variants", False)
        if not has_variants and not attributes.get("shoe_size"):
            errors.append("Footwear requires a specified shoe size.")

        return ValidationResult(is_valid=len(errors) == 0, errors=errors, warnings=warnings)

