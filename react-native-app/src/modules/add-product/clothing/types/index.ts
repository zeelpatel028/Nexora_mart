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
  collarType?: string;
  closureType?: string;
  pocketType?: string;
  waistType?: string;
  riseType?: string;
  washType?: string;
  length?: string;
  workType?: string;
  borderType?: string;
  blousePiece?: string;
  dressType?: string;
  color?: string;
  material?: string;
  customSpecs?: Array<{ name: string; value: string }>;
  [key: string]: any;
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
  measurements?: ClothingMeasurements;
  selectedSizes: string[];
  selectedColors: string[];
  variants: ProductVariantItem[];
}

