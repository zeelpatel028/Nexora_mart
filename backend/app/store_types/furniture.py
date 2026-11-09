from typing import List, Dict, Any, Tuple, Optional
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
            options=["Sofa / Couch", "Dining Table", "Office Chair", "Study Desk", "Double Bed / King Bed", "Single Bed", "Wardrobe", "Bookshelf", "Coffee Table", "Shoe Rack", "TV Unit"],
            default_value="Sofa / Couch",
            display_order=1
        ),
        FieldConfig(
            field_name="material",
            field_label="Material",
            field_type="select",
            is_required=True,
            options=["Solid Wood", "Engineered Wood / MDF", "Plywood with Laminate", "Metal / Iron", "Upholstered Fabric", "Genuine Leather", "Glass & Wood"],
            default_value="Solid Wood",
            display_order=2
        ),
        FieldConfig(
            field_name="wood_type",
            field_label="Wood Type",
            field_type="select",
            is_required=False,
            options=["Teak Wood", "Sheesham Wood (Rosewood)", "Oak Wood", "Pine Wood", "Mango Wood", "Rubber Wood", "Walnut Wood", "Engineered Wood", "N/A (Metal/Glass)"],
            default_value="Teak Wood",
            display_order=3
        ),
        FieldConfig(
            field_name="length",
            field_label="Length",
            field_type="text",
            is_required=False,
            placeholder="e.g. 72 inches, 180 cm",
            display_order=4
        ),
        FieldConfig(
            field_name="width",
            field_label="Width",
            field_type="text",
            is_required=False,
            placeholder="e.g. 36 inches, 90 cm",
            display_order=5
        ),
        FieldConfig(
            field_name="height",
            field_label="Height",
            field_type="text",
            is_required=False,
            placeholder="e.g. 30 inches, 75 cm",
            display_order=6
        ),
        FieldConfig(
            field_name="finish",
            field_label="Finish",
            field_type="select",
            is_required=False,
            options=["Walnut Finish", "Teak Finish", "Natural Matte", "High Gloss", "Distressed / Rustic", "Mahogany Finish", "Melamine Coat"],
            default_value="Walnut Finish",
            display_order=7
        ),
        FieldConfig(
            field_name="color",
            field_label="Color",
            field_type="text",
            is_required=False,
            placeholder="e.g. Honey Brown, Dark Walnut, Matte Black, Charcoal Grey",
            display_order=8
        ),
        FieldConfig(
            field_name="weight",
            field_label="Weight",
            field_type="text",
            is_required=False,
            placeholder="e.g. 25 kg, 45 kg",
            display_order=9
        ),
        FieldConfig(
            field_name="assembly_required",
            field_label="Assembly Required",
            field_type="boolean",
            is_required=False,
            display_order=10
        ),
        FieldConfig(
            field_name="warranty",
            field_label="Warranty",
            field_type="select",
            is_required=False,
            options=["No Warranty", "1 Year", "2 Years", "3 Years", "5 Years", "10 Years"],
            default_value="1 Year",
            display_order=11
        ),
    ]

    def validate_product_data(
        self,
        product_data: Dict[str, Any],
        attributes: Dict[str, Any],
        is_create: bool = True
    ) -> Tuple[bool, Optional[str]]:
        if "warranty_period" in attributes and "warranty" not in attributes:
            attributes["warranty"] = attributes["warranty_period"]
        return super().validate_product_data(product_data, attributes, is_create)
