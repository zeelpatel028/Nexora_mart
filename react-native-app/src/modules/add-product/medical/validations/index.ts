import { MedicalProductFormData } from '../types';

export function validateMedicalProduct(data: MedicalProductFormData): {
  isValid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  if (!data.specifications.composition || !data.specifications.composition.trim()) {
    errors.composition = 'Salt / Active composition formula is required for pharmaceutical compliance.';
  }

  if (!data.specifications.dosageForm) {
    errors.dosageForm = 'Dosage form (e.g. Tablet, Syrup, Injection) is required.';
  }

  // If Schedule H/H1/X, prescription must be required
  if (
    ['Schedule H', 'Schedule H1', 'Schedule X'].includes(data.specifications.scheduleType) &&
    !data.specifications.prescriptionRequired
  ) {
    errors.prescriptionRequired = 'Prescription must be marked required for Schedule H/H1/X drugs.';
  }

  // Check Batches
  if (!data.batches || data.batches.length === 0) {
    errors.batches = 'At least one medicine batch with expiry date must be entered.';
  } else {
    data.batches.forEach((b, idx) => {
      if (!b.batch_number || !b.batch_number.trim()) {
        errors[`batch_${idx}_number`] = `Batch #${idx + 1} number is required.`;
      }
      if (!b.expiry_date) {
        errors[`batch_${idx}_expiry`] = `Batch #${idx + 1} expiry date is required.`;
      }
    });
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

