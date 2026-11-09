from typing import List
from .base import BaseStoreTypeStrategy, FieldConfig

class ClothingStoreStrategy(BaseStoreTypeStrategy):
    code: str = "clothing"
    name: str = "Clothing Store"
    description: str = "Men's, women's, and kids' apparel, textiles, and fashion garments."
    default_units: List[str] = ["piece", "pair", "set"]
    fields: List[FieldConfig] = [
        FieldConfig(
            field_name="brand",
            field_label="Brand",
            field_type="text",
            is_required=False,
            placeholder="e.g. Zara, Levi's, Raymond",
            display_order=1
        ),
        FieldConfig(
            field_name="size",
            field_label="Size",
            field_type="select",
            is_required=True,
            options=["XS", "S", "M", "L", "XL", "XXL", "3XL", "28", "30", "32", "34", "36", "38"],
            default_value="M",
            display_order=2
        ),
        FieldConfig(
            field_name="color",
            field_label="Color",
            field_type="select",
            is_required=True,
            options=["Black", "White", "Navy Blue", "Red", "Green", "Grey", "Yellow", "Beige", "Olive"],
            default_value="Black",
            display_order=3
        ),
        FieldConfig(
            field_name="fabric",
            field_label="Fabric / Material",
            field_type="select",
            is_required=False,
            options=["100% Cotton", "Polyester", "Denim", "Linen", "Silk", "Wool", "Rayon", "Blend"],
            default_value="100% Cotton",
            display_order=4
        ),
        FieldConfig(
            field_name="gender_category",
            field_label="Gender / Department",
            field_type="select",
            is_required=False,
            options=["Men", "Women", "Kids", "Unisex"],
            default_value="Men",
            display_order=5
        )
    ]

