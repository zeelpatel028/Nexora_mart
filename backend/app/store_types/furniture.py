from typing import List
from .base import BaseStoreTypeStrategy, FieldConfig

class FurnitureStoreStrategy(BaseStoreTypeStrategy):
    code: str = "furniture"
    name: str = "Furniture Store"
    description: str = "Home and office furniture, wooden decor, tables, chairs, and furnishings."
    default_units: List[str] = ["piece", "set"]
    fields: List[FieldConfig] = [
        FieldConfig(
            field_name="furniture_type",
            field_label="Furniture Type",
            field_type="select",
            is_required=True,
            options=["Sofa / Seating", "Dining Table", "Bed / Mattress", "Office Chair", "Study Desk", "Wardrobe", "Bookshelf"],
            default_value="Sofa / Seating",
            display_order=1
        ),
        FieldConfig(
            field_name="material",
            field_label="Primary Material",
            field_type="select",
            is_required=True,
            options=["Teak Wood", "Sheesham Wood", "Solid Oak", "Engineered Wood", "Metal / Iron", "Leather", "Fabric Upholstery"],
            default_value="Teak Wood",
            display_order=2
        ),
        FieldConfig(
            field_name="dimensions",
            field_label="Dimensions (L x W x H)",
            field_type="text",
            is_required=False,
            placeholder="e.g. 72 x 36 x 30 inches",
            display_order=3
        ),
        FieldConfig(
            field_name="finish_color",
            field_label="Finish / Color",
            field_type="text",
            is_required=False,
            placeholder="e.g. Walnut Finish, Matte Black, Natural Wood",
            display_order=4
        ),
        FieldConfig(
            field_name="warranty_period",
            field_label="Warranty",
            field_type="select",
            is_required=False,
            options=["No Warranty", "1 Year", "3 Years", "5 Years", "10 Years"],
            default_value="1 Year",
            display_order=5
        ),
    ]

