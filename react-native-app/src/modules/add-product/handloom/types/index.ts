import {
  BaseProductBasicInfo,
  BaseProductPricingInfo,
  BaseProductInventoryInfo,
  BaseProductUnitInfo,
  ProductVariantItem,
} from '../../common/types';

export interface HandloomSpecifications {
  productType: string;
  fabricType: string;
  weavingTechnique: string;
  craftType: string;
  material?: string;
  designPattern?: string;
  originRegion?: string;
  artisanName?: string;
  handwoven: boolean;
  length?: string;
  width?: string;
  blouseIncluded?: boolean;
  hasGiTag?: boolean;
  giTagNumber?: string;
  careInstructions?: string;
}

export interface HandloomProductFormData {
  basic: BaseProductBasicInfo;
  pricing: BaseProductPricingInfo;
  inventory: BaseProductInventoryInfo;
  units: BaseProductUnitInfo;
  specifications: HandloomSpecifications;
  variants?: ProductVariantItem[];
}

