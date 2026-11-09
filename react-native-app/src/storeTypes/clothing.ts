import { StoreTypeConfig } from './types';

export const clothingConfig: StoreTypeConfig = {
  code: 'clothing',
  name: 'Clothing Store',
  icon: 'checkroom',
  description: "Men's, women's, and kids' apparel, textiles, and fashion garments.",
  defaultUnits: ['piece', 'pair', 'set'],
  fields: [
    {
      fieldName: 'brand',
      fieldLabel: 'Brand',
      fieldType: 'text',
      isRequired: false,
      placeholder: "e.g. Zara, Levi's, Raymond",
      displayOrder: 1,
    },
    {
      fieldName: 'size',
      fieldLabel: 'Size',
      fieldType: 'select',
      isRequired: true,
      options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '28', '30', '32', '34', '36', '38'],
      defaultValue: 'M',
      displayOrder: 2,
    },
    {
      fieldName: 'color',
      fieldLabel: 'Color',
      fieldType: 'select',
      isRequired: true,
      options: ['Black', 'White', 'Navy Blue', 'Red', 'Green', 'Grey', 'Yellow', 'Beige', 'Olive'],
      defaultValue: 'Black',
      displayOrder: 3,
    },
    {
      fieldName: 'fabric',
      fieldLabel: 'Fabric / Material',
      fieldType: 'select',
      isRequired: false,
      options: ['100% Cotton', 'Polyester', 'Denim', 'Linen', 'Silk', 'Wool', 'Rayon', 'Blend'],
      defaultValue: '100% Cotton',
      displayOrder: 4,
    },
    {
      fieldName: 'gender_category',
      fieldLabel: 'Gender / Department',
      fieldType: 'select',
      isRequired: false,
      options: ['Men', 'Women', 'Kids', 'Unisex'],
      defaultValue: 'Men',
      displayOrder: 5,
    },
  ],
  validate: (values: Record<string, any>) => {
    if (!values.size || !String(values.size).trim()) {
      return { isValid: false, error: 'Size is required for Clothing products.' };
    }
    if (!values.color || !String(values.color).trim()) {
      return { isValid: false, error: 'Color is required for Clothing products.' };
    }
    return { isValid: true };
  },
};

