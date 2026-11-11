import { ClothingSpecifications, ClothingProductFormData } from '../types';

export function validateClothingSpecifications(specs: ClothingSpecifications): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!specs.gender) {
    errors.gender = 'Please select a target gender / age segment.';
  }

  if (!specs.clothingType || !specs.clothingType.trim()) {
    errors.clothingType = 'Please select or enter the clothing type.';
  }

  if (!specs.fabric || !specs.fabric.trim()) {
    errors.fabric = 'Please select or enter the primary fabric material.';
  }

  return errors;
}

export function validateClothingProduct(data: ClothingProductFormData): {
  isValid: boolean;
  errors: Record<string, string>;
} {
  const specErrors = validateClothingSpecifications(data.specifications);

  // If variants exist, verify each has positive selling price and SKU
  const variantErrors: Record<string, string> = {};
  if (data.variants && data.variants.length > 0) {
    data.variants.forEach((v, idx) => {
      if (!v.sku || !v.sku.trim()) {
        variantErrors[`variant_${idx}_sku`] = `SKU required for ${v.size}/${v.color}`;
      }
      const price = parseFloat(v.selling_price);
      if (isNaN(price) || price < 0) {
        variantErrors[`variant_${idx}_price`] = `Invalid price for ${v.size}/${v.color}`;
      }
    });
  }

  const allErrors = { ...specErrors, ...variantErrors };
  return {
    isValid: Object.keys(allErrors).length === 0,
    errors: allErrors,
  };
}

