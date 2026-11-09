from typing import List
from .base import BaseStoreTypeStrategy, FieldConfig

class GroceryStoreStrategy(BaseStoreTypeStrategy):
    code: str = "grocery"
    name: str = "Grocery Store"
    description: str = "Daily essentials, packaged food items, groceries, and staples."
    default_units: List[str] = ["kg", "g", "liter", "ml", "packet", "piece", "box", "pouch"]
    fields: List[FieldConfig] = [
        FieldConfig(
            field_name="weight",
            field_label="Product Weight",
            field_type="text",
            is_required=False,
            placeholder="e.g. 500g, 1 kg, 250ml",
            display_order=1
        ),
        FieldConfig(
            field_name="food_type",
            field_label="Food Type",
            field_type="select",
            is_required=False,
            options=["Vegetarian", "Non-Vegetarian", "Vegan", "Egg"],
            default_value="Vegetarian",
            display_order=2
        ),
        FieldConfig(
            field_name="packaging_type",
            field_label="Packaging Type",
            field_type="select",
            is_required=False,
            options=["Packet / Pouch", "Bottle", "Box / Carton", "Can / Tin", "Jar", "Loose / Bulk", "Tetra Pak"],
            default_value="Packet / Pouch",
            display_order=3
        ),
        FieldConfig(
            field_name="manufacturing_date",
            field_label="Manufacturing Date",
            field_type="date",
            is_required=False,
            placeholder="YYYY-MM-DD",
            display_order=4
        ),
        FieldConfig(
            field_name="expiry_date",
            field_label="Expiry Date",
            field_type="date",
            is_required=False,
            placeholder="YYYY-MM-DD",
            display_order=5
        ),
        FieldConfig(
            field_name="batch_number",
            field_label="Batch Number",
            field_type="text",
            is_required=False,
            placeholder="e.g. B-2026-01",
            display_order=6
        ),
        FieldConfig(
            field_name="brand",
            field_label="Brand",
            field_type="text",
            is_required=False,
            placeholder="e.g. Nestle, Tata, Kellogg's",
            display_order=7
        ),
        FieldConfig(
            field_name="storage_instructions",
            field_label="Storage Instructions",
            field_type="text",
            is_required=False,
            placeholder="e.g. Store in a cool, dry place away from sunlight",
            display_order=8
        ),
    ]
