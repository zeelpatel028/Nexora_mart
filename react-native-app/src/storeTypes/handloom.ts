import { StoreTypeConfig } from './types';

export const handloomConfig: StoreTypeConfig = {
  code: 'handloom',
  name: 'Handloom Store',
  icon: 'style',
  description: 'Handloom textiles, traditional fabrics, sarees, artisanal weaves, and home furnishings.',
  defaultUnits: ['piece', 'meter', 'pair', 'set'],
  fields: [
    {
      fieldName: 'fabric_type',
      fieldLabel: 'Fabric Type',
      fieldType: 'select',
      isRequired: true,
      options: ['Khadi Cotton', 'Chanderi', 'Banarasi Silk', 'Tussar Silk', 'Mulmul Cotton', 'Linen', 'Ikat Cotton', 'Kanjivaram Silk', 'Pashmina Wool', 'Matka Silk'],
      defaultValue: 'Khadi Cotton',
      displayOrder: 1,
    },
    {
      fieldName: 'weaving_type',
      fieldLabel: 'Weaving Type',
      fieldType: 'select',
      isRequired: false,
      options: ['Traditional Handloom', 'Pit Loom', 'Frame Loom', 'Jacquard Handloom', 'Dobby Handloom', 'Backstrap Loom'],
      defaultValue: 'Traditional Handloom',
      displayOrder: 2,
    },
    {
      fieldName: 'pattern',
      fieldLabel: 'Pattern',
      fieldType: 'select',
      isRequired: false,
      options: ['Zari Border', 'Floral Jaal', 'Geometric Ikat', 'Butti / Buta Work', 'Temple Border', 'Plain with Border', 'Stripes & Checks', 'Solid'],
      defaultValue: 'Plain with Border',
      displayOrder: 3,
    },
    {
      fieldName: 'design',
      fieldLabel: 'Design',
      fieldType: 'text',
      isRequired: false,
      placeholder: 'e.g. Traditional Paisley Motif, Contemporary Artisan Block',
      displayOrder: 4,
    },
    {
      fieldName: 'color',
      fieldLabel: 'Color',
      fieldType: 'text',
      isRequired: false,
      placeholder: 'e.g. Indigo Blue, Madder Red, Turmeric Yellow, Natural Ecru',
      displayOrder: 5,
    },
    {
      fieldName: 'material',
      fieldLabel: 'Material',
      fieldType: 'text',
      isRequired: false,
      placeholder: 'e.g. 100% Pure Organic Cotton, Mulberry Silk, Pure Wool',
      displayOrder: 6,
    },
    {
      fieldName: 'length',
      fieldLabel: 'Length',
      fieldType: 'text',
      isRequired: false,
      placeholder: 'e.g. 5.5 Meters, 6.3 Meters with Blouse, 2.5 Meters Dupatta',
      displayOrder: 7,
    },
    {
      fieldName: 'width',
      fieldLabel: 'Width',
      fieldType: 'text',
      isRequired: false,
      placeholder: 'e.g. 44 Inches, 48 Inches, 36 Inches',
      displayOrder: 8,
    },
    {
      fieldName: 'origin',
      fieldLabel: 'Origin',
      fieldType: 'text',
      isRequired: false,
      placeholder: 'e.g. Varanasi (UP), Chanderi (MP), Pochampally (Telangana), Sambalpur (Odisha), Kutch (Gujarat)',
      displayOrder: 9,
    },
  ],
  validate: (values: Record<string, any>) => {
    const fabric = values.fabric_type || values.weave_type;
    if (!fabric || !String(fabric).trim()) {
      return { isValid: false, error: 'Fabric Type is required for Handloom products.' };
    }
    return { isValid: true };
  },
};
