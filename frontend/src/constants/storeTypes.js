/**
 * Nexora All-in-One Multi-Category Store System
 * 10 Core Store Categories
 */
export const STORE_TYPES = [
  'Grocery Store',
  'Supermarket',
  'Medical Store',
  'Clothing Store',
  'Electronics Store',
  'Mobile Accessories',
  'Hardware Store',
  'Stationery Store',
  'Footwear Store',
  'Vegetable & Fruit Shop'
];

export const CATEGORY_DEFINITIONS = [
  { code: 'grocery', name: 'Grocery Store', icon: '🛒', description: 'Packaged foods, staples, household commodities with weight and expiry tracking' },
  { code: 'supermarket', name: 'Supermarket', icon: '🏬', description: 'Large scale FMCG retail with barcode scanning, batch tracking, and MRP pricing' },
  { code: 'medical', name: 'Medical Store', icon: '💊', description: 'Pharmaceutical drugs with mandatory batch number, manufacturer, and expiry compliance' },
  { code: 'clothing', name: 'Clothing Store', icon: '👕', description: 'Fashion apparel with size, color, fabric attributes and multi-variant stock' },
  { code: 'electronics', name: 'Electronics Store', icon: '💻', description: 'Appliances and gadgets with brand, model, serial number, and warranty tracking' },
  { code: 'mobile_accessories', name: 'Mobile Accessories', icon: '📱', description: 'Cases, chargers, cables with device compatibility and model mapping' },
  { code: 'hardware', name: 'Hardware Store', icon: '🔧', description: 'Tools, building supplies, fasteners with material, size, and weight specs' },
  { code: 'stationery', name: 'Stationery Store', icon: '📚', description: 'Books, paper supplies, pens with paper size and item type classifications' },
  { code: 'footwear', name: 'Footwear Store', icon: '👟', description: 'Shoes and sandals with size-wise inventory, color, and material attributes' },
  { code: 'vegetable_fruit', name: 'Vegetable & Fruit Shop', icon: '🍎', description: 'Fresh produce with quality grading, weight-based inventory, and rapid turnover' }
];

export default STORE_TYPES;
