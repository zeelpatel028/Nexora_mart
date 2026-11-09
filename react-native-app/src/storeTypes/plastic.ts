import { StoreTypeConfig } from './types';

export const plasticConfig: StoreTypeConfig = {
  code: 'plastic',
  name: 'Plastic Store',
  icon: 'inventory',
  description: 'Plastic housewares, containers, storage boxes, kitchen utilities, and polymer goods.',
  defaultUnits: ['piece', 'set', 'pack', 'dozen'],
  fields: [
    {
      fieldName: 'material',
      fieldLabel: 'Plastic Material / Type',
      fieldType: 'select',
      isRequired: false,
      options: ['Virgin Plastic', 'BPA Free', 'HDPE', 'Polypropylene (PP)', 'Polycarbonate'],
      defaultValue: 'BPA Free',
      displayOrder: 1,
    },
    {
      fieldName: 'capacity',
      fieldLabel: 'Capacity / Volume',
      fieldType: 'select',
      isRequired: false,
      options: ['250ml', '500ml', '1 Liter', '2 Liters', '5 Liters', '10 Liters', '25 Liters', '50 Liters'],
      defaultValue: '1 Liter',
      displayOrder: 2,
    },
    {
      fieldName: 'color',
      fieldLabel: 'Color',
      fieldType: 'text',
      isRequired: false,
      placeholder: 'e.g. Transparent, Blue, Red',
      displayOrder: 3,
    },
    {
      fieldName: 'pack_size',
      fieldLabel: 'Pack Size',
      fieldType: 'number',
      isRequired: false,
      placeholder: 'e.g. 1, 3, 6, 12',
      displayOrder: 4,
    },
  ],
  validate: (values: Record<string, any>) => {
    return { isValid: true };
  },
};

