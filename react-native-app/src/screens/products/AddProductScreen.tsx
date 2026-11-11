import React from 'react';
import { useResolvedProductModule } from '../../modules/add-product/registry/productModuleResolver';

/**
 * Root Add Product Screen delegator.
 * Resolves and renders the store-specific Add Product module based on
 * the authenticated user's store type from backend session data.
 */
export const AddProductScreen: React.FC = () => {
  const { AddProductScreen: StoreSpecificAddScreen } = useResolvedProductModule();

  return <StoreSpecificAddScreen />;
};

export default AddProductScreen;
