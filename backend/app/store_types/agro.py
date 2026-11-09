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
            field_label="Product Type",
            field_type="select",
            is_required=True,
            options=["Seeds", "Fertilizer / Nutrient", "Bio-fertilizer", "Pesticide / Insecticide", "Fungicide / Herbicide", "Plant Growth Regulator", "Farming Tools / Equipment", "Irrigation / Drip"],
            default_value="Seeds",
            display_order=1
        ),
        FieldConfig(
            field_name="crop_type",
            field_label="Crop Type",
            field_type="text",
            is_required=False,
            placeholder="e.g. Wheat, Cotton, Paddy/Rice, Tomato, Soybean, Vegetables, Multi-crop",
            display_order=2
        ),
        FieldConfig(
            field_name="seed_variety",
            field_label="Seed Variety",
            field_type="text",
            is_required=False,
            placeholder="e.g. Hybrid HD-2967, BG-II, Super Fast Early Variety",
            display_order=3
        ),
        FieldConfig(
            field_name="brand",
            field_label="Brand",
            field_type="text",
            is_required=False,
            placeholder="e.g. Bayer, UPL, Syngenta, IFFCO, Mahyco, Rasi Seeds",
            display_order=4
        ),
        FieldConfig(
            field_name="quantity",
            field_label="Quantity",
            field_type="text",
            is_required=False,
            placeholder="e.g. 1 Packet, 10 Pouches, 1 Drum",
            display_order=5
        ),
        FieldConfig(
            field_name="weight",
            field_label="Weight",
            field_type="text",
            is_required=False,
            placeholder="e.g. 1 kg, 5 kg, 50 kg bag, 500 ml, 1 Liter",
            display_order=6
        ),
        FieldConfig(
            field_name="germination_rate",
            field_label="Germination Rate",
            field_type="text",
            is_required=False,
            placeholder="e.g. 85%, 90% min germination",
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
            is_required=False,
            placeholder="YYYY-MM-DD",
            display_order=9
        ),
        FieldConfig(
            field_name="batch_number",
            field_label="Batch Number",
            field_type="text",
            is_required=False,
            placeholder="e.g. AG-2026-B108",
            display_order=10
        ),
        FieldConfig(
            field_name="application_instructions",
            field_label="Application Instructions",
            field_type="text",
            is_required=False,
            placeholder="e.g. Spray 2ml per liter of water during vegetative growth",
            display_order=11
        ),
    ]
