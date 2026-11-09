from typing import List
from .base import BaseStoreTypeStrategy, FieldConfig

class MobileElectronicsStoreStrategy(BaseStoreTypeStrategy):
    code: str = "mobile_electronics"
    name: str = "Mobile & Electronics Store"
    description: str = "Smartphones, consumer appliances, computing devices, audio, and gadgets."
    default_units: List[str] = ["piece", "set", "box"]
    fields: List[FieldConfig] = [
        FieldConfig(
            field_name="device_type",
            field_label="Device Type",
            field_type="select",
            is_required=False,
            options=["Smartphone", "Feature Phone", "Tablet", "Laptop", "Smartwatch", "Headphones / Earbuds", "Television", "Camera", "Power Bank", "Charger / Cable", "Accessory"],
            default_value="Smartphone",
            display_order=1
        ),
        FieldConfig(
            field_name="brand",
            field_label="Brand",
            field_type="text",
            is_required=True,
            placeholder="e.g. Apple, Samsung, OnePlus, Sony, Dell, HP",
            display_order=2
        ),
        FieldConfig(
            field_name="model_number",
            field_label="Model Number",
            field_type="text",
            is_required=True,
            placeholder="e.g. iPhone 15 Pro, SM-S928B, XPS 15",
            display_order=3
        ),
        FieldConfig(
            field_name="ram",
            field_label="RAM",
            field_type="select",
            is_required=False,
            options=["N/A", "2 GB", "3 GB", "4 GB", "6 GB", "8 GB", "12 GB", "16 GB", "32 GB", "64 GB"],
            default_value="8 GB",
            display_order=4
        ),
        FieldConfig(
            field_name="storage",
            field_label="Storage",
            field_type="select",
            is_required=False,
            options=["N/A", "32 GB", "64 GB", "128 GB", "256 GB", "512 GB", "1 TB", "2 TB"],
            default_value="128 GB",
            display_order=5
        ),
        FieldConfig(
            field_name="processor",
            field_label="Processor",
            field_type="text",
            is_required=False,
            placeholder="e.g. Snapdragon 8 Gen 3, Apple A17 Pro, Intel Core i7",
            display_order=6
        ),
        FieldConfig(
            field_name="imei_number",
            field_label="IMEI Number",
            field_type="text",
            is_required=False,
            placeholder="15-digit IMEI for cellular devices",
            display_order=7
        ),
        FieldConfig(
            field_name="serial_number",
            field_label="Serial Number",
            field_type="text",
            is_required=False,
            placeholder="e.g. SN-98234823904",
            display_order=8
        ),
        FieldConfig(
            field_name="warranty_period",
            field_label="Warranty Period",
            field_type="select",
            is_required=True,
            options=["No Warranty", "6 Months", "1 Year", "2 Years", "3 Years", "5 Years"],
            default_value="1 Year",
            display_order=9
        ),
        FieldConfig(
            field_name="color",
            field_label="Color",
            field_type="text",
            is_required=False,
            placeholder="e.g. Titanium Black, Space Grey, Phantom Blue",
            display_order=10
        ),
        FieldConfig(
            field_name="accessories_included",
            field_label="Accessories Included",
            field_type="text",
            is_required=False,
            placeholder="e.g. Adapter, USB-C Cable, Protective Case, User Manual",
            display_order=11
        ),
    ]
