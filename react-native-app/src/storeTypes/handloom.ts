import { StoreTypeConfig } from './types';

export const handloomConfig: StoreTypeConfig = {
  code: 'handloom',
  name: 'Handloom Store',
  icon: 'style',
  description: 'Handloom textiles, traditional fabrics, sarees, artisanal weaves, and home furnishings.',
  defaultUnits: ['piece', 'meter', 'pair', 'set'],
  fields: [
    {
      fieldName: 'weave_type',
      fieldLabel: 'Weave Type / Fabric',
      fieldType: 'select',
      isRequired: true,
      options: ['Khadi', 'Chanderi', 'Banarasi', 'Silk Weave', 'Pure Cotton', 'Ikat', 'Linen', 'Tussar Silk'],
      defaultValue: 'Pure Cotton',
      displayOrder: 1,
    },
    {
      fieldName: 'pattern',
      fieldLabel: 'Pattern / Style',
      fieldType: 'text',
      isRequired: false,
      placeholder: 'e.g. Hand Block Print, Zari Border, Floral',
      displayOrder: 2,
    },
    {
      fieldName: 'color',
      fieldLabel: 'Color / Dye',
      fieldType: 'text',
      isRequired: false,
      placeholder: 'e.g. Maroon, Indigo, Mustard',
      displayOrder: 3,
    },
    {
      fieldName: 'dimensions',
      fieldLabel: 'Dimensions / Length',
      fieldType: 'text',
      isRequired: false,
      placeholder: 'e.g. 5.5m Saree, 2.5m Dupatta, 6x6 ft',
      displayOrder: 4,
    },
    {
      fieldName: 'artisan_source',
      fieldLabel: 'Artisan / Source Origin',
      fieldType: 'text',
      isRequired: false,
      placeholder: 'e.g. Kutch Cluster, Varanasi Weavers',
      displayOrder: 5,
    },
  ],
  validate: (values: Record<string, any>) => {
    if (!values.weave_type || !String(values.weave_type).trim()) {
      return { isValid: false, error: 'Weave Type is required for Handloom items.' };
    }
    return { isValid: true };
  },
};

