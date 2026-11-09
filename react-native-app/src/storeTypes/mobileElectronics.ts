import { StoreTypeConfig } from './types';

export const mobileElectronicsConfig: StoreTypeConfig = {
  code: 'mobile_electronics',
  name: 'Mobile & Electronics Store',
  icon: 'devices',
  description: 'Smartphones, consumer appliances, computing devices, audio, and gadgets.',
  defaultUnits: ['piece', 'set', 'box'],
  fields: [
    {
      fieldName: 'brand',
      fieldLabel: 'Brand',
      fieldType: 'text',
      isRequired: true,
      placeholder: 'e.g. Apple, Samsung, OnePlus, Sony',
      displayOrder: 1,
    },
    {
      fieldName: 'model_number',
      fieldLabel: 'Model Number / Name',
      fieldType: 'text',
      isRequired: true,
      placeholder: 'e.g. iPhone 15 Pro, Galaxy S24',
      displayOrder: 2,
    },
    {
      fieldName: 'warranty_period',
      fieldLabel: 'Warranty Period',
      fieldType: 'select',
      isRequired: true,
      options: ['No Warranty', '6 Months', '1 Year', '2 Years', '3 Years'],
      defaultValue: '1 Year',
      displayOrder: 3,
    },
    {
      fieldName: 'serial_imei',
      fieldLabel: 'Serial / IMEI Number',
      fieldType: 'text',
      isRequired: false,
      placeholder: 'Unique Serial or IMEI',
      displayOrder: 4,
    },
    {
      fieldName: 'storage_ram',
      fieldLabel: 'Storage / RAM',
      fieldType: 'select',
      isRequired: false,
      options: ['64GB', '128GB', '256GB', '512GB', '1TB', '8GB/128GB', '12GB/256GB'],
      defaultValue: '128GB',
      displayOrder: 5,
    },
    {
      fieldName: 'specifications',
      fieldLabel: 'Key Specifications',
      fieldType: 'text',
      isRequired: false,
      placeholder: 'e.g. 5G, OLED 120Hz, 50MP Camera',
      displayOrder: 6,
    },
  ],
  validate: (values: Record<string, any>) => {
    if (!values.brand || !String(values.brand).trim()) {
      return { isValid: false, error: 'Brand is required for electronics.' };
    }
    if (!values.model_number || !String(values.model_number).trim()) {
      return { isValid: false, error: 'Model Number is required for electronics.' };
    }
    return { isValid: true };
  },
};

