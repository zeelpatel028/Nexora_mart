export * from './types';
export * from './constants';
export * from './validations';
export * from './services';
export * from './components';
export * from './screens/PlasticAddProductScreen';
export * from './screens/PlasticEditProductScreen';

import { PlasticAddProductScreen } from './screens/PlasticAddProductScreen';
import { PlasticEditProductScreen } from './screens/PlasticEditProductScreen';
import { plasticProductService } from './services';

export const PlasticProductModule = {
  storeType: 'plastic' as const,
  displayName: 'Plastic Store',
  AddProductScreen: PlasticAddProductScreen,
  EditProductScreen: PlasticEditProductScreen,
  service: plasticProductService,
};

export default PlasticProductModule;

