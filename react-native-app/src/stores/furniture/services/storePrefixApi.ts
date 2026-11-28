import apiClient from '../../../api/apiClient';

export interface StorePrefixes {
  id?: number;
  store_id?: number;
  invoice_prefix: string;
  debit_customer_prefix: string;
  walk_in_customer_prefix: string;
  supplier_prefix: string;
  order_prefix: string;
  product_prefix: string;
  employee_prefix: string;
  return_prefix: string;
  refund_prefix: string;
  expense_prefix: string;
}

export const storePrefixApi = {
  getPrefixes: async (): Promise<StorePrefixes> => {
    return apiClient.get<StorePrefixes>('/store-prefixes');
  },

  updatePrefixes: async (data: Partial<StorePrefixes>): Promise<StorePrefixes> => {
    return apiClient.put<StorePrefixes>('/store-prefixes', data);
  },

  previewNextId: async (entityType: string): Promise<{ entity_type: string; prefix: string; next_id: string }> => {
    return apiClient.get<{ entity_type: string; prefix: string; next_id: string }>(
      `/store-prefixes/preview/${entityType}`
    );
  },
};

export default storePrefixApi;
