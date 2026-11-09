from typing import List, Dict, Any, Tuple, Optional
from .base import BaseStoreTypeStrategy, FieldConfig

class HandloomStoreStrategy(BaseStoreTypeStrategy):
    code: str = "handloom"
    name: str = "Handloom Store"
    description: str = "Handloom textiles, traditional fabrics, sarees, artisanal weaves, and home furnishings."
    default_units: List[str] = ["piece", "meter", "pair", "set"]
    fields: List[FieldConfig] = [
        FieldConfig(
            field_name="fabric_type",
            field_label="Fabric / Weave Type",
            field_type="select",
            is_required=True,
            options=["Khadi Cotton", "Chanderi", "Banarasi Silk", "Tussar Silk", "Mulmul Cotton", "Linen", "Ikat Cotton", "Kanjivaram Silk", "Pashmina Wool", "Matka Silk"],
            default_value="Khadi Cotton",
            display_order=1
        ),
        FieldConfig(
            field_name="weaving_type",
            field_label="Weaving Type",
            field_type="select",
            is_required=False,
            options=["Traditional Handloom", "Pit Loom", "Frame Loom", "Jacquard Handloom", "Dobby Handloom", "Backstrap Loom"],
            default_value="Traditional Handloom",
            display_order=2
        ),
        FieldConfig(
            field_name="pattern",
            field_label="Pattern",
            field_type="select",
            is_required=False,
            options=["Zari Border", "Floral Jaal", "Geometric Ikat", "Butti / Buta Work", "Temple Border", "Plain with Border", "Stripes & Checks", "Solid"],
            default_value="Plain with Border",
            display_order=3
        ),
        FieldConfig(
            field_name="design",
            field_label="Design",
            field_type="text",
            is_required=False,
            placeholder="e.g. Traditional Paisley Motif, Contemporary Artisan Block",
            display_order=4
        ),
        FieldConfig(
            field_name="color",
            field_label="Color",
            field_type="text",
            is_required=False,
            placeholder="e.g. Indigo Blue, Madder Red, Turmeric Yellow, Natural Ecru",
            display_order=5
        ),
        FieldConfig(
            field_name="material",
            field_label="Material",
            field_type="text",
            is_required=False,
            placeholder="e.g. 100% Pure Organic Cotton, Mulberry Silk, Pure Wool",
            display_order=6
        ),
        FieldConfig(
            field_name="length",
            field_label="Length",
            field_type="text",
            is_required=False,
            placeholder="e.g. 5.5 Meters, 6.3 Meters with Blouse, 2.5 Meters Dupatta",
            display_order=7
        ),
        FieldConfig(
            field_name="width",
            field_label="Width",
            field_type="text",
            is_required=False,
            placeholder="e.g. 44 Inches, 48 Inches, 36 Inches",
            display_order=8
        ),
        FieldConfig(
            field_name="origin",
            field_label="Origin",
            field_type="text",
            is_required=False,
            placeholder="e.g. Varanasi (UP), Chanderi (MP), Pochampally (Telangana), Sambalpur (Odisha), Kutch (Gujarat)",
            display_order=9
        ),
    ]

    def validate_product_data(
        self,
        product_data: Dict[str, Any],
        attributes: Dict[str, Any],
        is_create: bool = True
    ) -> Tuple[bool, Optional[str]]:
        # Map weave_type to fabric_type if supplied
        if "weave_type" in attributes and "fabric_type" not in attributes:
            attributes["fabric_type"] = attributes["weave_type"]
        return super().validate_product_data(product_data, attributes, is_create)
