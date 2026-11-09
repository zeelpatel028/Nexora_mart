import { StoreTypeConfig } from './types';

export const mobileElectronicsConfig: StoreTypeConfig = {
  code: 'mobile_electronics',
  name: 'Mobile & Electronics Store',
  icon: 'devices',
  description: 'Smartphones, consumer appliances, computing devices, audio, and gadgets.',
  defaultUnits: ['piece', 'set', 'box'],
  fields: [
    {
      fieldName: 'device_type',
      fieldLabel: 'Device Type',
      fieldType: 'select',
      isRequired: false,
      options: ['Smartphone', 'Feature Phone', 'Tablet', 'Laptop', 'Smartwatch', 'Headphones / Earbuds', 'Television', 'Camera', 'Power Bank', 'Charger / Cable', 'Accessory'],
      defaultValue: 'Smartphone',
      displayOrder: 1,
    },
    {
      fieldName: 'brand',
      fieldLabel: 'Brand',
      fieldType: 'text',
      isRequired: true,
      placeholder: 'e.g. Apple, Samsung, OnePlus, Sony, Dell, HP',
      displayOrder: 2,
    },
    {
      fieldName: 'model_number',
      fieldLabel: 'Model Number',
      fieldType: 'text',
      isRequired: true,
      placeholder: 'e.g. iPhone 15 Pro, SM-S928B, XPS 15',
      displayOrder: 3,
    },
    {
      fieldName: 'ram',
      fieldLabel: 'RAM',
      fieldType: 'select',
      isRequired: false,
      options: ['N/A', '2 GB', '3 GB', '4 GB', '6 GB', '8 GB', '12 GB', '16 GB', '32 GB', '64 GB'],
      defaultValue: '8 GB',
      displayOrder: 4,
    },
    {
      fieldName: 'storage',
      fieldLabel: 'Storage',
      fieldType: 'select',
      isRequired: false,
      options: ['N/A', '32 GB', '64 GB', '128 GB', '256 GB', '512 GB', '1 TB', '2 TB'],
      defaultValue: '128 GB',
      displayOrder: 5,
    },
    {
      fieldName: 'processor',
      fieldLabel: 'Processor',
      fieldType: 'text',
      isRequired: false,
      placeholder: 'e.g. Snapdragon 8 Gen 3, Apple A17 Pro, Intel Core i7',
      displayOrder: 6,
    },
    {
      fieldName: 'imei_number',
      fieldLabel: 'IMEI Number',
      fieldType: 'text',
      isRequired: false,
      placeholder: '15-digit IMEI for cellular devices',
      displayOrder: 7,
    },
    {
      fieldName: 'serial_number',
      fieldLabel: 'Serial Number',
      fieldType: 'text',
      isRequired: false,
      placeholder: 'e.g. SN-98234823904',
      displayOrder: 8,
    },
    {
      fieldName: 'warranty_period',
      fieldLabel: 'Warranty Period',
      fieldType: 'select',
      isRequired: true,
      options: ['No Warranty', '6 Months', '1 Year', '2 Years', '3 Years', '5 Years'],
      defaultValue: '1 Year',
      displayOrder: 9,
    },
    {
      fieldName: 'color',
      fieldLabel: 'Color',
      fieldType: 'text',
      isRequired: false,
      placeholder: 'e.g. Titanium Black, Space Grey, Phantom Blue',
      displayOrder: 10,
    },
    {
      fieldName: 'accessories_included',
      fieldLabel: 'Accessories Included',
      fieldType: 'text',
      isRequired: false,
      placeholder: 'e.g. Adapter, USB-C Cable, Protective Case, User Manual',
      displayOrder: 11,
    },
  ],
  validate: (values: Record<string, any>) => {
    if (!values.brand || !String(values.brand).trim()) {
      return { isValid: false, error: 'Brand is required for Electronics products.' };
    }
    if (!values.model_number || !String(values.model_number).trim()) {
      return { isValid: false, error: 'Model Number is required for Electronics products.' };
    }
    if (!values.warranty_period || !String(values.warranty_period).trim()) {
      return { isValid: false, error: 'Warranty Period is required for Electronics products.' };
    }
    return { isValid: true };
  },
};
