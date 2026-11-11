import {
  BaseProductBasicInfo,
  BaseProductPricingInfo,
  BaseProductInventoryInfo,
  BaseProductUnitInfo,
  ProductVariantItem,
} from '../../common/types';

export interface PlasticSpecifications {
  plasticType: string;
  materialGrade: string;
  color?: string;
  shape: string;
  capacity?: string;
  capacityUnit: string;
  length?: string;
  width?: string;
  height?: string;
  thickness?: string;
  weight?: string;
  foodGrade: boolean;
  recyclable: boolean;
  uvResistant: boolean;
}

export interface PlasticProductFormData {
  basic: BaseProductBasicInfo;
  pricing: BaseProductPricingInfo;
  inventory: BaseProductInventoryInfo;
  units: BaseProductUnitInfo;
  specifications: PlasticSpecifications;
  variants?: ProductVariantItem[];
}

