from typing import List
from .base import BaseStoreTypeStrategy, FieldConfig

class AgroStoreStrategy(BaseStoreTypeStrategy):
    code: str = "agro"
    name: str = "Agro Store"
    description: str = "Seeds, fertilizers, agricultural implements, farming equipment, and pesticides."
    default_units: List[str] = ["kg", "g", "liter", "ml", "packet", "bag", "piece"]
    fields: List[FieldConfig] = [
        FieldConfig(
            field_name="product_type",
            field_label="Agro Product Type / Category",
            field_type="select",
            is_required=True,
            options=["Seeds", "Fertilizer / Bio-fertilizer", "Pesticide / Insecticide", "Farming Tools", "Irrigation Equipment"],
            default_value="Seeds",
            display_order=1
        ),
        FieldConfig(
            field_name="variety_crop",
            field_label="Crop / Variety / Target",
            field_type="text",
            is_required=False,
            placeholder="e.g. Hybrid Cotton, Wheat HD-2967, Tomato",
            display_order=2
        ),
        FieldConfig(
            field_name="technical_name",
            field_label="Technical / Active Ingredient",
            field_type="text",
            is_required=False,
            placeholder="e.g. NPK 19:19:19, Chlorpyrifos 20% EC",
            display_order=3
        ),
        FieldConfig(
            field_name="pack_size",
            field_label="Pack Size / Net Content",
            field_type="text",
            is_required=False,
            placeholder="e.g. 1 kg, 5 kg, 500 ml, 5 Liters",
            display_order=4
        ),
        FieldConfig(
            field_name="batch_number",
            field_label="Batch Number",
            field_type="text",
            is_required=False,
            placeholder="e.g. AG-2026-B1",
            display_order=5
        ),
        FieldConfig(
            field_name="expiry_date",
            field_label="Expiry / Validity Date",
            field_type="date",
            is_required=False,
            placeholder="YYYY-MM-DD",
            display_order=6
        ),
    ]

