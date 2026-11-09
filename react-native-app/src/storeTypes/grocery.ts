import { StoreTypeConfig } from './types';

export const groceryConfig: StoreTypeConfig = {
  code: 'grocery',
  name: 'Grocery Store',
  icon: 'shopping-basket',
  description: 'Daily essentials, packaged food items, groceries, and staples.',
  defaultUnits: ['kg', 'g', 'liter', 'ml', 'packet', 'piece', 'box'],
  fields: [
    {
      fieldName: 'brand',
      fieldLabel: 'Brand',
      fieldType: 'text',
      isRequired: false,
      placeholder: "e.g. Nestle, Kellogg's, Tata",
      displayOrder: 1,
    },
    {
      fieldName: 'batch_number',
      fieldLabel: 'Batch Number',
      fieldType: 'text',
      isRequired: false,
      placeholder: 'e.g. BATCH-2026-01',
      displayOrder: 2,
    },
    {
      fieldName: 'weight',
      fieldLabel: 'Weight / Volume',
      fieldType: 'number',
      isRequired: false,
      placeholder: 'e.g. 500, 1',
      displayOrder: 3,
    },
    {
      fieldName: 'expiry_date',
      fieldLabel: 'Expiry Date',
      fieldType: 'date',
      isRequired: false,
      placeholder: 'YYYY-MM-DD',
      displayOrder: 4,
    },
  ],
  validate: (values: Record<string, any>) => {
    return { isValid: true };
  },
};

