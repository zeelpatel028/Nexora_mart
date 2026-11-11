export * from './types';
export * from './constants';
export * from './validations';
export * from './services';
export * from './components';
export * from './screens/HandloomAddProductScreen';
export * from './screens/HandloomEditProductScreen';

import { HandloomAddProductScreen } from './screens/HandloomAddProductScreen';
import { HandloomEditProductScreen } from './screens/HandloomEditProductScreen';
import { handloomProductService } from './services';

export const HandloomProductModule = {
  storeType: 'handloom' as const,
  displayName: 'Handloom Store',
  AddProductScreen: HandloomAddProductScreen,
  EditProductScreen: HandloomEditProductScreen,
  service: handloomProductService,
};

export default HandloomProductModule;

