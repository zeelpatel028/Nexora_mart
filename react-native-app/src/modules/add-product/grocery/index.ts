export * from './types';
export * from './constants';
export * from './validations';
export * from './services';
export * from './components';
export * from './screens/GroceryAddProductScreen';
export * from './screens/GroceryEditProductScreen';

import { GroceryAddProductScreen } from './screens/GroceryAddProductScreen';
import { GroceryEditProductScreen } from './screens/GroceryEditProductScreen';
import { groceryProductService } from './services';

export const GroceryProductModule = {
  storeType: 'grocery' as const,
  displayName: 'Grocery Store',
  AddProductScreen: GroceryAddProductScreen,
  EditProductScreen: GroceryEditProductScreen,
  service: groceryProductService,
};

export default GroceryProductModule;

