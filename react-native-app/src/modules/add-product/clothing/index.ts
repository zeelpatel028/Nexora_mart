export * from './types';
export * from './constants';
export * from './validations';
export * from './services';
export * from './components';
export * from './screens/ClothingAddProductScreen';
export * from './screens/ClothingEditProductScreen';

import { ClothingAddProductScreen } from './screens/ClothingAddProductScreen';
import { ClothingEditProductScreen } from './screens/ClothingEditProductScreen';
import { clothingProductService } from './services';

export const ClothingProductModule = {
  storeType: 'clothing' as const,
  displayName: 'Clothing Store',
  AddProductScreen: ClothingAddProductScreen,
  EditProductScreen: ClothingEditProductScreen,
  service: clothingProductService,
};

export default ClothingProductModule;

