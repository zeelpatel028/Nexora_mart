from typing import List
from .base import BaseStoreTypeStrategy, FieldConfig

class MobileElectronicsStoreStrategy(BaseStoreTypeStrategy):
    code: str = "mobile_electronics"
    name: str = "Mobile & Electronics Store"
    description: str = "Smartphones, consumer appliances, computing devices, audio, and gadgets."
    default_units: List[str] = ["piece", "set", "box"]
    fields: List[FieldConfig] = [
        FieldConfig(
            field_name="brand",
            field_label="Brand",
            field_type="text",
            is_required=True,
            placeholder="e.g. Apple, Samsung, Sony, OnePlus",
            display_order=1
        ),
        FieldConfig(
            field_name="model_number",
            field_label="Model Number / Name",
            field_type="text",
            is_required=True,
            placeholder="e.g. iPhone 15 Pro, Galaxy S24",
            display_order=2
        ),
        FieldConfig(
            field_name="serial_imei",
            field_label="Serial / IMEI Number",
            field_type="text",
            is_required=False,
            placeholder="Unique Serial or IMEI",
            display_order=3
        ),
        FieldConfig(
            field_name="warranty_period",
            field_label="Warranty Period",
            field_type="select",
            is_required=True,
            options=["No Warranty", "6 Months", "1 Year", "2 Years", "3 Years"],
            default_value="1 Year",
            display_order=4
        ),
        FieldConfig(
            field_name="storage_ram",
            field_label="Storage / RAM",
            field_type="select",
            is_required=False,
            options=["64GB", "128GB", "256GB", "512GB", "1TB", "8GB/128GB", "12GB/256GB"],
            default_value="128GB",
            display_order=5
        ),
        FieldConfig(
            field_name="specifications",
            field_label="Key Specifications",
            field_type="text",
            is_required=False,
            placeholder="e.g. 5G, OLED 120Hz, 50MP Camera",
            display_order=6
        )
    ]

