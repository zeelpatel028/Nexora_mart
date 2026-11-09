import { StoreTypeConfig } from './types';

export const medicalConfig: StoreTypeConfig = {
  code: 'medical',
  name: 'Medical / Pharmacy Store',
  icon: 'medical-services',
  description: 'Pharmaceuticals, medicines, surgical supplies, and healthcare goods.',
  defaultUnits: ['strip', 'tablet', 'bottle', 'vial', 'box', 'piece'],
  fields: [
    {
      fieldName: 'manufacturer',
      fieldLabel: 'Manufacturer',
      fieldType: 'text',
      isRequired: true,
      placeholder: 'e.g. Cipla, Sun Pharma, Pfizer',
      displayOrder: 1,
    },
    {
      fieldName: 'batch_number',
      fieldLabel: 'Batch Number',
      fieldType: 'text',
      isRequired: true,
      placeholder: 'e.g. BATCH-2026-X',
      displayOrder: 2,
    },
    {
      fieldName: 'expiry_date',
      fieldLabel: 'Expiry Date',
      fieldType: 'date',
      isRequired: true,
      placeholder: 'YYYY-MM-DD',
      displayOrder: 3,
    },
    {
      fieldName: 'generic_name',
      fieldLabel: 'Generic / Salt Name',
      fieldType: 'text',
      isRequired: false,
      placeholder: 'e.g. Paracetamol 500mg',
      displayOrder: 4,
    },
    {
      fieldName: 'strength',
      fieldLabel: 'Strength / Dosage',
      fieldType: 'text',
      isRequired: false,
      placeholder: 'e.g. 500mg, 10ml, 250mg/5ml',
      displayOrder: 5,
    },
    {
      fieldName: 'dosage_form',
      fieldLabel: 'Dosage Form',
      fieldType: 'select',
      isRequired: false,
      options: ['Tablet', 'Capsule', 'Syrup', 'Injection', 'Ointment', 'Drops', 'Inhaler'],
      defaultValue: 'Tablet',
      displayOrder: 6,
    },
    {
      fieldName: 'prescription_required',
      fieldLabel: 'Prescription Required',
      fieldType: 'select',
      isRequired: false,
      options: ['Yes', 'No'],
      defaultValue: 'No',
      displayOrder: 7,
    },
  ],
  validate: (values: Record<string, any>) => {
    if (!values.manufacturer || !String(values.manufacturer).trim()) {
      return { isValid: false, error: 'Manufacturer is mandatory for medicines.' };
    }
    if (!values.batch_number || !String(values.batch_number).trim()) {
      return { isValid: false, error: 'Batch Number is mandatory for medicines.' };
    }
    if (!values.expiry_date || !String(values.expiry_date).trim()) {
      return { isValid: false, error: 'Expiry Date is mandatory for medicines.' };
    }
    return { isValid: true };
  },
};

