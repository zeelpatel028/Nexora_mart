import {
  BaseProductBasicInfo,
  BaseProductPricingInfo,
  BaseProductInventoryInfo,
  BaseProductUnitInfo,
  ValidationResult,
  ProductBatchItem,
  ProductVariantItem,
} from '../types';

export function validateCommonBasicInfo(basic: BaseProductBasicInfo): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!basic.productName || !basic.productName.trim()) {
    errors.productName = 'Product name is required.';
  } else if (basic.productName.trim().length < 2) {
    errors.productName = 'Product name must be at least 2 characters.';
  }
  return errors;
}

export function validateCommonPricingInfo(pricing: BaseProductPricingInfo): Record<string, string> {
  const errors: Record<string, string> = {};
  const sellPrice = parseFloat(pricing.sellingPrice);
  if (isNaN(sellPrice) || sellPrice < 0) {
    errors.sellingPrice = 'Selling price cannot be negative.';
  }

  const buyPrice = parseFloat(pricing.purchasePrice);
  if (!isNaN(buyPrice) && buyPrice < 0) {
    errors.purchasePrice = 'Purchase price cannot be negative.';
  }

  if (pricing.mrp && pricing.mrp.trim()) {
    const mrpVal = parseFloat(pricing.mrp);
    if (!isNaN(mrpVal) && mrpVal < 0) {
      errors.mrp = 'MRP cannot be negative.';
    }
  }
  return errors;
}

export function validateCommonInventoryInfo(inventory: BaseProductInventoryInfo): Record<string, string> {
  const errors: Record<string, string> = {};
  const currentVal = parseFloat(inventory.currentStock);
  if (isNaN(currentVal) || currentVal < 0) {
    if (!inventory.allowNegativeStock) {
      errors.currentStock = 'Available stock quantity cannot be negative.';
    }
  }

  if (inventory.enableLowStockAlert) {
    const minVal = parseFloat(inventory.minimumStock);
    if (isNaN(minVal) || minVal < 0) {
      errors.minimumStock = 'Please enter a valid low stock alert quantity.';
    }
  }

  if (inventory.enableExpiryAlert) {
    if (!inventory.expiryDate || !inventory.expiryDate.trim()) {
      errors.expiryDate = 'Please enter an expiry date or shelf life days.';
    }
  }

  return errors;
}

export function validateCommonProductFields(
  basic: BaseProductBasicInfo,
  pricing: BaseProductPricingInfo,
  inventory: BaseProductInventoryInfo,
  units?: BaseProductUnitInfo,
  variants?: ProductVariantItem[],
  batches?: ProductBatchItem[]
): ValidationResult {
  const errors: Record<string, string> = {
    ...validateCommonBasicInfo(basic),
    ...validateCommonPricingInfo(pricing),
    ...validateCommonInventoryInfo(inventory),
  };

  // Units & Conversion
  if (units && units.purchaseUnit && units.sellingUnit && units.purchaseUnit !== units.sellingUnit) {
    const conv = parseFloat(units.conversionRatio || '0');
    if (isNaN(conv) || conv <= 0) {
      errors.conversionRatio = 'Unit conversion ratio must be greater than zero.';
    }
  }

  // Variants validation
  if (variants && variants.length > 0) {
    variants.forEach((v, idx) => {
      const vSell = parseFloat(v.selling_price);
      if (isNaN(vSell) || vSell < 0) {
        errors[`variant_${idx}_price`] = `Variant ${v.size || ''}/${v.color || ''} selling price cannot be negative.`;
      }
    });
  }

  // Batches validation
  if (batches && batches.length > 0) {
    batches.forEach((b, idx) => {
      if (!b.batch_number || !b.batch_number.trim()) {
        errors[`batch_${idx}_number`] = `Batch ${idx + 1} number is required.`;
      }
      if (!b.expiry_date) {
        errors[`batch_${idx}_expiry`] = `Batch ${idx + 1} expiry date is required.`;
      } else if (b.manufacturing_date) {
        const mfg = new Date(b.manufacturing_date).getTime();
        const exp = new Date(b.expiry_date).getTime();
        if (mfg > exp) {
          errors[`batch_${idx}_date`] = `Batch ${b.batch_number}: Manufacturing date cannot be later than expiry date.`;
        }
      }
    });
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
