import { StoreTypeConfig } from './types';

export const clothingConfig: StoreTypeConfig = {
  code: 'clothing',
  name: 'Clothing Store',
  icon: 'checkroom',
  description: "Men's, women's, and kids' apparel, textiles, and fashion garments.",
  defaultUnits: ['piece', 'pair', 'set', 'meter'],
  fields: [
    {
      fieldName: 'clothing_type',
      fieldLabel: 'Clothing Type',
      fieldType: 'select',
      isRequired: false,
      options: ['Shirt', 'T-Shirt', 'Jeans', 'Trousers', 'Saree', 'Dress', 'Jacket', 'Kurta', 'Shorts', 'Skirt', 'Sweater'],
      defaultValue: 'Shirt',
      displayOrder: 1,
    },
    {
      fieldName: 'gender',
      fieldLabel: 'Gender',
      fieldType: 'select',
      isRequired: false,
      options: ['Men', 'Women', 'Unisex', 'Boys', 'Girls', 'Kids'],
      defaultValue: 'Men',
      displayOrder: 2,
    },
    {
      fieldName: 'size',
      fieldLabel: 'Size',
      fieldType: 'select',
      isRequired: true,
      options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', 'Free Size', '28', '30', '32', '34', '36', '38', '40'],
      defaultValue: 'M',
      displayOrder: 3,
    },
    {
      fieldName: 'color',
      fieldLabel: 'Color',
      fieldType: 'select',
      isRequired: true,
      options: ['Black', 'White', 'Navy Blue', 'Red', 'Blue', 'Green', 'Grey', 'Yellow', 'Beige', 'Olive', 'Pink', 'Brown'],
      defaultValue: 'Black',
      displayOrder: 4,
    },
    {
      fieldName: 'fabric',
      fieldLabel: 'Fabric',
      fieldType: 'select',
      isRequired: false,
      options: ['100% Cotton', 'Polyester', 'Denim', 'Linen', 'Silk', 'Wool', 'Rayon', 'Chiffon', 'Georgette', 'Cotton Blend'],
      defaultValue: '100% Cotton',
      displayOrder: 5,
    },
    {
      fieldName: 'pattern',
      fieldLabel: 'Pattern',
      fieldType: 'select',
      isRequired: false,
      options: ['Solid / Plain', 'Printed', 'Striped', 'Checked', 'Embroidered', 'Floral', 'Graphic Print'],
      defaultValue: 'Solid / Plain',
      displayOrder: 6,
    },
    {
      fieldName: 'fit_type',
      fieldLabel: 'Fit Type',
      fieldType: 'select',
      isRequired: false,
      options: ['Regular Fit', 'Slim Fit', 'Relaxed Fit', 'Loose Fit', 'Skinny Fit', 'Oversized'],
      defaultValue: 'Regular Fit',
      displayOrder: 7,
    },
    {
      fieldName: 'sleeve_type',
      fieldLabel: 'Sleeve Type',
      fieldType: 'select',
      isRequired: false,
      options: ['Full Sleeve', 'Half Sleeve', 'Short Sleeve', 'Sleeveless', '3/4 Sleeve'],
      defaultValue: 'Full Sleeve',
      displayOrder: 8,
    },
    {
      fieldName: 'neck_type',
      fieldLabel: 'Neck Type',
      fieldType: 'select',
      isRequired: false,
      options: ['Round Neck', 'V-Neck', 'Collar / Polo', 'Mandarin / Chinese', 'Hooded', 'Boat Neck', 'Square Neck'],
      defaultValue: 'Collar / Polo',
      displayOrder: 9,
    },
    {
      fieldName: 'season',
      fieldLabel: 'Season',
      fieldType: 'select',
      isRequired: false,
      options: ['All Season', 'Summer', 'Winter', 'Spring / Autumn', 'Monsoon / Festive'],
      defaultValue: 'All Season',
      displayOrder: 10,
    },
    {
      fieldName: 'collection',
      fieldLabel: 'Collection',
      fieldType: 'text',
      isRequired: false,
      placeholder: 'e.g. Summer 2026, Festive Edition, Classic Essentials',
      displayOrder: 11,
    },
    {
      fieldName: 'material',
      fieldLabel: 'Material',
      fieldType: 'text',
      isRequired: false,
      placeholder: 'e.g. 100% Combed Cotton, Stretch Denim',
      displayOrder: 12,
    },
    {
      fieldName: 'design_number',
      fieldLabel: 'Design Number',
      fieldType: 'text',
      isRequired: false,
      placeholder: 'e.g. D-8802, STYLE-2026-X',
      displayOrder: 13,
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
