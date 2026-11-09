import { StoreTypeConfig } from './types';
import { groceryConfig } from './grocery';
import { clothingConfig } from './clothing';
import { medicalConfig } from './medical';
import { mobileElectronicsConfig } from './mobileElectronics';
import { plasticConfig } from './plastic';
import { handloomConfig } from './handloom';
import { furnitureConfig } from './furniture';
import { agroConfig } from './agro';

export * from './types';
export {
  groceryConfig,
  clothingConfig,
  medicalConfig,
  mobileElectronicsConfig,
  plasticConfig,
  handloomConfig,
  furnitureConfig,
  agroConfig,
};

const storeTypeRegistry: Record<string, StoreTypeConfig> = {
  grocery: groceryConfig,
  clothing: clothingConfig,
  medical: medicalConfig,
  mobile_electronics: mobileElectronicsConfig,
  plastic: plasticConfig,
  handloom: handloomConfig,
  furniture: furnitureConfig,
  agro: agroConfig,
};

// Aliases for matching names/codes from backend
const aliasMap: Record<string, string> = {
  pharmacy: 'medical',
  electronics: 'mobile_electronics',
  mobile: 'mobile_electronics',
  supermarket: 'grocery',
  'grocery store': 'grocery',
  'clothing store': 'clothing',
  'medical / pharmacy store': 'medical',
  'mobile & electronics store': 'mobile_electronics',
  'plastic store': 'plastic',
  'handloom store': 'handloom',
  'furniture store': 'furniture',
  'agro store': 'agro',
};

export function getStoreTypeConfig(codeOrName?: string | null): StoreTypeConfig {
  if (!codeOrName) {
    return groceryConfig;
  }
  const clean = codeOrName.trim().toLowerCase();
  if (storeTypeRegistry[clean]) {
    return storeTypeRegistry[clean];
  }
  if (aliasMap[clean] && storeTypeRegistry[aliasMap[clean]]) {
    return storeTypeRegistry[aliasMap[clean]];
  }
  // Substring match
  for (const [key, config] of Object.entries(storeTypeRegistry)) {
    if (key.includes(clean) || clean.includes(key) || config.name.toLowerCase().includes(clean)) {
      return config;
    }
  }
  return groceryConfig;
}

export function getAllStoreTypeConfigs(): StoreTypeConfig[] {
  return [
    groceryConfig,
    clothingConfig,
    medicalConfig,
    mobileElectronicsConfig,
    plasticConfig,
    handloomConfig,
    furnitureConfig,
    agroConfig,
  ];
}

