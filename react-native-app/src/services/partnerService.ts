/**
 * CRM Partners (Customers & Suppliers) Service
 */
import apiClient from '../api/apiClient';
import Endpoints from '../api/endpoints';
import { Customer, Supplier } from '../models/types';

export const partnerService = {
  // Customers
  async getCustomers(search?: string): Promise<Customer[]> {
    return apiClient.get<Customer[]>(Endpoints.PARTNERS.CUSTOMERS, {
      params: { search },
    });
  },

  async createCustomer(payload: {
    name: string;
    phone?: string;
    email?: string;
    address?: string;
    gst_number?: string;
    credit_limit?: number;
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

