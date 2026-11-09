import { StoreTypeConfig } from './types';

export const furnitureConfig: StoreTypeConfig = {
  code: 'furniture',
  name: 'Furniture Store',
  icon: 'chair',
  description: 'Home and office furniture, wooden decor, tables, chairs, and furnishings.',
  defaultUnits: ['piece', 'set'],
  fields: [
    {
      fieldName: 'furniture_type',
      fieldLabel: 'Furniture Type',
      fieldType: 'select',
      isRequired: true,
      options: ['Sofa / Seating', 'Dining Table', 'Bed / Mattress', 'Office Chair', 'Study Desk', 'Wardrobe', 'Bookshelf'],
      defaultValue: 'Sofa / Seating',
      displayOrder: 1,
    },
    {
      fieldName: 'material',
      fieldLabel: 'Primary Material',
      fieldType: 'select',
      isRequired: true,
      options: ['Teak Wood', 'Sheesham Wood', 'Solid Oak', 'Engineered Wood', 'Metal / Iron', 'Leather', 'Fabric Upholstery'],
      defaultValue: 'Teak Wood',
      displayOrder: 2,
    },
    {
      fieldName: 'dimensions',
      fieldLabel: 'Dimensions (L x W x H)',
      fieldType: 'text',
      isRequired: false,
      placeholder: 'e.g. 72 x 36 x 30 inches',
      displayOrder: 3,
    },
    {
      fieldName: 'finish_color',
      fieldLabel: 'Finish / Color',
      fieldType: 'text',
      isRequired: false,
      placeholder: 'e.g. Walnut Finish, Matte Black',
      displayOrder: 4,
    },
    {
      fieldName: 'warranty_period',
      fieldLabel: 'Warranty Period',
      fieldType: 'select',
      isRequired: false,
      options: ['No Warranty', '1 Year', '3 Years', '5 Years', '10 Years'],
      defaultValue: '1 Year',
      displayOrder: 5,
    },
  ],
  validate: (values: Record<string, any>) => {
    if (!values.furniture_type || !String(values.furniture_type).trim()) {
      return { isValid: false, error: 'Furniture Type is required.' };
    }
    if (!values.material || !String(values.material).trim()) {
      return { isValid: false, error: 'Primary Material is required for Furniture.' };
    }
    return { isValid: true };
  },
};

