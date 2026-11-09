import { StoreTypeConfig } from './types';

export const medicalConfig: StoreTypeConfig = {
  code: 'medical',
  name: 'Medical / Pharmacy Store',
  icon: 'medical-services',
  description: 'Pharmaceuticals, medicines, surgical supplies, and healthcare goods.',
  defaultUnits: ['strip', 'tablet', 'bottle', 'vial', 'box', 'piece', 'tube'],
  fields: [
    {
      fieldName: 'medicine_type',
      fieldLabel: 'Medicine Type',
      fieldType: 'select',
      isRequired: false,
      options: ['Allopathic', 'Ayurvedic', 'Homeopathic', 'Nutraceutical / Supplement', 'Surgical / Device'],
      defaultValue: 'Allopathic',
      displayOrder: 1,
    },
    {
      fieldName: 'generic_name',
      fieldLabel: 'Generic Name',
      fieldType: 'text',
      isRequired: false,
      placeholder: 'e.g. Paracetamol, Amoxicillin, Ibuprofen',
      displayOrder: 2,
    },
    {
      fieldName: 'salt_composition',
      fieldLabel: 'Salt Composition',
      fieldType: 'text',
      isRequired: false,
      placeholder: 'e.g. Paracetamol 500mg + Phenylephrine 10mg',
      displayOrder: 3,
    },
    {
      fieldName: 'strength',
      fieldLabel: 'Strength',
      fieldType: 'text',
      isRequired: false,
      placeholder: 'e.g. 500mg, 250mg/5ml, 10mg',
      displayOrder: 4,
    },
    {
      fieldName: 'dosage_form',
      fieldLabel: 'Dosage Form',
      fieldType: 'select',
      isRequired: false,
      options: ['Tablet', 'Capsule', 'Syrup', 'Injection', 'Ointment / Cream', 'Drops', 'Inhaler', 'Powder', 'Suspension'],
      defaultValue: 'Tablet',
      displayOrder: 5,
    },
    {
      fieldName: 'manufacturer',
      fieldLabel: 'Manufacturer',
      fieldType: 'text',
      isRequired: true,
      placeholder: 'e.g. Cipla, Sun Pharma, Abbott, Pfizer',
      displayOrder: 6,
    },
    {
      fieldName: 'batch_number',
      fieldLabel: 'Batch Number',
      fieldType: 'text',
      isRequired: true,
      placeholder: 'e.g. B-2026-X49',
      displayOrder: 7,
    },
    {
      fieldName: 'manufacturing_date',
      fieldLabel: 'Manufacturing Date',
      fieldType: 'date',
      isRequired: false,
      placeholder: 'YYYY-MM-DD',
      displayOrder: 8,
    },
    {
      fieldName: 'expiry_date',
      fieldLabel: 'Expiry Date',
      fieldType: 'date',
      isRequired: true,
      placeholder: 'YYYY-MM-DD',
      displayOrder: 9,
    },
    {
      fieldName: 'prescription_required',
      fieldLabel: 'Prescription Required',
      fieldType: 'boolean',
      isRequired: false,
      displayOrder: 10,
    },
    {
      fieldName: 'drug_schedule',
      fieldLabel: 'Drug Schedule',
      fieldType: 'select',
      isRequired: false,
      options: ['OTC (Over the Counter)', 'Schedule H', 'Schedule H1', 'Schedule X', 'Schedule G'],
      defaultValue: 'OTC (Over the Counter)',
      displayOrder: 11,
    },
    {
      fieldName: 'storage_instructions',
      fieldLabel: 'Storage Instructions',
      fieldType: 'select',
      isRequired: false,
      options: ['Store below 25°C', 'Store below 30°C', 'Protect from direct light and moisture', 'Store in refrigerator (2°C - 8°C)', 'Do not freeze'],
      defaultValue: 'Store below 25°C',
      displayOrder: 12,
    },
  ],
  validate: (values: Record<string, any>) => {
    if (!values.manufacturer || !String(values.manufacturer).trim()) {
      return { isValid: false, error: 'Manufacturer is required for Medical products.' };
    }
    if (!values.batch_number || !String(values.batch_number).trim()) {
      return { isValid: false, error: 'Batch Number is required for Medical products.' };
    }
    if (!values.expiry_date || !String(values.expiry_date).trim()) {
      return { isValid: false, error: 'Expiry Date is required for Medical products.' };
    }
    return { isValid: true };
  },
};
