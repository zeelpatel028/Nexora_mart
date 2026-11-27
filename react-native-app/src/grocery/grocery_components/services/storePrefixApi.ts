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
  prefixes?: Record<string, string>;
}

const KEY_TO_FLAT: Record<string, keyof StorePrefixes> = {
  invoice: 'invoice_prefix',
  debit_customer: 'debit_customer_prefix',
  walk_in_customer: 'walk_in_customer_prefix',
  supplier: 'supplier_prefix',
  order: 'order_prefix',
  product: 'product_prefix',
  employee: 'employee_prefix',
  return: 'return_prefix',
  refund: 'refund_prefix',
  expense: 'expense_prefix',
};

function toFlatPrefixes(res: any): StorePrefixes {
  const map: Record<string, string> = res?.prefixes || {};
  return {
    store_id: res?.store_id,
    prefixes: map,
    invoice_prefix: map.invoice || res?.invoice_prefix || 'INV',
    debit_customer_prefix: map.debit_customer || res?.debit_customer_prefix || 'KHT',
    walk_in_customer_prefix: map.walk_in_customer || res?.walk_in_customer_prefix || 'WLK',
    supplier_prefix: map.supplier || res?.supplier_prefix || 'SUP',
    order_prefix: map.order || res?.order_prefix || 'ORD',
    product_prefix: map.product || res?.product_prefix || 'PRD',
    employee_prefix: map.employee || res?.employee_prefix || 'EMP',
    return_prefix: map.return || res?.return_prefix || 'RTN',
    refund_prefix: map.refund || res?.refund_prefix || 'RFD',
    expense_prefix: map.expense || res?.expense_prefix || 'EXP',
  };
}

export const storePrefixApi = {
  getPrefixes: async (): Promise<StorePrefixes> => {
    const res = await apiClient.get('/grocery/prefixes');
    return toFlatPrefixes(res);
  },

  updatePrefixes: async (data: Partial<StorePrefixes> | { prefixes: Record<string, string> }): Promise<StorePrefixes> => {
    const prefixesMap: Record<string, string> = {};
    if ('prefixes' in data && data.prefixes) {
      Object.assign(prefixesMap, data.prefixes);
    } else {
      for (const [k, flatKey] of Object.entries(KEY_TO_FLAT)) {
        const val = (data as any)[flatKey] || (data as any)[k];
        if (val && typeof val === 'string') {
          const cleaned = val.replace(/_/g, '').replace(/^TM/i, '').trim().toUpperCase();
          if (cleaned.length >= 2 && cleaned.length <= 5) {
            prefixesMap[k] = cleaned;
          }
        }
      }
    }
    const res = await apiClient.put('/grocery/prefixes', { prefixes: prefixesMap });
    return toFlatPrefixes(res);
  },

  previewNextId: async (entityType: string): Promise<{ store_code?: string; key?: string; prefix: string; next_id: string }> => {
    return apiClient.get(`/grocery/prefixes/preview/${entityType}`);
  },
};

export default storePrefixApi;
