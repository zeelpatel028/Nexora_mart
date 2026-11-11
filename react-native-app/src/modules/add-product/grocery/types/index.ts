import {
  BaseProductBasicInfo,
  BaseProductPricingInfo,
  BaseProductInventoryInfo,
  BaseProductUnitInfo,
  ProductBatchItem,
} from '../../common/types';

export interface GrocerySpecifications {
  foodType: 'Vegetarian' | 'Non-Vegetarian' | 'Egg' | 'Vegan' | string;
  itemType: string;
  packagingType: string;
  netWeight?: string;
  grossWeight?: string;
  shelfLifeDays?: string;
  isVegetarian: boolean;
  isOrganic: boolean;
  storageType?: string;
  fssaiLicense?: string;
  ingredients?: string;
  allergenInfo?: string;
  manufacturer?: string;
  nutritionalInfo?: string;
}

export interface GroceryProductFormData {
  basic: BaseProductBasicInfo;
  pricing: BaseProductPricingInfo;
  inventory: BaseProductInventoryInfo;
  units: BaseProductUnitInfo;
  specifications: GrocerySpecifications;
  batches: ProductBatchItem[];
}

