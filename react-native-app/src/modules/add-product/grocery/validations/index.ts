import { GroceryProductFormData } from '../types';

export function validateGroceryProduct(data: GroceryProductFormData): {
  isValid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  if (!data.specifications.packagingType) {
    errors.packagingType = 'Packaging type is required.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

