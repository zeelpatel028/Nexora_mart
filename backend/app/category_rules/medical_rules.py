import datetime
from typing import Dict, Any, Optional
from .base_rule import BaseCategoryRule, ValidationResult

class MedicalRules(BaseCategoryRule):
    code = "medical"
    name = "Medical Store"

    def validate_product_data(self, product_data: Dict[str, Any], attributes: Dict[str, Any]) -> ValidationResult:
        errors = []
        warnings = []

        if not attributes.get("manufacturer"):
            errors.append("Manufacturer is required for pharmaceutical products.")

        if not attributes.get("batch_number"):
            errors.append("Batch Number is mandatory for medical inventory tracking.")

        expiry = attributes.get("expiry_date")
        if not expiry:
            errors.append("Expiry Date is required for medical products.")
        else:
            try:
                if isinstance(expiry, str):
                    exp_date = datetime.datetime.strptime(expiry[:10], "%Y-%m-%d").date()
                elif isinstance(expiry, (datetime.datetime, datetime.date)):
                    exp_date = expiry if isinstance(expiry, datetime.date) else expiry.date()
                else:
                    exp_date = None

                if exp_date and exp_date <= datetime.date.today():
                    errors.append(f"Product cannot be added with an expired date: {exp_date}")
                elif exp_date and exp_date <= (datetime.date.today() + datetime.timedelta(days=30)):
                    warnings.append(f"Warning: Product expires in less than 30 days ({exp_date})")
            except Exception:
                errors.append("Invalid expiry date format. Use YYYY-MM-DD.")

        return ValidationResult(is_valid=len(errors) == 0, errors=errors, warnings=warnings)

    def validate_sale_item(self, item_data: Dict[str, Any], product: Any, inventory: Any) -> ValidationResult:
        errors = []
        warnings = []

        # Prevent sale of expired medicine
        if inventory and inventory.expiry_date:
            exp_date = inventory.expiry_date.date() if isinstance(inventory.expiry_date, datetime.datetime) else inventory.expiry_date
            if exp_date <= datetime.date.today():
                errors.append(f"Cannot dispense expired medicine '{product.name}' (Expired on {exp_date}).")
            elif exp_date <= (datetime.date.today() + datetime.timedelta(days=15)):
                warnings.append(f"Medicine '{product.name}' is near expiry ({exp_date}).")

        return ValidationResult(is_valid=len(errors) == 0, errors=errors, warnings=warnings)

