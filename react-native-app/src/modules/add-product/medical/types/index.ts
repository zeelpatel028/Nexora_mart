import {
  BaseProductBasicInfo,
  BaseProductPricingInfo,
  BaseProductInventoryInfo,
  BaseProductUnitInfo,
  ProductBatchItem,
} from '../../common/types';

export interface MedicalSpecifications {
  genericName?: string;
  medicineType: string;
  composition: string;
  strength?: string;
  strengthUnit: string;
  dosageForm: string;
  routeOfAdministration?: string;
  prescriptionRequired: boolean;
  scheduleType: string;
  therapeuticCategory?: string;
  drugLicenseNumber?: string;
  storageCondition?: string;
}

export interface MedicalPackagingDetails {
  packSize?: string;
  stripsPerBox?: number;
  tabletsPerStrip?: number;
  keepRefrigerated: boolean;
  lightSensitive: boolean;
  manufacturer?: string;
  sideEffects?: string;
}

export interface MedicalProductFormData {
  basic: BaseProductBasicInfo;
  pricing: BaseProductPricingInfo;
  inventory: BaseProductInventoryInfo;
  units: BaseProductUnitInfo;
  specifications: MedicalSpecifications;
  packaging: MedicalPackagingDetails;
  batches: ProductBatchItem[];
}

