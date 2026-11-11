import {
  BaseProductBasicInfo,
  BaseProductPricingInfo,
  BaseProductInventoryInfo,
  BaseProductUnitInfo,
  ProductVariantItem,
} from '../../common/types';

export interface ClothingSpecifications {
  gender: 'men' | 'women' | 'boys' | 'girls' | 'unisex' | 'kids' | string;
  clothingType: string;
  fabric: string;
  pattern: string;
  fit: string;
  neckType?: string;
  sleeveLength?: string;
  occasion?: string;
  careInstructions?: string;
}

export interface ClothingMeasurements {
  chest?: string;
  waist?: string;
  hip?: string;
  length?: string;
  shoulder?: string;
  sleeve?: string;
  inseam?: string;
  rise?: string;
}

export interface ClothingProductFormData {
  basic: BaseProductBasicInfo;
  pricing: BaseProductPricingInfo;
  inventory: BaseProductInventoryInfo;
  units: BaseProductUnitInfo;
  specifications: ClothingSpecifications;
  measurements: ClothingMeasurements;
  selectedSizes: string[];
  selectedColors: string[];
  variants: ProductVariantItem[];
}

