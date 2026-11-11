import React, { useMemo } from 'react';
import { StoreTypeCode } from '../common/types';
import { STORE_TYPE_ALIASES } from '../common/constants';
import { StoreProductRegistry, StoreProductModuleDescriptor } from './storeProductRegistry';
import { useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';

/**
 * Normalizes any raw store type identifier into one of the 8 canonical StoreTypeCodes.
 */
export function resolveStoreType(raw?: string | null): StoreTypeCode {
  if (!raw || typeof raw !== 'string') {
    return 'grocery';
  }

  const cleaned = raw.trim().toLowerCase();
  const canonical = STORE_TYPE_ALIASES[cleaned];

  if (canonical && StoreProductRegistry.has(canonical as StoreTypeCode)) {
    return canonical as StoreTypeCode;
  }

  // Substring fallback check
  if (cleaned.includes('cloth') || cleaned.includes('garment') || cleaned.includes('apparel')) {
    return 'clothing';
  }
  if (cleaned.includes('medic') || cleaned.includes('pharm') || cleaned.includes('chemist')) {
    return 'medical';
  }
  if (cleaned.includes('elect') || cleaned.includes('mobile') || cleaned.includes('gadget')) {
    return 'electronics';
  }
  if (cleaned.includes('plast')) {
    return 'plastic';
  }
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
 * Resolves the Store Product Module Descriptor for a store type.
 */
export function resolveProductModule(rawStoreType?: string | null): StoreProductModuleDescriptor {
  const canonicalType = resolveStoreType(rawStoreType);
  return StoreProductRegistry.get(canonicalType);
}

/**
 * Returns the Add Product screen component for the given store type.
 */
export function resolveAddProductScreen(rawStoreType?: string | null): React.ComponentType<any> {
  const mod = resolveProductModule(rawStoreType);
  return mod.AddProductScreen;
}

/**
 * Returns the Edit Product screen component for the given store type.
 */
export function resolveEditProductScreen(rawStoreType?: string | null): React.ComponentType<any> {
  const mod = resolveProductModule(rawStoreType);
  return mod.EditProductScreen;
}

/**
 * React Hook that securely reads the authenticated store type from AuthContext
 * and returns the appropriate store-specific module and screen components.
 */
export function useResolvedProductModule(overrideStoreType?: string | null) {
  const { user, store } = useContext(AuthContext);

  const activeStoreType = useMemo(() => {
    if (overrideStoreType) {
      return resolveStoreType(overrideStoreType);
    }

    // 1. Authenticated store object (backend source of truth)
    const storeTypeCode =
      store?.store_type?.code ||
      (typeof store?.store_type === 'string' ? store.store_type : null) ||
      store?.store_type?.name;

    if (storeTypeCode) {
      return resolveStoreType(storeTypeCode);
    }

    // 2. User profile store_type
    const userStoreType = user?.store_type || user?.storeType;
    if (userStoreType) {
      return resolveStoreType(userStoreType);
    }

    return 'grocery';
  }, [user, store, overrideStoreType]);

  const moduleDescriptor = useMemo(() => {
    return StoreProductRegistry.get(activeStoreType);
  }, [activeStoreType]);

  return {
    storeType: activeStoreType,
    module: moduleDescriptor,
    AddProductScreen: moduleDescriptor.AddProductScreen,
    EditProductScreen: moduleDescriptor.EditProductScreen,
    service: moduleDescriptor.service,
  };
}

export default {
  resolveStoreType,
  resolveProductModule,
  resolveAddProductScreen,
  resolveEditProductScreen,
  useResolvedProductModule,
};

