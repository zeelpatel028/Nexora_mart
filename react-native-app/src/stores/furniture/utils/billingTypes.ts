export type PaymentMode = 'CASH' | 'UPI' | 'BANK_TRANSFER' | 'DEBIT_CUSTOMER' | 'CARD';

export interface BillingCartItem {
  product_id: string | number;
  name: string;
  sku: string;
  barcode?: string;
  unit: string;
  unit_price: number;
  original_price: number;
  quantity: number;
  discount: number; // Item-level discount
  available_stock: number;
  total: number;
}

export interface CustomerSummary {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  balance: number; // Outstanding debit balance
  credit_limit: number;
}

export type CustomerType = 'walk_in' | 'debit_customer';

export interface SelectedCustomer {
  type: CustomerType;
  id?: number;
  name: string;
  phone?: string;
  balance?: number;
  credit_limit?: number;
}

export interface BillDateFilter {
  type: 'today' | 'yesterday' | 'week' | 'custom' | 'all';
  dateStr?: string; // YYYY-MM-DD
  startDateStr?: string;
  endDateStr?: string;
  label: string;
}

