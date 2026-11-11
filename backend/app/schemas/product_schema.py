from typing import Optional, List, Dict, Any, Union
from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime, date
from decimal import Decimal


# --- Pricing Schemas ---
class PricingBase(BaseModel):
    purchase_price: float = 0.0
    selling_price: float = 0.0
    mrp: Optional[float] = None
    wholesale_price: Optional[float] = None
    discount_type: Optional[str] = None  # percentage, fixed
    discount_value: float = 0.0
    tax_type: str = "exclusive"  # inclusive, exclusive, exempt
    gst_rate: float = 0.0
    cgst_rate: float = 0.0
    sgst_rate: float = 0.0
    igst_rate: float = 0.0
    cess_rate: float = 0.0

class PricingCreate(PricingBase):
    pass

class PricingResponse(PricingBase):
    model_config = ConfigDict(from_attributes=True)
    id: str
    store_id: int
    product_id: str


# --- Inventory Schemas ---
class InventoryBase(BaseModel):
    opening_stock: float = 0.0
    current_stock: float = 0.0
    reserved_stock: float = 0.0
    minimum_stock: float = 5.0
    maximum_stock: Optional[float] = None
    reorder_level: float = 10.0
    warehouse_location: Optional[str] = None

class InventoryCreate(InventoryBase):
    pass

class InventoryResponse(InventoryBase):
    model_config = ConfigDict(from_attributes=True)
    id: str
    store_id: int
    product_id: str
    last_stock_update: Optional[datetime] = None


# --- Alerts Schemas ---
class AlertBase(BaseModel):
    alert_type: str = "LOW_STOCK"  # LOW_STOCK, EXPIRY_WARNING, OUT_OF_STOCK
    threshold_value: Optional[float] = None
    alert_days_before: Optional[int] = None
    is_enabled: bool = True
    notify_email: bool = False
    notify_sms: bool = False

class AlertCreate(AlertBase):
    pass

class AlertResponse(AlertBase):
    model_config = ConfigDict(from_attributes=True)
    id: str
    product_id: str


# --- Images Schemas ---
class ImageBase(BaseModel):
    image_url: str
    alt_text: Optional[str] = None
    is_primary: bool = False
    display_order: int = 0

class ImageCreate(ImageBase):
    pass

class ImageResponse(ImageBase):
    model_config = ConfigDict(from_attributes=True)
    id: str
    product_id: str


# --- Variants Schemas ---
class VariantBase(BaseModel):
    variant_name: str
    sku: Optional[str] = None
    barcode: Optional[str] = None
    attributes: Dict[str, Any] = Field(default_factory=dict)
    purchase_price: float = 0.0
    selling_price: float = 0.0
    mrp: Optional[float] = None
    stock_quantity: float = 0.0
    is_active: bool = True

class VariantCreate(VariantBase):
    pass

class VariantResponse(VariantBase):
    model_config = ConfigDict(from_attributes=True)
    id: str
    product_id: str

ProductVariantCreate = VariantCreate
ProductVariantResponse = VariantResponse


# --- Batches Schemas ---
class BatchBase(BaseModel):
    batch_number: str
    manufacturing_date: Optional[Union[datetime, date, str]] = None
    expiry_date: Optional[Union[datetime, date, str]] = None
    purchase_price: float = 0.0
    selling_price: float = 0.0
    mrp: Optional[float] = None
    initial_quantity: float = 0.0
    current_quantity: float = 0.0
    supplier_id: Optional[int] = None
    is_active: bool = True

class BatchCreate(BatchBase):
    pass

class BatchResponse(BatchBase):
    model_config = ConfigDict(from_attributes=True)
    id: str
    product_id: str


# --- Serial Numbers Schemas ---
class SerialNumberBase(BaseModel):
    serial_number: str
    imei_number: Optional[str] = None
    status: str = "available"
    warranty_start_date: Optional[Union[datetime, date, str]] = None
    warranty_end_date: Optional[Union[datetime, date, str]] = None

class SerialNumberCreate(SerialNumberBase):
    pass

class SerialNumberResponse(SerialNumberBase):
    model_config = ConfigDict(from_attributes=True)
    id: str
    product_id: str


# --- Store-Specific Detail Schemas ---
class GroceryDetailsSchema(BaseModel):
    food_type: Optional[str] = "Vegetarian"
    item_type: Optional[str] = None
    net_weight: Optional[str] = None
    gross_weight: Optional[str] = None
    packaging_type: Optional[str] = None
    manufacturer: Optional[str] = None
    country_of_origin: Optional[str] = "India"
    manufacturing_date: Optional[Union[datetime, date, str]] = None
    expiry_date: Optional[Union[datetime, date, str]] = None
    shelf_life_days: Optional[int] = None
    is_vegetarian: bool = True
    storage_type: Optional[str] = None
    nutritional_information: Optional[str] = None
    ingredients: Optional[str] = None
    fssai_license: Optional[str] = None

class ClothingDetailsSchema(BaseModel):
    gender: Optional[str] = None
    clothing_type: Optional[str] = None
    fabric_type: Optional[str] = None
    material: Optional[str] = None
    pattern: Optional[str] = None
    fit_type: Optional[str] = None
    sleeve_type: Optional[str] = None
    neck_type: Optional[str] = None
    occasion: Optional[str] = None
    season: Optional[str] = None
    care_instructions: Optional[str] = None
    country_of_origin: Optional[str] = "India"
    manufacturer: Optional[str] = None
    collection_name: Optional[str] = None

class MedicineDetailsSchema(BaseModel):
    medicine_type: Optional[str] = "Allopathic"
    salt_composition: Optional[str] = None
    generic_name: Optional[str] = None
    strength: Optional[str] = None
    dosage_form: Optional[str] = None
    prescription_required: bool = False
    schedule_type: Optional[str] = "OTC"
    manufacturer: Optional[str] = None
    pack_size: Optional[str] = None
    storage_conditions: Optional[str] = None
    drug_license_number: Optional[str] = None
    therapeutic_category: Optional[str] = None
    side_effects: Optional[str] = None
    usage_instructions: Optional[str] = None

class ElectronicsDetailsSchema(BaseModel):
    device_type: Optional[str] = None
    model_number: Optional[str] = None
    model_name: Optional[str] = None
    manufacturer: Optional[str] = None
    brand_model: Optional[str] = None
    color: Optional[str] = None
    ram: Optional[str] = None
    storage_capacity: Optional[str] = None
    processor: Optional[str] = None
    screen_size: Optional[str] = None
    battery_capacity: Optional[str] = None
    connectivity: Optional[str] = None
    warranty_months: Optional[int] = 12
    warranty_type: Optional[str] = "Brand Warranty"
    power_rating: Optional[str] = None
    country_of_origin: Optional[str] = None

class PlasticDetailsSchema(BaseModel):
    plastic_type: Optional[str] = None
    material_grade: Optional[str] = None
    material_type: Optional[str] = None
    color: Optional[str] = None
    length: Optional[str] = None
    width: Optional[str] = None
    height: Optional[str] = None
    thickness: Optional[str] = None
    weight: Optional[str] = None
    capacity: Optional[str] = None
    capacity_unit: Optional[str] = None
    food_grade: bool = False
    recyclable: bool = True
    usage_type: Optional[str] = None

class HandloomDetailsSchema(BaseModel):
    fabric_type: Optional[str] = None
    weaving_type: Optional[str] = None
    craft_type: Optional[str] = None
    material: Optional[str] = None
    thread_count: Optional[str] = None
    design_name: Optional[str] = None
    pattern: Optional[str] = None
    origin_region: Optional[str] = None
    artisan_name: Optional[str] = None
    handwoven: bool = True
    length: Optional[str] = None
    width: Optional[str] = None
    color: Optional[str] = None
    care_instructions: Optional[str] = None

class FurnitureDetailsSchema(BaseModel):
    furniture_type: Optional[str] = None
    material: Optional[str] = None
    frame_material: Optional[str] = None
    finish_type: Optional[str] = None
    length: Optional[str] = None
    width: Optional[str] = None
    height: Optional[str] = None
    weight: Optional[str] = None
    seating_capacity: Optional[int] = None
    assembly_required: bool = False
    warranty_months: Optional[int] = None
    room_type: Optional[str] = None
    color: Optional[str] = None

class AgroDetailsSchema(BaseModel):
    agro_category: Optional[str] = None
    product_type: Optional[str] = None
    crop_name: Optional[str] = None
    seed_variety: Optional[str] = None
    brand_name: Optional[str] = None
    composition: Optional[str] = None
    active_ingredient: Optional[str] = None
    concentration: Optional[str] = None
    application_method: Optional[str] = None
    recommended_crop: Optional[str] = None
    dosage: Optional[str] = None
    pack_size: Optional[str] = None
    manufacturer: Optional[str] = None
    license_number: Optional[str] = None
    safety_instructions: Optional[str] = None


# --- Product Master Create / Update / Response Schemas ---
class ProductCreate(BaseModel):
    product_name: Optional[str] = None
    name: Optional[str] = None  # alias
    product_code: Optional[str] = None
    sku: Optional[str] = None
    barcode: Optional[str] = None
    category_id: Optional[int] = None
    brand_id: Optional[int] = None
    unit_id: Optional[int] = None
    unit: Optional[str] = "pcs"
    description: Optional[str] = None
    short_description: Optional[str] = None
    product_type: str = "simple"  # simple, variable
    hsn_code: Optional[str] = None
    status: str = "active"
    is_featured: bool = False

    # Shortcut basic fields (for single flat submission or backward compatibility)
    purchase_price: Optional[float] = None
    selling_price: Optional[float] = None
    mrp: Optional[float] = None
    tax_rate: Optional[float] = None
    tax_type: Optional[str] = "exclusive"
    initial_stock: Optional[float] = None
    current_stock: Optional[float] = None
    min_stock_level: Optional[float] = None
    image_url: Optional[str] = None

    # Nested comprehensive components
    pricing: Optional[PricingCreate] = None
    inventory: Optional[InventoryCreate] = None
    alerts: Optional[List[AlertCreate]] = None
    images: Optional[List[ImageCreate]] = None
    variants: Optional[List[VariantCreate]] = None
    batches: Optional[List[BatchCreate]] = None
    serial_numbers: Optional[List[SerialNumberCreate]] = None

    # Store-specific details (generic dictionary or typed schemas)
    store_details: Optional[Dict[str, Any]] = None
    grocery_details: Optional[GroceryDetailsSchema] = None
    clothing_details: Optional[ClothingDetailsSchema] = None
    medicine_details: Optional[MedicineDetailsSchema] = None
    electronics_details: Optional[ElectronicsDetailsSchema] = None
    plastic_details: Optional[PlasticDetailsSchema] = None
    handloom_details: Optional[HandloomDetailsSchema] = None
    furniture_details: Optional[FurnitureDetailsSchema] = None
    agro_details: Optional[AgroDetailsSchema] = None

    # Backward compatibility
    attributes: Optional[Dict[str, Any]] = None


class ProductUpdate(BaseModel):
    product_name: Optional[str] = None
    name: Optional[str] = None
    product_code: Optional[str] = None
    sku: Optional[str] = None
    barcode: Optional[str] = None
    category_id: Optional[int] = None
    brand_id: Optional[int] = None
    unit_id: Optional[int] = None
    unit: Optional[str] = None
    description: Optional[str] = None
    short_description: Optional[str] = None
    product_type: Optional[str] = None
    hsn_code: Optional[str] = None
    status: Optional[str] = None
    is_active: Optional[bool] = None
    is_featured: Optional[bool] = None

    purchase_price: Optional[float] = None
    selling_price: Optional[float] = None
    mrp: Optional[float] = None
    tax_rate: Optional[float] = None
    tax_type: Optional[str] = None
    current_stock: Optional[float] = None
    min_stock_level: Optional[float] = None
    image_url: Optional[str] = None

    pricing: Optional[PricingCreate] = None
    inventory: Optional[InventoryCreate] = None
    alerts: Optional[List[AlertCreate]] = None
    images: Optional[List[ImageCreate]] = None
    variants: Optional[List[VariantCreate]] = None
    batches: Optional[List[BatchCreate]] = None
    serial_numbers: Optional[List[SerialNumberCreate]] = None

    store_details: Optional[Dict[str, Any]] = None
    grocery_details: Optional[GroceryDetailsSchema] = None
    clothing_details: Optional[ClothingDetailsSchema] = None
    medicine_details: Optional[MedicineDetailsSchema] = None
    electronics_details: Optional[ElectronicsDetailsSchema] = None
    plastic_details: Optional[PlasticDetailsSchema] = None
    handloom_details: Optional[HandloomDetailsSchema] = None
    furniture_details: Optional[FurnitureDetailsSchema] = None
    agro_details: Optional[AgroDetailsSchema] = None

    attributes: Optional[Dict[str, Any]] = None


class ProductResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    store_id: int
    product_name: str
    name: str
    product_code: Optional[str] = None
    sku: Optional[str] = None
    barcode: Optional[str] = None
    category_id: Optional[int] = None
    category_name: Optional[str] = None
    brand_id: Optional[int] = None
    brand_name: Optional[str] = None
    unit: str = "pcs"
    selling_price: float = 0.0
    purchase_price: float = 0.0
    mrp: Optional[float] = None
    tax_type: str = "exclusive"
    gst_rate: float = 0.0
    current_stock: float = 0.0
    min_stock_level: float = 5.0
    is_low_stock: bool = False
    is_out_of_stock: bool = False
    status: str = "active"
    is_active: bool = True
    is_featured: bool = False
    has_variants: bool = False
    image_url: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class ProductDetailResponse(ProductResponse):
    description: Optional[str] = None
    short_description: Optional[str] = None
    product_type: str = "simple"
    hsn_code: Optional[str] = None
    pricing: Optional[PricingResponse] = None
    inventory: Optional[InventoryResponse] = None
    alerts: List[AlertResponse] = Field(default_factory=list)
    images: List[ImageResponse] = Field(default_factory=list)
    variants: List[VariantResponse] = Field(default_factory=list)
    batches: List[BatchResponse] = Field(default_factory=list)
    serial_numbers: List[SerialNumberResponse] = Field(default_factory=list)
    store_details: Dict[str, Any] = Field(default_factory=dict)
    attributes: Dict[str, Any] = Field(default_factory=dict)


# --- Form Config Schemas ---
class FormFieldOption(BaseModel):
    label: str
    value: str
    is_default: bool = False

class FormFieldConfig(BaseModel):
    field_name: str
    field_label: str
    field_type: str  # text, number, select, date, boolean, textarea
    is_required: bool = False
    default_value: Optional[str] = None
    placeholder: Optional[str] = None
    help_text: Optional[str] = None
    display_order: int = 0
    section: str = "store_details"  # basic, pricing, inventory, store_details, etc.
    options: Optional[List[FormFieldOption]] = None

class FormConfigResponse(BaseModel):
    store: Dict[str, Any]
    store_type: Dict[str, Any]
    common_fields: List[FormFieldConfig]
    store_specific_fields: List[FormFieldConfig]
    validation_rules: Dict[str, Any]
    categories: List[Dict[str, Any]]
    brands: List[Dict[str, Any]]
    units: List[Dict[str, Any]]
