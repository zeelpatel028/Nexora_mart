import { GroceryProductFormData } from '../types';

export function validateGroceryProduct(data: GroceryProductFormData): {
  isValid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  if (!data.specifications.packagingType) {
    errors.packagingType = 'Packaging type is required.';
  }

  if (data.specifications.fssaiLicense && data.specifications.fssaiLicense.trim()) {
    const fssai = data.specifications.fssaiLicense.trim();
    if (fssai.length !== 14 || !/^\d+$/.test(fssai)) {
      errors.fssaiLicense = 'FSSAI License must be a 14-digit number.';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

