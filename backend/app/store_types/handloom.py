from typing import List
from .base import BaseStoreTypeStrategy, FieldConfig

class HandloomStoreStrategy(BaseStoreTypeStrategy):
    code: str = "handloom"
    name: str = "Handloom Store"
    description: str = "Handloom textiles, traditional fabrics, sarees, artisanal weaves, and home furnishings."
    default_units: List[str] = ["piece", "meter", "pair", "set"]
    fields: List[FieldConfig] = [
        FieldConfig(
            field_name="weave_type",
            field_label="Fabric / Weave Type",
            field_type="select",
            is_required=True,
            options=["Khadi", "Chanderi", "Banarasi", "Silk Weave", "Pure Cotton", "Ikat", "Linen", "Tussar Silk"],
            default_value="Pure Cotton",
            display_order=1
        ),
        FieldConfig(
            field_name="pattern",
            field_label="Pattern / Style",
            field_type="text",
            is_required=False,
            placeholder="e.g. Hand Block Print, Zari Border, Floral, Ikat Geometric",
            display_order=2
        ),
        FieldConfig(
            field_name="color",
            field_label="Color / Dye",
            field_type="text",
            is_required=False,
            placeholder="e.g. Maroon, Indigo, Mustard, Natural Dye",
            display_order=3
        ),
        FieldConfig(
            field_name="dimensions",
            field_label="Dimensions / Length",
            field_type="text",
            is_required=False,
            placeholder="e.g. 5.5m Saree, 2.5m Dupatta, 6x6 ft",
            display_order=4
        ),
        FieldConfig(
            field_name="artisan_source",
            field_label="Artisan / Source Origin",
            field_type="text",
            is_required=False,
            placeholder="e.g. Kutch Cluster, Varanasi Weavers, Sambalpuri",
            display_order=5
        ),
    ]

