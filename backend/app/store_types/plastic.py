from typing import List
from .base import BaseStoreTypeStrategy, FieldConfig

class PlasticStoreStrategy(BaseStoreTypeStrategy):
    code: str = "plastic"
    name: str = "Plastic Store"
    description: str = "Plastic housewares, containers, storage boxes, kitchen utilities, and polymer goods."
    default_units: List[str] = ["piece", "set", "pack", "dozen"]
    fields: List[FieldConfig] = [
        FieldConfig(
            field_name="material",
            field_label="Plastic Material / Type",
            field_type="select",
            is_required=False,
            options=["Virgin Plastic", "BPA Free", "HDPE", "Polypropylene (PP)", "Polycarbonate", "Recycled Plastic"],
            default_value="BPA Free",
            display_order=1
        ),
        FieldConfig(
            field_name="capacity",
            field_label="Capacity / Volume",
            field_type="select",
            is_required=False,
            options=["250ml", "500ml", "1 Liter", "2 Liters", "5 Liters", "10 Liters", "25 Liters", "50 Liters"],
            default_value="1 Liter",
            display_order=2
        ),
        FieldConfig(
            field_name="color",
            field_label="Color",
            field_type="text",
            is_required=False,
            placeholder="e.g. Transparent, Blue, Red",
            display_order=3
        ),
        FieldConfig(
            field_name="dimensions_size",
            field_label="Size / Dimensions",
            field_type="text",
            is_required=False,
            placeholder="e.g. Small, Medium, Large, 30x20 cm",
            display_order=4
        ),
        FieldConfig(
            field_name="weight_grams",
            field_label="Weight / Gauge",
            field_type="text",
            is_required=False,
            placeholder="e.g. 150g, 40 Micron",
            display_order=5
        ),
        FieldConfig(
            field_name="pack_size",
            field_label="Pack Size",
            field_type="number",
            is_required=False,
            placeholder="e.g. 1, 3, 6, 12",
            display_order=6
        ),
    ]

