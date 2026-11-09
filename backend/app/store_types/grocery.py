from typing import List
from .base import BaseStoreTypeStrategy, FieldConfig

class GroceryStoreStrategy(BaseStoreTypeStrategy):
    code: str = "grocery"
    name: str = "Grocery Store"
    description: str = "Daily essentials, packaged food items, groceries, and staples."
    default_units: List[str] = ["kg", "g", "liter", "ml", "packet", "piece", "box"]
    fields: List[FieldConfig] = [
        FieldConfig(
            field_name="brand",
            field_label="Brand",
            field_type="text",
            is_required=False,
            placeholder="e.g. Nestle, Kellogg's, Tata",
            display_order=1
        ),
        FieldConfig(
            field_name="batch_number",
            field_label="Batch Number",
            field_type="text",
            is_required=False,
            placeholder="e.g. B-2026-01",
            display_order=2
        ),
        FieldConfig(
            field_name="weight",
            field_label="Weight / Volume",
            field_type="number",
            is_required=False,
            placeholder="e.g. 500, 1",
            display_order=3
        ),
        FieldConfig(
            field_name="expiry_date",
            field_label="Expiry Date",
            field_type="date",
            is_required=False,
            placeholder="YYYY-MM-DD",
            display_order=4
        ),
    ]

