/**
 * Tulsi Mart Multi-Category Store System
 * 8 Standardized Store Types matching backend seed_service.py
 */
export const STORE_TYPES = [
  'Grocery Store',
  'Clothing Store',
  'Medical / Pharmacy Store',
  'Mobile & Electronics Store',
  'Plastic Store',
  'Handloom Store',
  'Furniture Store',
  'Agro Store'
];

export const CATEGORY_DEFINITIONS = [
  { code: 'grocery', name: 'Grocery Store', icon: '🛒', description: 'Daily essentials, packaged food items, groceries, and staples' },
  { code: 'clothing', name: 'Clothing Store', icon: '👕', description: 'Apparel, textiles, and fashion garments with size/color variants' },
  { code: 'medical', name: 'Medical / Pharmacy Store', icon: '💊', description: 'Pharmaceuticals, medicines, surgical supplies, and healthcare goods' },
  { code: 'mobile_electronics', name: 'Mobile & Electronics Store', icon: '📱', description: 'Smartphones, appliances, audio, gadgets, and warranty tracking' },
  { code: 'plastic', name: 'Plastic Store', icon: '📦', description: 'Plastic housewares, containers, storage boxes, and polymer goods' },
  { code: 'handloom', name: 'Handloom Store', icon: '🧵', description: 'Handloom textiles, traditional fabrics, sarees, and home furnishings' },
  { code: 'furniture', name: 'Furniture Store', icon: '🪑', description: 'Home and office furniture, wooden decor, tables, and chairs' },
  { code: 'agro', name: 'Agro Store', icon: '🌱', description: 'Seeds, fertilizers, agricultural implements, and pesticides' }
];

export default STORE_TYPES;
