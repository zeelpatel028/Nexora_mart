import { StoreTypeCode } from '../common/types';

export const STORE_PRODUCT_ROUTES = {
  ADD_PRODUCT: 'AddProduct',
  EDIT_PRODUCT: 'EditProduct',
  PRODUCT_DETAILS: 'ProductDetail',
  PRODUCT_LIST: 'ProductList',

  // Store-specific direct sub-routes (if needed for deep linking)
  GROCERY_ADD: 'GroceryAddProduct',
  CLOTHING_ADD: 'ClothingAddProduct',
  MEDICAL_ADD: 'MedicalAddProduct',
  ELECTRONICS_ADD: 'ElectronicsAddProduct',
  PLASTIC_ADD: 'PlasticAddProduct',
  HANDLOOM_ADD: 'HandloomAddProduct',
  FURNITURE_ADD: 'FurnitureAddProduct',
  AGRO_ADD: 'AgroAddProduct',
} as const;

export const STORE_ROUTE_NAMES_BY_TYPE: Record<StoreTypeCode, string> = {
  grocery: STORE_PRODUCT_ROUTES.GROCERY_ADD,
  clothing: STORE_PRODUCT_ROUTES.CLOTHING_ADD,
  medical: STORE_PRODUCT_ROUTES.MEDICAL_ADD,
  electronics: STORE_PRODUCT_ROUTES.ELECTRONICS_ADD,
  plastic: STORE_PRODUCT_ROUTES.PLASTIC_ADD,
  handloom: STORE_PRODUCT_ROUTES.HANDLOOM_ADD,
  furniture: STORE_PRODUCT_ROUTES.FURNITURE_ADD,
  agro: STORE_PRODUCT_ROUTES.AGRO_ADD,
};

