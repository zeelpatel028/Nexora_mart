import React from 'react';

export type StoreTypeCode =
  | 'grocery'
  | 'clothing'
  | 'medical'
  | 'electronics'
  | 'plastic'
  | 'handloom'
  | 'furniture'
  | 'agro';

export interface StoreEntryModule {
  storeType: StoreTypeCode;
  getScreen: (screenName: string) => React.ComponentType<any>;
}

const VALID_STORES: StoreTypeCode[] = [
  'grocery',
  'clothing',
  'medical',
  'electronics',
  'plastic',
  'handloom',
  'furniture',
  'agro',
];

const storeCache = new Map<StoreTypeCode, StoreEntryModule>();

/**
 * Normalizes any backend shop_category / store_type value into one of the 8 store folders.
 */
export function resolveCanonicalStoreType(raw?: string | null): StoreTypeCode {
  if (!raw || typeof raw !== 'string') return 'grocery';
  const cleaned = raw.trim().toLowerCase();

  if (VALID_STORES.includes(cleaned as StoreTypeCode)) {
    return cleaned as StoreTypeCode;
  }
  if (cleaned.includes('cloth') || cleaned.includes('garment') || cleaned.includes('apparel')) {
    return 'clothing';
  }
  if (cleaned.includes('medic') || cleaned.includes('pharm') || cleaned.includes('chemist')) {
    return 'medical';
  }
  if (cleaned.includes('elect') || cleaned.includes('mobile') || cleaned.includes('gadget')) {
    return 'electronics';
  }
  if (cleaned.includes('plast')) return 'plastic';
  if (cleaned.includes('handloom') || cleaned.includes('textile') || cleaned.includes('saree')) {
    return 'handloom';
  }
  if (cleaned.includes('furnit') || cleaned.includes('wood') || cleaned.includes('sofa')) {
    return 'furniture';
  }
  if (cleaned.includes('agro') || cleaned.includes('kisan') || cleaned.includes('fertiliz') || cleaned.includes('seed')) {
    return 'agro';
  }
  return 'grocery';
}

/**
 * Dynamically loads ONLY the matching store folder on demand and caches it.
 */
export function getStoreModule(storeType: StoreTypeCode): StoreEntryModule {
  const safeType = resolveCanonicalStoreType(storeType);
  const cached = storeCache.get(safeType);
  if (cached) return cached;

  let mod: StoreEntryModule;
  switch (safeType) {
    case 'clothing':
      mod = require('../stores/clothing').default;
      break;
    case 'medical':
      mod = require('../stores/medical').default;
      break;
    case 'electronics':
      mod = require('../stores/electronics').default;
      break;
    case 'plastic':
      mod = require('../stores/plastic').default;
      break;
    case 'handloom':
      mod = require('../stores/handloom').default;
      break;
    case 'furniture':
      mod = require('../stores/furniture').default;
      break;
    case 'agro':
      mod = require('../stores/agro').default;
      break;
    case 'grocery':
    default:
      mod = require('../grocery').default;
      break;
  }

  storeCache.set(safeType, mod);
  return mod;
}

export function getStoreScreen(
  storeType: StoreTypeCode,
  screenName: string
): React.ComponentType<any> {
  return getStoreModule(storeType).getScreen(screenName);
}

export default {
  resolveCanonicalStoreType,
  getStoreModule,
  getStoreScreen,
};
