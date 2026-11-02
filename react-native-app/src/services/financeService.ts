/**
 * Finance, Store Expenses & Payments Audit Service
 */
import apiClient from '../api/apiClient';
import Endpoints from '../api/endpoints';
import { Expense, Payment } from '../models/types';

export const financeService = {
  async getExpenses(): Promise<Expense[]> {
    return apiClient.get<Expense[]>(Endpoints.FINANCE.EXPENSES);
  },

  async createExpense(payload: {
    category: string;
    amount: number;
    payment_method: string;
    expense_date?: string;
    description?: string;
    receipt_url?: string;
  }): Promise<Expense> {
    return apiClient.post<Expense>(Endpoints.FINANCE.EXPENSES, payload);
  },

  async deleteExpense(id: number): Promise<{ message: string }> {
    return apiClient.delete(Endpoints.FINANCE.EXPENSE_DETAIL(id));
  },

  async getPayments(): Promise<Payment[]> {
    return apiClient.get<Payment[]>(Endpoints.FINANCE.PAYMENTS);
  },

  async recordPayment(payload: {
    reference_type: string;
    reference_id?: number;
    amount: number;
    payment_method: string;
    notes?: string;
  }): Promise<Payment> {
    return apiClient.post<Payment>(Endpoints.FINANCE.PAYMENTS, payload);
  },
};

export default financeService;

