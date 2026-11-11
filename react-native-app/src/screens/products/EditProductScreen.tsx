import React from 'react';
import { useResolvedProductModule } from '../../modules/add-product/registry/productModuleResolver';

/**
 * Root Edit Product Screen delegator.
 * Resolves and renders the store-specific Edit Product module based on
 * the authenticated user's store type from backend session data.
 */
export const EditProductScreen: React.FC = () => {
  const { EditProductScreen: StoreSpecificEditScreen } = useResolvedProductModule();

  return <StoreSpecificEditScreen />;
};

export default EditProductScreen;
