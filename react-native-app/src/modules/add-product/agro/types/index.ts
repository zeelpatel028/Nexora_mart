import {
  BaseProductBasicInfo,
  BaseProductPricingInfo,
  BaseProductInventoryInfo,
  BaseProductUnitInfo,
  ProductBatchItem,
} from '../../common/types';

export type AgroProductType = 'Crop Medicine' | 'Crop' | 'Fertilizer' | 'Seeds';

export interface AgroMedicineDetails {
  medicineType: string;
  activeIngredient: string;
  chemicalComposition?: string;
  concentration?: string;
  formulationType: string;
  targetPest?: string;
  suitableCrops?: string;
  applicationMethod: string;
  recommendedDosage?: string;
  dosageUnit?: string;
  waitingPeriodPhi?: string;
  reEntryInterval?: string;
  toxicityClass?: string;
  registrationNumber?: string;
  labelInstructions?: string;
  safetyInstructions?: string;
}

export interface AgroCropDetails {
  cropCategory: string;
  cropVariety: string;
  cropSeason: string;
  cropDuration?: string;
  growingRegion?: string;
  grade: string;
  moistureContent?: string;
  organicCertified: boolean;
  harvestYear?: string;
}

export interface AgroFertilizerDetails {
  fertilizerType: string;
  nitrogenPct?: string;
  phosphorusPct?: string;
  potassiumPct?: string;
  sulphurPct?: string;
  zincPct?: string;
  boronPct?: string;
  physicalForm: string;
  applicationMethod: string;
  suitableCrops?: string;
}

export interface AgroSeedDetails {
  seedType: string;
  cropName: string;
  seedVariety: string;
  hybridType: string;
  seedClass: string;
  germinationRate?: string;
  physicalPurity?: string;
  geneticPurity?: string;
  seedCertificationNumber?: string;
  lotNumber?: string;
  daysToMaturity?: string;
}

export interface AgroProductFormData {
  basic: BaseProductBasicInfo;
  pricing: BaseProductPricingInfo;
  inventory: BaseProductInventoryInfo;
  units: BaseProductUnitInfo;
  agroProductType: AgroProductType;
  medicineDetails?: AgroMedicineDetails;
  cropDetails?: AgroCropDetails;
  fertilizerDetails?: AgroFertilizerDetails;
  seedDetails?: AgroSeedDetails;
  batches: ProductBatchItem[];
}

