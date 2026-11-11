export * from './types';
export * from './constants';
export * from './validations';
export * from './services';
export * from './components';
export * from './screens/MedicalAddProductScreen';
export * from './screens/MedicalEditProductScreen';

import { MedicalAddProductScreen } from './screens/MedicalAddProductScreen';
import { MedicalEditProductScreen } from './screens/MedicalEditProductScreen';
import { medicalProductService } from './services';

export const MedicalProductModule = {
  storeType: 'medical' as const,
  displayName: 'Medical / Pharmacy Store',
  AddProductScreen: MedicalAddProductScreen,
  EditProductScreen: MedicalEditProductScreen,
  service: medicalProductService,
};

export default MedicalProductModule;

