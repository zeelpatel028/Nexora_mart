from typing import Dict, Any
from .base_rule import BaseCategoryRule, ValidationResult

class ClothingRules(BaseCategoryRule):
    code = "clothing"
    name = "Clothing Store"

    def validate_product_data(self, product_data: Dict[str, Any], attributes: Dict[str, Any]) -> ValidationResult:
        errors = []
        warnings = []

        # If has_variants is True, size and color should be specified either on base or in variants
        has_variants = product_data.get("has_variants", False)
        variants = product_data.get("variants", [])

        if has_variants and not variants:
            warnings.append("Clothing item marked as having variants, but no sizes/colors variants were generated.")

        if not has_variants:
            if not attributes.get("size"):
                errors.append("Apparel item requires a size specification.")
            if not attributes.get("color"):
                errors.append("Apparel item requires a color specification.")

        return ValidationResult(is_valid=len(errors) == 0, errors=errors, warnings=warnings)

