import { AgroProductFormData } from '../types';

export function validateAgroProduct(data: AgroProductFormData): {
  isValid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  if (!data.agroProductType) {
    errors.agroProductType = 'Agro product category is required.';
    return { isValid: false, errors };
  }

  if (data.agroProductType === 'Crop Medicine') {
    const med = data.medicineDetails;
    if (!med?.activeIngredient || !med.activeIngredient.trim()) {
      errors.activeIngredient = 'Active chemical ingredient is required.';
    }
    if (!med?.formulationType) {
      errors.formulationType = 'Formulation type (EC, SC, WP) is required.';
    }
  } else if (data.agroProductType === 'Crop') {
    const crop = data.cropDetails;
    if (!crop?.cropVariety || !crop.cropVariety.trim()) {
      errors.cropVariety = 'Crop variety/cultivar name is required.';
    }
  } else if (data.agroProductType === 'Fertilizer') {
    const fert = data.fertilizerDetails;
    if (!fert?.fertilizerType) {
      errors.fertilizerType = 'Fertilizer category is required.';
    }
  } else if (data.agroProductType === 'Seeds') {
    const seed = data.seedDetails;
    if (!seed?.seedVariety || !seed.seedVariety.trim()) {
      errors.seedVariety = 'Seed variety is required.';
    }
    if (seed?.germinationRate) {
      const g = parseFloat(seed.germinationRate);
      if (isNaN(g) || g < 0 || g > 100) {
        errors.germinationRate = 'Germination rate must be between 0% and 100%.';
      }
    }
  }

  // Batches check for medicines and seeds
  if (data.agroProductType === 'Crop Medicine' && (!data.batches || data.batches.length === 0)) {
    errors.batches = 'At least one lot/batch with expiry date is recommended for crop medicines.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

