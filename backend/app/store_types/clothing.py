from typing import List
from .base import BaseStoreTypeStrategy, FieldConfig

class ClothingStoreStrategy(BaseStoreTypeStrategy):
    code: str = "clothing"
    name: str = "Clothing Store"
    description: str = "Men's, women's, and kids' apparel, textiles, and fashion garments."
    default_units: List[str] = ["piece", "pair", "set", "meter"]
    fields: List[FieldConfig] = [
        FieldConfig(
            field_name="clothing_type",
            field_label="Clothing Type",
            field_type="select",
            is_required=False,
            options=["Shirt", "T-Shirt", "Jeans", "Trousers", "Saree", "Dress", "Jacket", "Kurta", "Shorts", "Skirt", "Sweater"],
            default_value="Shirt",
            display_order=1
        ),
        FieldConfig(
            field_name="gender",
            field_label="Gender",
            field_type="select",
            is_required=False,
            options=["Men", "Women", "Unisex", "Boys", "Girls", "Kids"],
            default_value="Men",
            display_order=2
        ),
        FieldConfig(
            field_name="size",
            field_label="Size",
            field_type="select",
            is_required=True,
            options=["XS", "S", "M", "L", "XL", "XXL", "3XL", "Free Size", "28", "30", "32", "34", "36", "38", "40"],
            default_value="M",
            display_order=3
        ),
        FieldConfig(
            field_name="color",
            field_label="Color",
            field_type="select",
            is_required=True,
            options=["Black", "White", "Navy Blue", "Red", "Blue", "Green", "Grey", "Yellow", "Beige", "Olive", "Pink", "Brown"],
            default_value="Black",
            display_order=4
        ),
        FieldConfig(
            field_name="fabric",
            field_label="Fabric",
            field_type="select",
            is_required=False,
            options=["100% Cotton", "Polyester", "Denim", "Linen", "Silk", "Wool", "Rayon", "Chiffon", "Georgette", "Cotton Blend"],
            default_value="100% Cotton",
            display_order=5
        ),
        FieldConfig(
            field_name="pattern",
            field_label="Pattern",
            field_type="select",
            is_required=False,
            options=["Solid / Plain", "Printed", "Striped", "Checked", "Embroidered", "Floral", "Graphic Print"],
            default_value="Solid / Plain",
            display_order=6
        ),
        FieldConfig(
            field_name="fit_type",
            field_label="Fit Type",
            field_type="select",
            is_required=False,
            options=["Regular Fit", "Slim Fit", "Relaxed Fit", "Loose Fit", "Skinny Fit", "Oversized"],
            default_value="Regular Fit",
            display_order=7
        ),
        FieldConfig(
            field_name="sleeve_type",
            field_label="Sleeve Type",
            field_type="select",
            is_required=False,
            options=["Full Sleeve", "Half Sleeve", "Short Sleeve", "Sleeveless", "3/4 Sleeve"],
            default_value="Full Sleeve",
            display_order=8
        ),
        FieldConfig(
            field_name="neck_type",
            field_label="Neck Type",
            field_type="select",
            is_required=False,
            options=["Round Neck", "V-Neck", "Collar / Polo", "Mandarin / Chinese", "Hooded", "Boat Neck", "Square Neck"],
            default_value="Collar / Polo",
            display_order=9
        ),
        FieldConfig(
            field_name="season",
            field_label="Season",
            field_type="select",
            is_required=False,
            options=["All Season", "Summer", "Winter", "Spring / Autumn", "Monsoon / Festive"],
            default_value="All Season",
            display_order=10
        ),
        FieldConfig(
            field_name="collection",
            field_label="Collection",
            field_type="text",
            is_required=False,
            placeholder="e.g. Summer 2026, Festive Edition, Classic Essentials",
            display_order=11
        ),
        FieldConfig(
            field_name="material",
            field_label="Material",
            field_type="text",
            is_required=False,
            placeholder="e.g. 100% Combed Cotton, Stretch Denim",
            display_order=12
        ),
        FieldConfig(
            field_name="design_number",
            field_label="Design Number",
            field_type="text",
            is_required=False,
            placeholder="e.g. D-8802, STYLE-2026-X",
            display_order=13
        ),
    ]
