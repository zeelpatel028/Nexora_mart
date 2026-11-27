/**
 * Grocery CRM Partners (Khata Customers & Suppliers) Service
 */
import apiClient from '../../../api/apiClient';
import customerApi from './customerApi';
import supplierApi from './supplierApi';
import {
  Customer,
  Supplier,
  CustomerLedgerResponse,
  CustomerPaymentPayload,
  DebitCustomer,
} from '../../../api/types';

export const partnerService = {
  async getCustomers(search?: string): Promise<Customer[]> {
    const res = await customerApi.listCustomers({ search, limit: 100 });
    return (res.items || []) as Customer[];
  },

  async getCustomer(id: number): Promise<Customer> {
    const res = await customerApi.getCustomerDetails(id);
    return (res?.customer || res) as Customer;
  },

  async getCustomerLedger(id: number): Promise<CustomerLedgerResponse> {
    return (await customerApi.getCustomerDetails(id)) as CustomerLedgerResponse;
  },

  async recordCustomerPayment(id: number, payload: CustomerPaymentPayload): Promise<any> {
    return customerApi.receivePayment(id, payload);
  },

  async getDebitCustomers(search?: string): Promise<DebitCustomer[]> {
    const res = await customerApi.listCustomers({ search, limit: 100 });
    return ((res.items || []) as any[]).filter(
      (c) => Number(c.pending_bill_amount ?? c.total_due ?? 0) > 0 || Number(c.total_bills_count ?? 0) >= 0
    ) as DebitCustomer[];
  },

  async recordDebitPayment(id: number, payload: { amount: number; payment_method?: string; notes?: string }): Promise<any> {
    return customerApi.receivePayment(id, payload);
  },

  async createCustomer(payload: { name: string; phone?: string; address?: string }): Promise<Customer> {
    return (await customerApi.createCustomer({
      name: payload.name,
      phone: payload.phone || '0000000000',
      address: payload.address,
    })) as Customer;
  },

  async updateCustomer(id: number, payload: { name?: string; phone?: string; address?: string }): Promise<Customer> {
    return apiClient.put<Customer>(`/grocery/customers/${id}`, payload);
  },

  async deleteCustomer(id: number): Promise<{ message: string }> {
    return apiClient.delete(`/grocery/customers/${id}`);
  },

  async getSuppliers(search?: string): Promise<Supplier[]> {
    return (await supplierApi.listSuppliers({ search, limit: 100 })) as Supplier[];
  },

  async createSupplier(payload: any): Promise<Supplier> {
    return (await supplierApi.createSupplier({
      store_name: payload.store_name || payload.company_name || payload.name,
      seller_name: payload.seller_name || payload.name,
      phone: payload.phone || '0000000000',
      email: payload.email,
      address: payload.address,
      gst_number: payload.gst_number,
      bank_name: payload.bank_name,
      account_holder: payload.account_holder,
      account_number: payload.account_number,
      ifsc: payload.ifsc,
      upi_id: payload.upi_id,
    })) as Supplier;
  },

  async updateSupplier(id: number, payload: any): Promise<Supplier> {
    return apiClient.put<Supplier>(`/grocery/suppliers/${id}`, payload);
  },

  async deleteSupplier(id: number): Promise<{ message: string }> {
    return apiClient.delete(`/grocery/suppliers/${id}`);
  },
};

export default partnerService;
