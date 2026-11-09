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
      options: ['Sofa / Couch', 'Dining Table', 'Office Chair', 'Study Desk', 'Double Bed / King Bed', 'Single Bed', 'Wardrobe', 'Bookshelf', 'Coffee Table', 'Shoe Rack', 'TV Unit'],
      defaultValue: 'Sofa / Couch',
      displayOrder: 1,
    },
    {
      fieldName: 'material',
      fieldLabel: 'Material',
      fieldType: 'select',
      isRequired: true,
      options: ['Solid Wood', 'Engineered Wood / MDF', 'Plywood with Laminate', 'Metal / Iron', 'Upholstered Fabric', 'Genuine Leather', 'Glass & Wood'],
      defaultValue: 'Solid Wood',
      displayOrder: 2,
    },
    {
      fieldName: 'wood_type',
      fieldLabel: 'Wood Type',
      fieldType: 'select',
      isRequired: false,
      options: ['Teak Wood', 'Sheesham Wood (Rosewood)', 'Oak Wood', 'Pine Wood', 'Mango Wood', 'Rubber Wood', 'Walnut Wood', 'Engineered Wood', 'N/A (Metal/Glass)'],
      defaultValue: 'Teak Wood',
      displayOrder: 3,
    },
    {
      fieldName: 'length',
      fieldLabel: 'Length',
      fieldType: 'text',
      isRequired: false,
      placeholder: 'e.g. 72 inches, 180 cm',
      displayOrder: 4,
    },
    {
      fieldName: 'width',
      fieldLabel: 'Width',
      fieldType: 'text',
      isRequired: false,
      placeholder: 'e.g. 36 inches, 90 cm',
      displayOrder: 5,
    },
    {
      fieldName: 'height',
      fieldLabel: 'Height',
      fieldType: 'text',
      isRequired: false,
      placeholder: 'e.g. 30 inches, 75 cm',
      displayOrder: 6,
    },
    {
      fieldName: 'finish',
      fieldLabel: 'Finish',
      fieldType: 'select',
      isRequired: false,
      options: ['Walnut Finish', 'Teak Finish', 'Natural Matte', 'High Gloss', 'Distressed / Rustic', 'Mahogany Finish', 'Melamine Coat'],
      defaultValue: 'Walnut Finish',
      displayOrder: 7,
    },
    {
      fieldName: 'color',
      fieldLabel: 'Color',
      fieldType: 'text',
      isRequired: false,
      placeholder: 'e.g. Honey Brown, Dark Walnut, Matte Black, Charcoal Grey',
      displayOrder: 8,
    },
    {
      fieldName: 'weight',
      fieldLabel: 'Weight',
      fieldType: 'text',
      isRequired: false,
      placeholder: 'e.g. 25 kg, 45 kg',
      displayOrder: 9,
    },
    {
      fieldName: 'assembly_required',
      fieldLabel: 'Assembly Required',
      fieldType: 'boolean',
      isRequired: false,
      displayOrder: 10,
    },
    {
      fieldName: 'warranty',
      fieldLabel: 'Warranty',
      fieldType: 'select',
      isRequired: false,
      options: ['No Warranty', '1 Year', '2 Years', '3 Years', '5 Years', '10 Years'],
      defaultValue: '1 Year',
      displayOrder: 11,
    },
  ],
  validate: (values: Record<string, any>) => {
    if (!values.furniture_type || !String(values.furniture_type).trim()) {
      return { isValid: false, error: 'Furniture Type is required for Furniture products.' };
    }
    if (!values.material || !String(values.material).trim()) {
      return { isValid: false, error: 'Material is required for Furniture products.' };
    }
    return { isValid: true };
  },
};
