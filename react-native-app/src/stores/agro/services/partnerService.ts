/**
 * CRM Partners (Customers & Suppliers) Service
 */
import apiClient from '../../../api/apiClient';
import Endpoints from '../../../api/endpoints';
import {
  Customer,
  Supplier,
  CustomerLedgerResponse,
  CustomerPaymentPayload,
  DebitCustomer,
} from '../../../api/types';

export const partnerService = {
  // Customers
  async getCustomers(search?: string): Promise<Customer[]> {
    return apiClient.get<Customer[]>(Endpoints.PARTNERS.CUSTOMERS, {
      params: { search },
    });
  },

  async getCustomer(id: number): Promise<Customer> {
    return apiClient.get<Customer>(Endpoints.PARTNERS.CUSTOMER_DETAIL(id));
  },

  async getCustomerLedger(id: number): Promise<CustomerLedgerResponse> {
    return apiClient.get<CustomerLedgerResponse>(Endpoints.PARTNERS.CUSTOMER_LEDGER(id));
  },

  async recordCustomerPayment(
    id: number,
    payload: CustomerPaymentPayload
  ): Promise<{
    success: boolean;
    message: string;
    payment_id: number;
    amount_paid: number;
    previous_balance: number;
    remaining_balance: number;
    allocated_bills: any[];
  }> {
    return apiClient.post(Endpoints.PARTNERS.CUSTOMER_PAYMENT(id), payload);
  },

  // Debit Customers (Khata Credit Ledger)
  async getDebitCustomers(search?: string): Promise<DebitCustomer[]> {
    return apiClient.get<DebitCustomer[]>(Endpoints.PARTNERS.DEBIT_CUSTOMERS, {
      params: { search },
    });
  },

  async recordDebitPayment(
    id: number,
    payload: { amount: number; payment_method?: string; notes?: string }
  ): Promise<{ success: boolean; message: string; remaining_balance: number }> {
    return apiClient.post(
      `${Endpoints.PARTNERS.DEBIT_PAYMENT(id)}?amount=${payload.amount}&payment_method=${payload.payment_method || 'CASH'}&notes=${encodeURIComponent(payload.notes || '')}`
    );
  },

  async createCustomer(payload: {
    name: string;
    phone?: string;
    email?: string;
    address?: string;
    gst_number?: string;
    credit_limit?: number;
    balance?: number;
  }): Promise<Customer> {
    return apiClient.post<Customer>(Endpoints.PARTNERS.CUSTOMERS, payload);
  },

  async updateCustomer(
    id: number,
    payload: {
      name?: string;
      phone?: string;
      email?: string;
      address?: string;
      credit_limit?: number;
      is_active?: boolean;
    }
  ): Promise<Customer> {
    return apiClient.put<Customer>(Endpoints.PARTNERS.CUSTOMER_DETAIL(id), payload);
  },

  async deleteCustomer(id: number): Promise<{ message: string }> {
    return apiClient.delete(Endpoints.PARTNERS.CUSTOMER_DETAIL(id));
  },

  // Suppliers
  async getSuppliers(search?: string): Promise<Supplier[]> {
    return apiClient.get<Supplier[]>(Endpoints.PARTNERS.SUPPLIERS, {
      params: { search },
    });
  },

  async createSupplier(payload: {
    name: string;
    company_name?: string;
    phone?: string;
    email?: string;
    address?: string;
    gst_number?: string;
  }): Promise<Supplier> {
    return apiClient.post<Supplier>(Endpoints.PARTNERS.SUPPLIERS, payload);
  },

  async updateSupplier(
    id: number,
    payload: {
      name?: string;
      company_name?: string;
      phone?: string;
      email?: string;
      address?: string;
      is_active?: boolean;
    }
  ): Promise<Supplier> {
    return apiClient.put<Supplier>(Endpoints.PARTNERS.SUPPLIER_DETAIL(id), payload);
  },

  async deleteSupplier(id: number): Promise<{ message: string }> {
    return apiClient.delete(Endpoints.PARTNERS.SUPPLIER_DETAIL(id));
  },
};

export default partnerService;

