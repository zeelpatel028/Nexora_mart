from typing import List, Dict, Any, Tuple, Optional
from .base import BaseStoreTypeStrategy, FieldConfig

class MedicalPharmacyStoreStrategy(BaseStoreTypeStrategy):
    code: str = "medical"
    name: str = "Medical / Pharmacy Store"
    description: str = "Pharmaceuticals, medicines, surgical supplies, and healthcare goods."
    default_units: List[str] = ["strip", "tablet", "bottle", "vial", "box", "piece", "tube"]
    fields: List[FieldConfig] = [
        FieldConfig(
            field_name="medicine_type",
            field_label="Medicine Type",
            field_type="select",
            is_required=False,
            options=["Allopathic", "Ayurvedic", "Homeopathic", "Nutraceutical / Supplement", "Surgical / Device"],
            default_value="Allopathic",
            display_order=1
        ),
        FieldConfig(
            field_name="generic_name",
            field_label="Generic Name",
            field_type="text",
            is_required=False,
            placeholder="e.g. Paracetamol, Amoxicillin, Ibuprofen",
            display_order=2
        ),
        FieldConfig(
            field_name="salt_composition",
            field_label="Salt Composition",
            field_type="text",
            is_required=False,
            placeholder="e.g. Paracetamol 500mg + Phenylephrine 10mg",
            display_order=3
        ),
        FieldConfig(
            field_name="strength",
            field_label="Strength",
            field_type="text",
            is_required=False,
            placeholder="e.g. 500mg, 250mg/5ml, 10mg",
            display_order=4
        ),
        FieldConfig(
            field_name="dosage_form",
            field_label="Dosage Form",
            field_type="select",
            is_required=False,
            options=["Tablet", "Capsule", "Syrup", "Injection", "Ointment / Cream", "Drops", "Inhaler", "Powder", "Suspension"],
            default_value="Tablet",
            display_order=5
        ),
        FieldConfig(
            field_name="manufacturer",
            field_label="Manufacturer",
            field_type="text",
            is_required=True,
            placeholder="e.g. Cipla, Sun Pharma, Abbott, Pfizer",
            display_order=6
        ),
        FieldConfig(
            field_name="batch_number",
            field_label="Batch Number",
            field_type="text",
            is_required=True,
            placeholder="e.g. B-2026-X49",
            display_order=7
        ),
        FieldConfig(
            field_name="manufacturing_date",
            field_label="Manufacturing Date",
            field_type="date",
            is_required=False,
            placeholder="YYYY-MM-DD",
            display_order=8
        ),
        FieldConfig(
            field_name="expiry_date",
            field_label="Expiry Date",
            field_type="date",
            is_required=True,
            placeholder="YYYY-MM-DD",
            display_order=9
        ),
        FieldConfig(
            field_name="prescription_required",
            field_label="Prescription Required",
            field_type="boolean",
            is_required=False,
            display_order=10
        ),
        FieldConfig(
            field_name="drug_schedule",
            field_label="Drug Schedule",
            field_type="select",
            is_required=False,
            options=["OTC (Over the Counter)", "Schedule H", "Schedule H1", "Schedule X", "Schedule G"],
            default_value="OTC (Over the Counter)",
            display_order=11
        ),
        FieldConfig(
            field_name="storage_instructions",
            field_label="Storage Instructions",
            field_type="select",
            is_required=False,
            options=["Store below 25°C", "Store below 30°C", "Protect from direct light and moisture", "Store in refrigerator (2°C - 8°C)", "Do not freeze"],
            default_value="Store below 25°C",
            display_order=12
        ),
    ]

    def validate_product_data(
        self,
        product_data: Dict[str, Any],
        attributes: Dict[str, Any],
        is_create: bool = True
    ) -> Tuple[bool, Optional[str]]:
        valid, err = super().validate_product_data(product_data, attributes, is_create)
        if not valid:
            return False, err

        batch = attributes.get("batch_number")
        if is_create and batch and len(str(batch).strip()) < 2:
            return False, "Batch number must be at least 2 characters long."

        return True, None
