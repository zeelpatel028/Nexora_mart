/**
 * Grocery Finance, Store Expenses & Payments Audit Service (/grocery/expenses & /grocery/payments)
 */
import apiClient from '../../../api/apiClient';
import { Expense, Payment } from '../../../api/types';

export const financeService = {
  async getExpenses(category?: string): Promise<Expense[]> {
    return apiClient.get<Expense[]>('/grocery/expenses', {
      params: category ? { category } : undefined,
    });
  },

  async createExpense(payload: {
    category: string;
    amount: number;
    payment_method: string;
    expense_date?: string;
    description?: string;
    receipt_url?: string;
  }): Promise<Expense> {
    return apiClient.post<Expense>('/grocery/expenses', payload);
  },

  async deleteExpense(id: number): Promise<{ message: string }> {
    return apiClient.delete(`/grocery/expenses/${id}`);
  },

  async getPayments(): Promise<Payment[]> {
    return apiClient.get<Payment[]>('/grocery/payments');
  },

  async recordPayment(payload: {
    reference_type: string;
    reference_id?: number;
    reference_code?: string;
    amount: number;
    payment_method: string;
    notes?: string;
  }): Promise<Payment> {
    return apiClient.post<Payment>('/grocery/payments', payload);
  },
};

export default financeService;
