import { HandloomProductFormData } from '../types';

export function validateHandloomProduct(data: HandloomProductFormData): {
  isValid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  if (!data.specifications.fabricType) {
    errors.fabricType = 'Fabric material (Pure Silk, Khadi Cotton, etc.) is required.';
  }

  if (!data.specifications.weavingTechnique) {
    errors.weavingTechnique = 'Weaving technique is required.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

