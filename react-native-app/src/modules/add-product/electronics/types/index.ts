import {
  BaseProductBasicInfo,
  BaseProductPricingInfo,
  BaseProductInventoryInfo,
  BaseProductUnitInfo,
  ProductVariantItem,
} from '../../common/types';

export interface ElectronicsSpecifications {
  deviceType: string;
  modelName?: string;
  modelNumber?: string;
  color?: string;
  ram?: string;
  storageCapacity?: string;
  processor?: string;
  screenSize?: string;
  batteryCapacity?: string;
  connectivity?: string;
  operatingSystem?: string;
  warrantyMonths: number;
  warrantyType: string;
  inTheBox?: string;
}

export interface ElectronicsSerialItem {
  id?: string;
  serialNumber: string;
  imeiNumber?: string;
  imeiNumber2?: string;
  status?: 'available' | 'sold' | 'defective';
}

export interface ElectronicsProductFormData {
  basic: BaseProductBasicInfo;
  pricing: BaseProductPricingInfo;
  inventory: BaseProductInventoryInfo;
  units: BaseProductUnitInfo;
  specifications: ElectronicsSpecifications;
  serialNumbers: ElectronicsSerialItem[];
  variants?: ProductVariantItem[];
}

