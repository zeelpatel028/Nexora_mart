export * from './types';
export * from './constants';
export * from './validations';
export * from './services';
export * from './components';
export * from './screens/AgroAddProductScreen';
export * from './screens/AgroEditProductScreen';

import { AgroAddProductScreen } from './screens/AgroAddProductScreen';
import { AgroEditProductScreen } from './screens/AgroEditProductScreen';
import { agroProductService } from './services';

export const AgroProductModule = {
  storeType: 'agro' as const,
  displayName: 'Agro Store',
  AddProductScreen: AgroAddProductScreen,
  EditProductScreen: AgroEditProductScreen,
  service: agroProductService,
};

export default AgroProductModule;

