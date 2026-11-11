import { PlasticProductFormData } from '../types';

export function validatePlasticProduct(data: PlasticProductFormData): {
  isValid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  if (!data.specifications.plasticType) {
    errors.plasticType = 'Polymer / Plastic material type is required.';
  }

  if (!data.specifications.materialGrade) {
    errors.materialGrade = 'Material grade (Virgin / Recycled / Food Grade) is required.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

