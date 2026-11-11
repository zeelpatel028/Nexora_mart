import { FurnitureProductFormData } from '../types';

export function validateFurnitureProduct(data: FurnitureProductFormData): {
  isValid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  if (!data.specifications.furnitureType) {
    errors.furnitureType = 'Furniture category / article is required.';
  }

  if (!data.specifications.material) {
    errors.material = 'Primary construction material is required.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

