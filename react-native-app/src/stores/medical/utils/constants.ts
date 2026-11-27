export const AppConstants = {
  APP_NAME: 'Tulsi Mart',
  VERSION: '2.0.0',

  GST_RATES: [
    { label: '0% (Exempt)', value: 0 },
    { label: '5% GST', value: 5 },
    { label: '12% GST', value: 12 },
    { label: '18% GST', value: 18 },
    { label: '28% GST', value: 28 },
  ],

  STANDARD_UNITS: [
    { label: 'Piece', value: 'Piece' },
    { label: 'Kg (Kilogram)', value: 'Kg' },
    { label: 'Gram', value: 'Gram' },
    { label: 'Liter', value: 'Liter' },
    { label: 'Milliliter', value: 'Milliliter' },
    { label: 'Box', value: 'Box' },
    { label: 'Packet', value: 'Packet' },
    { label: 'Dozen', value: 'Dozen' },
    { label: 'Meter', value: 'Meter' },
  ],

  DEFAULT_PREFIXES: {
    invoice: 'INV',
    debit_customer: 'DC',
    walk_in_customer: 'WC',
    supplier: 'SUP',
    order: 'ORD',
    product: 'PRD',
    employee: 'EMP',
    return: 'RET',
    refund: 'REF',
    expense: 'EXP',
  },

  PAYMENT_METHODS: [
    { label: 'Cash', value: 'CASH' },
    { label: 'UPI / QR Code', value: 'UPI' },
    { label: 'Debit / Credit Card', value: 'CARD' },
    { label: 'Net Banking / Transfer', value: 'BANK_TRANSFER' },
    { label: 'Cheque', value: 'CHEQUE' },
  ],

  STORE_TYPES: [
    { id: 1, name: 'Grocery Store', code: 'grocery' },
    { id: 2, name: 'Clothing & Garments', code: 'clothing' },
    { id: 3, name: 'Medical & Pharmacy', code: 'medical' },
    { id: 4, name: 'Mobile & Electronics', code: 'electronics' },
    { id: 5, name: 'Plastic & Household', code: 'plastic' },
    { id: 6, name: 'Handloom & Textiles', code: 'handloom' },
    { id: 7, name: 'Furniture & Woodwork', code: 'furniture' },
    { id: 8, name: 'Agro & Seed Store', code: 'agro' },
  ],
};

export default AppConstants;
