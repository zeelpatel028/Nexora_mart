/**
 * Common Constants & Tax/Unit Presets
 */
import {
  BaseProductBasicInfo,
  BaseProductPricingInfo,
  BaseProductInventoryInfo,
  BaseProductUnitInfo,
  ProductUnitOption,
  StoreTypeCode,
} from '../types';

export const GST_RATE_OPTIONS = [
  { label: '0% (Exempt / Nil)', value: 0 },
  { label: '5% GST', value: 5 },
  { label: '12% GST', value: 12 },
  { label: '18% GST', value: 18 },
  { label: '28% GST', value: 28 },
];

export const TAX_TREATMENT_OPTIONS = [
  { label: 'Tax Exclusive (Base + GST)', value: 'exclusive' },
  { label: 'Tax Inclusive (GST inside MRP)', value: 'inclusive' },
  { label: 'Tax Exempt', value: 'exempt' },
];

export const PRODUCT_STATUS_OPTIONS = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
  { label: 'Draft', value: 'draft' },
];

export const DEFAULT_PRODUCT_UNITS: ProductUnitOption[] = [
  { unitCode: 'PCS', unitName: 'Pieces / Nos', allowDecimal: false },
  { unitCode: 'KG', unitName: 'Kilograms (kg)', allowDecimal: true },
  { unitCode: 'GM', unitName: 'Grams (g)', allowDecimal: true },
  { unitCode: 'LTR', unitName: 'Litres (L)', allowDecimal: true },
  { unitCode: 'ML', unitName: 'Millilitres (ml)', allowDecimal: true },
  { unitCode: 'BOX', unitName: 'Box', allowDecimal: false },
  { unitCode: 'STRIP', unitName: 'Strip', allowDecimal: false },
  { unitCode: 'PKT', unitName: 'Packet', allowDecimal: false },
  { unitCode: 'MTR', unitName: 'Meters (m)', allowDecimal: true },
  { unitCode: 'PAIR', unitName: 'Pairs', allowDecimal: false },
  { unitCode: 'SET', unitName: 'Set', allowDecimal: false },
  { unitCode: 'DOZ', unitName: 'Dozen (12 pcs)', allowDecimal: false },
];

export const COMMON_UNITS = [
  'PCS',
  'KG',
  'GM',
  'LTR',
  'ML',
  'BOX',
  'STRIP',
  'TABLET',
  'BAG',
  'CARTON',
  'BUNDLE',
  'DOZEN',
  'METER',
  'YARD',
  'PAIR',
  'SET',
  'UNIT',
  'TIN',
  'JAR',
];

export const STORE_TYPE_SKU_PREFIXES: Record<StoreTypeCode, string> = {
  grocery: 'GROC',
  clothing: 'CLTH',
  medical: 'MED',
  electronics: 'ELEC',
  plastic: 'PLAS',
  handloom: 'HNDL',
  furniture: 'FURN',
  agro: 'AGRO',
};

export const STORE_TYPE_METADATA: Record<
  StoreTypeCode,
  { displayName: string; icon: string; badgeColor: string; description: string }
> = {
  grocery: {
    displayName: 'Grocery Store',
    icon: 'basket-outline',
    badgeColor: '#10B981',
    description: 'Food items, FMCG, perishables, weight & batch expiry',
  },
  clothing: {
    displayName: 'Clothing Store',
    icon: 'shirt-outline',
    badgeColor: '#6366F1',
    description: 'Apparel, fabric, size-color variants & measurements',
  },
  medical: {
    displayName: 'Medical Store',
    icon: 'medkit-outline',
    badgeColor: '#EF4444',
    description: 'Medicines, batches, FEFO, composition & Rx schedules',
  },
  electronics: {
    displayName: 'Electronics Store',
    icon: 'hardware-chip-outline',
    badgeColor: '#3B82F6',
    description: 'Gadgets, serial / IMEI tracking, warranty & specs',
  },
  plastic: {
    displayName: 'Plastic Store',
    icon: 'cube-outline',
    badgeColor: '#EC4899',
    description: 'Containers, material grades, dimensions & food-grade cert',
  },
  handloom: {
    displayName: 'Handloom Store',
    icon: 'color-palette-outline',
    badgeColor: '#8B5CF6',
    description: 'Crafts, artisan details, weaving techniques & GI tags',
  },
  furniture: {
    displayName: 'Furniture Store',
    icon: 'business-outline',
    badgeColor: '#F59E0B',
    description: 'Wood types, finishes, dimensions, assembly & warranty',
  },
  agro: {
    displayName: 'Agro Store',
    icon: 'leaf-outline',
    badgeColor: '#14B8A6',
    description: 'Seeds, fertilizers, crop medicines, active ingredients & expiry',
  },
};

export const DEFAULT_BASIC_INFO: BaseProductBasicInfo = {
  productName: '',
  productCode: '',
  sku: '',
  barcode: '',
  categoryId: null,
  subcategoryId: null,
  brandId: null,
  shortDescription: '',
  description: '',
  status: 'active',
  isFeatured: false,
  images: [],
};

export const DEFAULT_PRICING_INFO: BaseProductPricingInfo = {
  purchasePrice: '',
  sellingPrice: '',
  mrp: '',
  wholesalePrice: '',
  discountType: 'percentage',
  discountValue: '0',
  taxType: 'inclusive',
  gstRate: 0,
  hsnCode: '',
};

export const DEFAULT_INVENTORY_INFO: BaseProductInventoryInfo = {
  openingStock: '0',
  currentStock: '0',
  minimumStock: '5',
  maximumStock: '',
  reorderLevel: '10',
  warehouseLocation: '',
  trackInventory: true,
  allowNegativeStock: false,
};

export const DEFAULT_UNIT_INFO: BaseProductUnitInfo = {
  primaryUnit: 'PCS',
  secondaryUnit: '',
  conversionFactor: 1,
  allowDecimal: false,
  purchaseUnit: 'PCS',
  sellingUnit: 'PCS',
  conversionRatio: '1',
};

export const STORE_TYPE_ALIASES: Record<string, string> = {
  grocery: 'grocery',
  supermarket: 'grocery',
  kirana: 'grocery',
  'grocery store': 'grocery',

  clothing: 'clothing',
  apparel: 'clothing',
  garments: 'clothing',
  'clothing store': 'clothing',

  medical: 'medical',
  pharmacy: 'medical',
  medicine: 'medical',
  'medical / pharmacy store': 'medical',
  'medical store': 'medical',

  electronics: 'electronics',
  mobile: 'electronics',
  mobile_electronics: 'electronics',
  'mobile & electronics store': 'electronics',
  'electronics store': 'electronics',

  plastic: 'plastic',
  'plastic store': 'plastic',

  handloom: 'handloom',
  textiles: 'handloom',
  'handloom store': 'handloom',

  furniture: 'furniture',
  'furniture store': 'furniture',

  agro: 'agro',
  agriculture: 'agro',
  'agro store': 'agro',
};
