from typing import Dict, Any
from .base_rule import BaseCategoryRule, ValidationResult

class ElectronicsRules(BaseCategoryRule):
    code = "electronics"
    name = "Electronics Store"

    def validate_product_data(self, product_data: Dict[str, Any], attributes: Dict[str, Any]) -> ValidationResult:
        errors = []
        warnings = []

        if not attributes.get("brand"):
            errors.append("Brand name is required for electronics products.")

        if not attributes.get("model_number"):
            errors.append("Model number is required for electronics devices.")

        if not attributes.get("warranty"):
            warnings.append("No warranty period specified for electronic equipment.")

        return ValidationResult(is_valid=len(errors) == 0, errors=errors, warnings=warnings)

