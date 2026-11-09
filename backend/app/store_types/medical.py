from typing import List, Dict, Any, Tuple, Optional
from .base import BaseStoreTypeStrategy, FieldConfig

class MedicalPharmacyStoreStrategy(BaseStoreTypeStrategy):
    code: str = "medical"
    name: str = "Medical / Pharmacy Store"
    description: str = "Pharmaceuticals, medicines, surgical supplies, and healthcare goods."
    default_units: List[str] = ["strip", "tablet", "bottle", "vial", "box", "piece"]
    fields: List[FieldConfig] = [
        FieldConfig(
            field_name="generic_name",
            field_label="Generic / Salt Name",
            field_type="text",
            is_required=False,
            placeholder="e.g. Paracetamol, Amoxicillin",
            display_order=1
        ),
        FieldConfig(
            field_name="manufacturer",
            field_label="Manufacturer",
            field_type="text",
            is_required=True,
            placeholder="e.g. Cipla, Sun Pharma, Pfizer",
            display_order=2
        ),
        FieldConfig(
            field_name="batch_number",
            field_label="Batch Number",
            field_type="text",
            is_required=True,
            placeholder="e.g. BATCH-2026-X",
            display_order=3
        ),
        FieldConfig(
            field_name="expiry_date",
            field_label="Expiry Date",
            field_type="date",
            is_required=True,
            placeholder="YYYY-MM-DD",
            display_order=4
        ),
        FieldConfig(
            field_name="strength",
            field_label="Strength / Dosage",
            field_type="text",
            is_required=False,
            placeholder="e.g. 500mg, 10ml, 250mg/5ml",
            display_order=5
        ),
        FieldConfig(
            field_name="dosage_form",
            field_label="Dosage Form",
            field_type="select",
            is_required=False,
            options=["Tablet", "Capsule", "Syrup", "Injection", "Ointment", "Drops", "Inhaler"],
            default_value="Tablet",
            display_order=6
        ),
        FieldConfig(
            field_name="prescription_required",
            field_label="Prescription Required",
            field_type="select",
            is_required=False,
            options=["Yes", "No"],
            default_value="No",
            display_order=7
        ),
    ]

    def validate_product_data(
        self,
        product_data: Dict[str, Any],
        attributes: Dict[str, Any],
        is_create: bool = True
    ) -> Tuple[bool, Optional[str]]:
        # Run base validation
        valid, err = super().validate_product_data(product_data, attributes, is_create)
        if not valid:
            return False, err

        # Verify batch number format
        batch = attributes.get("batch_number")
        if is_create and batch and len(str(batch).strip()) < 2:
            return False, "Batch number must be at least 2 characters long."

        return True, None

