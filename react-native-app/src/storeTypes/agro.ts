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
      fieldLabel: 'Agro Product Type',
      fieldType: 'select',
      isRequired: true,
      options: ['Seeds', 'Fertilizer / Bio-fertilizer', 'Pesticide / Insecticide', 'Farming Tools', 'Irrigation Equipment'],
      defaultValue: 'Seeds',
      displayOrder: 1,
    },
    {
      fieldName: 'variety_crop',
      fieldLabel: 'Crop / Variety',
      fieldType: 'text',
      isRequired: false,
      placeholder: 'e.g. Hybrid Cotton, Wheat HD-2967, Tomato',
      displayOrder: 2,
    },
    {
      fieldName: 'technical_name',
      fieldLabel: 'Technical / Active Salt',
      fieldType: 'text',
      isRequired: false,
      placeholder: 'e.g. NPK 19:19:19, Chlorpyrifos 20% EC',
      displayOrder: 3,
    },
    {
      fieldName: 'pack_size',
      fieldLabel: 'Pack Size / Net Content',
      fieldType: 'text',
      isRequired: false,
      placeholder: 'e.g. 1 kg, 5 kg, 500 ml, 5 Liters',
      displayOrder: 4,
    },
    {
      fieldName: 'batch_number',
      fieldLabel: 'Batch Number',
      fieldType: 'text',
      isRequired: false,
      placeholder: 'e.g. AG-2026-B1',
      displayOrder: 5,
    },
    {
      fieldName: 'expiry_date',
      fieldLabel: 'Expiry / Validity Date',
      fieldType: 'date',
      isRequired: false,
      placeholder: 'YYYY-MM-DD',
      displayOrder: 6,
    },
  ],
  validate: (values: Record<string, any>) => {
    if (!values.product_type || !String(values.product_type).trim()) {
      return { isValid: false, error: 'Product Type is required for Agro products.' };
    }
    return { isValid: true };
  },
};

