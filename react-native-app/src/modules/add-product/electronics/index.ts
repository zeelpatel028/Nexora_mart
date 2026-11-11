export * from './types';
export * from './constants';
export * from './validations';
export * from './services';
export * from './components';
export * from './screens/ElectronicsAddProductScreen';
export * from './screens/ElectronicsEditProductScreen';

import { ElectronicsAddProductScreen } from './screens/ElectronicsAddProductScreen';
import { ElectronicsEditProductScreen } from './screens/ElectronicsEditProductScreen';
import { electronicsProductService } from './services';

export const ElectronicsProductModule = {
  storeType: 'electronics' as const,
  displayName: 'Mobile & Electronics Store',
  AddProductScreen: ElectronicsAddProductScreen,
  EditProductScreen: ElectronicsEditProductScreen,
  service: electronicsProductService,
};

export default ElectronicsProductModule;

