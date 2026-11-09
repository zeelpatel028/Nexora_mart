export type FieldType = 'text' | 'number' | 'select' | 'date' | 'boolean';

export interface StoreTypeField {
  fieldName: string;
  fieldLabel: string;
  fieldType: FieldType;
  isRequired: boolean;
  options?: string[];
  defaultValue?: string;
  placeholder?: string;
  helpText?: string;
  displayOrder?: number;
}

export interface StoreTypeConfig {
  code: string;
  name: string;
  icon: string;
  description: string;
  defaultUnits: string[];
  fields: StoreTypeField[];
  validate: (values: Record<string, any>) => { isValid: boolean; error?: string };
}

