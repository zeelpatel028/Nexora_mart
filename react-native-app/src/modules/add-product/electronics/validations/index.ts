import { ElectronicsProductFormData } from '../types';

export function validateElectronicsProduct(data: ElectronicsProductFormData): {
  isValid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  if (!data.specifications.deviceType) {
    errors.deviceType = 'Device type / category is required.';
  }

  // Model number verification
  if (data.specifications.deviceType === 'Smartphone' || data.specifications.deviceType === 'Laptop') {
    if (!data.specifications.modelNumber || !data.specifications.modelNumber.trim()) {
      errors.modelNumber = 'Model number is required for phones & computers.';
    }
  }

  // Validate serial / IMEI if provided
  if (data.serialNumbers && data.serialNumbers.length > 0) {
    data.serialNumbers.forEach((s, idx) => {
      if (!s.serialNumber && !s.imeiNumber) {
        errors[`serial_${idx}`] = `Item #${idx + 1}: Either Serial Number or IMEI is required.`;
      }
      if (s.imeiNumber && s.imeiNumber.trim().length !== 15) {
        errors[`imei_${idx}`] = `Item #${idx + 1}: IMEI must be 15 digits.`;
      }
    });
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

