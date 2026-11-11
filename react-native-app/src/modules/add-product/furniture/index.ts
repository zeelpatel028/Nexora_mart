export * from './types';
export * from './constants';
export * from './validations';
export * from './services';
export * from './components';
export * from './screens/FurnitureAddProductScreen';
export * from './screens/FurnitureEditProductScreen';

import { FurnitureAddProductScreen } from './screens/FurnitureAddProductScreen';
import { FurnitureEditProductScreen } from './screens/FurnitureEditProductScreen';
import { furnitureProductService } from './services';

export const FurnitureProductModule = {
  storeType: 'furniture' as const,
  displayName: 'Furniture Store',
  AddProductScreen: FurnitureAddProductScreen,
  EditProductScreen: FurnitureEditProductScreen,
  service: furnitureProductService,
};

export default FurnitureProductModule;

