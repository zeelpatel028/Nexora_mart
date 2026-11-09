from typing import List
from .base import BaseStoreTypeStrategy, FieldConfig

class PlasticStoreStrategy(BaseStoreTypeStrategy):
    code: str = "plastic"
    name: str = "Plastic Store"
    description: str = "Plastic housewares, containers, storage boxes, kitchen utilities, and polymer goods."
    default_units: List[str] = ["piece", "set", "pack", "dozen", "box"]
    fields: List[FieldConfig] = [
        FieldConfig(
            field_name="plastic_type",
            field_label="Plastic Type",
            field_type="select",
            is_required=False,
            options=["Polypropylene (PP)", "High-Density Polyethylene (HDPE)", "Low-Density Polyethylene (LDPE)", "Polyethylene Terephthalate (PET)", "Polyvinyl Chloride (PVC)", "Polycarbonate (PC)", "BPA-Free Virgin Plastic", "Recycled Plastic"],
            default_value="Polypropylene (PP)",
            display_order=1
        ),
        FieldConfig(
            field_name="material",
            field_label="Material",
            field_type="text",
            is_required=False,
            placeholder="e.g. Food Grade Virgin Polymer, Industrial Polymer",
            display_order=2
        ),
        FieldConfig(
            field_name="product_size",
            field_label="Product Size",
            field_type="select",
            is_required=False,
            options=["Small", "Medium", "Large", "Extra Large", "Standard / Uniform", "Custom Dimensions"],
            default_value="Medium",
            display_order=3
        ),
        FieldConfig(
            field_name="weight",
            field_label="Weight",
            field_type="text",
            is_required=False,
            placeholder="e.g. 150g, 500g, 1.2 kg",
            display_order=4
        ),
        FieldConfig(
            field_name="thickness",
            field_label="Thickness",
            field_type="text",
            is_required=False,
            placeholder="e.g. 40 Micron, 2 mm, 3 mm, 5 mm",
            display_order=5
        ),
        FieldConfig(
            field_name="color",
            field_label="Color",
            field_type="text",
            is_required=False,
            placeholder="e.g. Transparent, Blue, Red, Ivory White",
            display_order=6
        ),
        FieldConfig(
            field_name="capacity",
            field_label="Capacity",
            field_type="select",
            is_required=False,
            options=["N/A", "250 ml", "500 ml", "1 Liter", "2 Liters", "5 Liters", "10 Liters", "25 Liters", "50 Liters", "100 Liters"],
            default_value="1 Liter",
            display_order=7
        ),
        FieldConfig(
            field_name="manufacturing_type",
            field_label="Manufacturing Type",
            field_type="select",
            is_required=False,
            options=["Injection Molding", "Blow Molding", "Extrusion", "Thermoforming", "Rotational Molding"],
            default_value="Injection Molding",
            display_order=8
        ),
    ]
