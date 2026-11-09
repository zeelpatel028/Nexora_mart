from typing import Dict, Any, List, Optional, Tuple
from pydantic import BaseModel

class FieldConfig(BaseModel):
    field_name: str
    field_label: str
    field_type: str  # 'text', 'number', 'select', 'date', 'boolean'
    is_required: bool = False
    options: Optional[List[str]] = None
    default_value: Optional[str] = None
    placeholder: Optional[str] = None
    display_order: int = 0
    help_text: Optional[str] = None

class BaseStoreTypeStrategy:
    code: str = "base"
    name: str = "Base Store Type"
    description: str = ""
    default_units: List[str] = ["piece", "box", "packet"]
    fields: List[FieldConfig] = []

    def get_field_map(self) -> Dict[str, FieldConfig]:
        return {f.field_name: f for f in self.fields}

    def validate_product_data(
        self,
        product_data: Dict[str, Any],
        attributes: Dict[str, Any],
        is_create: bool = True
    ) -> Tuple[bool, Optional[str]]:
        """
        Validates product data and dynamic attributes against the store type requirements.
        Returns (is_valid, error_message).
        """
        field_map = self.get_field_map()
        
        # Check required fields
        for field_name, config in field_map.items():
            if config.is_required:
                # Value can come from product_data root or attributes dictionary
                val = attributes.get(field_name)
                if val is None:
                    val = product_data.get(field_name)
                
                if val is None or (isinstance(val, str) and not val.strip()):
                    return False, f"Field '{config.field_label}' is required for {self.name}."

        return True, None

    def get_ui_config(self) -> Dict[str, Any]:
        return {
            "code": self.code,
            "name": self.name,
            "description": self.description,
            "default_units": self.default_units,
            "fields": [f.model_dump() for f in self.fields]
        }

