import {
  BaseProductBasicInfo,
  BaseProductPricingInfo,
  BaseProductInventoryInfo,
  BaseProductUnitInfo,
  ProductVariantItem,
} from './commonTypes';

export interface FurnitureSpecifications {
  furnitureType: string;
  material: string;
  woodType?: string;
  finishType?: string;
  color?: string;
  seatingCapacity?: string;
  length?: string;
  width?: string;
  height?: string;
  dimensionUnit: string;
  weight?: string;
  weightUnit: string;
  assemblyRequired: boolean;
  storageAvailable: boolean;
  warrantyPeriod: number;
  warrantyUnit: string;
  upholsteryType?: string;
  careInstructions?: string;
}

export interface FurnitureProductFormData {
  basic: BaseProductBasicInfo;
  pricing: BaseProductPricingInfo;
  inventory: BaseProductInventoryInfo;
  units: BaseProductUnitInfo;
  specifications: FurnitureSpecifications;
  variants?: ProductVariantItem[];
}

