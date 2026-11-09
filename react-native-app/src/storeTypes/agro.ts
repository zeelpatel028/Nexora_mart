import { StoreTypeConfig } from './types';

export const agroConfig: StoreTypeConfig = {
  code: 'agro',
  name: 'Agro Store',
  icon: 'eco',
  description: 'Seeds, fertilizers, agricultural implements, farming equipment, and pesticides.',
  defaultUnits: ['kg', 'g', 'liter', 'ml', 'packet', 'bag', 'piece'],
  fields: [
    {
      fieldName: 'product_type',
      fieldLabel: 'Product Type',
      fieldType: 'select',
      isRequired: true,
      options: ['Seeds', 'Fertilizer / Nutrient', 'Bio-fertilizer', 'Pesticide / Insecticide', 'Fungicide / Herbicide', 'Plant Growth Regulator', 'Farming Tools / Equipment', 'Irrigation / Drip'],
      defaultValue: 'Seeds',
      displayOrder: 1,
    },
    {
      fieldName: 'crop_type',
      fieldLabel: 'Crop Type',
      fieldType: 'text',
      isRequired: false,
      placeholder: 'e.g. Wheat, Cotton, Paddy/Rice, Tomato, Soybean, Vegetables, Multi-crop',
      displayOrder: 2,
    },
    {
      fieldName: 'seed_variety',
      fieldLabel: 'Seed Variety',
      fieldType: 'text',
      isRequired: false,
      placeholder: 'e.g. Hybrid HD-2967, BG-II, Super Fast Early Variety',
      displayOrder: 3,
    },
    {
      fieldName: 'brand',
      fieldLabel: 'Brand',
      fieldType: 'text',
      isRequired: false,
      placeholder: 'e.g. Bayer, UPL, Syngenta, IFFCO, Mahyco, Rasi Seeds',
      displayOrder: 4,
    },
    {
      fieldName: 'quantity',
      fieldLabel: 'Quantity',
      fieldType: 'text',
      isRequired: false,
      placeholder: 'e.g. 1 Packet, 10 Pouches, 1 Drum',
      displayOrder: 5,
    },
    {
      fieldName: 'weight',
      fieldLabel: 'Weight',
      fieldType: 'text',
      isRequired: false,
      placeholder: 'e.g. 1 kg, 5 kg, 50 kg bag, 500 ml, 1 Liter',
      displayOrder: 6,
    },
    {
      fieldName: 'germination_rate',
      fieldLabel: 'Germination Rate',
      fieldType: 'text',
      isRequired: false,
      placeholder: 'e.g. 85%, 90% min germination',
      displayOrder: 7,
    },
    {
      fieldName: 'manufacturing_date',
      fieldLabel: 'Manufacturing Date',
      fieldType: 'date',
      isRequired: false,
      placeholder: 'YYYY-MM-DD',
      displayOrder: 8,
    },
    {
      fieldName: 'expiry_date',
      fieldLabel: 'Expiry Date',
      fieldType: 'date',
      isRequired: false,
      placeholder: 'YYYY-MM-DD',
      displayOrder: 9,
    },
    {
      fieldName: 'batch_number',
      fieldLabel: 'Batch Number',
      fieldType: 'text',
      isRequired: false,
      placeholder: 'e.g. AG-2026-B108',
      displayOrder: 10,
    },
    {
      fieldName: 'application_instructions',
      fieldLabel: 'Application Instructions',
      fieldType: 'text',
      isRequired: false,
      placeholder: 'e.g. Spray 2ml per liter of water during vegetative growth',
      displayOrder: 11,
    },
  ],
  validate: (values: Record<string, any>) => {
    if (!values.product_type || !String(values.product_type).trim()) {
      return { isValid: false, error: 'Product Type is required for Agro products.' };
    }
    return { isValid: true };
  },
};
