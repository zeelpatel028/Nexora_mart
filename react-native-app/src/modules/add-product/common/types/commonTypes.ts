/**
 * Common Add Product TypeScript Types & Interfaces
 * Shared across all 8 Store Types in Nexora Mart
 */

export type StoreTypeCode =
  | 'grocery'
  | 'clothing'
  | 'medical'
  | 'electronics'
  | 'plastic'
  | 'handloom'
  | 'furniture'
  | 'agro';

export type ProductStatus = 'active' | 'inactive' | 'draft';
export type TaxTreatment = 'exclusive' | 'inclusive' | 'exempt';
export type DiscountType = 'percentage' | 'fixed';

export interface BaseProductBasicInfo {
  productName: string;
  productCode?: string;
  sku: string;
  barcode?: string;
  categoryId?: number | null;
  subcategoryId?: number | null;
  brandId?: number | null;
  shortDescription?: string;
  description?: string;
  status: ProductStatus;
  isFeatured?: boolean;
  images: Array<{
    id?: string;
    image_url: string;
    is_primary?: boolean;
    display_order?: number;
  }>;
}

export interface BaseProductPricingInfo {
  purchasePrice: string;
  sellingPrice: string;
  mrp?: string;
  wholesalePrice?: string;
  discountType: DiscountType;
  discountValue: string;
  taxType: TaxTreatment;
  gstRate: number;
  hsnCode?: string;
}

export interface BaseProductInventoryInfo {
  openingStock?: string;
  currentStock: string;
  minimumStock: string;
  maximumStock?: string;
  reorderLevel?: string;
  warehouseLocation?: string;
  trackInventory?: boolean;
  allowNegativeStock?: boolean;
  enableLowStockAlert?: boolean;
  enableExpiryAlert?: boolean;
  expiryDate?: string;
}

export interface ProductUnitOption {
  id?: number;
  unitCode: string;
  unitName: string;
  allowDecimal?: boolean;
}

export interface BaseProductUnitInfo {
  purchaseUnit?: string;
  sellingUnit?: string;
  conversionRatio?: string;
  netWeight?: string;
  netWeightUnit?: string;
  primaryUnit?: string;
  secondaryUnit?: string;
  conversionFactor?: number;
  allowDecimal?: boolean;
  hsnCode?: string;
}

export interface ProductVariantItem {
  id?: string;
  variant_name?: string;
  name?: string;
  size?: string;
  color?: string;
  sku: string;
  barcode?: string;
  stock_quantity: string;
  purchase_price: string;
  selling_price: string;
  mrp?: string;
  wholesale_price?: string;
  min_stock_alert?: string;
  variant_image_url?: string;
  is_active?: boolean;
  [key: string]: any;
}

export interface ProductBatchItem {
  id?: string;
  batch_number: string;
  manufacturing_date?: string;
  expiry_date: string;
  purchase_price: string;
  selling_price: string;
  mrp?: string;
  initial_quantity: string;
  current_quantity: string;
  rack_location?: string;
  supplier_id?: number | null;
  is_active?: boolean;
}

export interface UnitConversionRule {
  fromUnit: string;
  toUnit: string;
  multiplier: number;
  description?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface StoreModuleDefinition {
  code: StoreTypeCode;
  name: string;
  icon: string;
  description: string;
  AddProductScreen: React.ComponentType<any>;
  EditProductScreen: React.ComponentType<any>;
  defaultUnits: {
    purchase: string;
    selling: string;
    conversion: string;
  };
  hasVariants: boolean;
  hasBatches: boolean;
  hasSerials: boolean;
}
