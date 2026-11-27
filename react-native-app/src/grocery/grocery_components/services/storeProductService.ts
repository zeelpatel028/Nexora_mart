import apiClient from '../../../api/apiClient';

export interface GroceryProductCreateInput {
  name: string;
  supplier_id?: number | null;
  purchase_price_with_tax: number;
  purchase_gst_rate: number;
  purchase_unit: string;
  selling_price_with_tax: number;
  selling_unit: string;
  selling_gst_rate: number;
  available_stock: number;
  low_stock_enabled: boolean;
  low_stock_qty: number;
  expiry_alert_enabled: boolean;
}

export function normalizeGroceryProduct(p: any) {
  if (!p) return p;
  const stock = Number(p.available_stock ?? p.current_stock ?? p.stock_quantity ?? 0);
  const lowQty = Number(p.low_stock_qty ?? p.min_stock_level ?? 5);
  return {
    ...p,
    id: String(p.id),
    name: p.name || p.product_name || 'Item',
    product_name: p.name || p.product_name || 'Item',
    sku: p.product_code || p.sku || '',
    product_code: p.product_code || p.sku || '',
    purchase_price: Number(p.purchase_price_with_tax ?? p.purchase_price ?? 0),
    selling_price: Number(p.selling_price_with_tax ?? p.selling_price ?? 0),
    tax_rate: Number(p.selling_gst_rate ?? p.tax_rate ?? 0),
    purchase_gst_rate: Number(p.purchase_gst_rate ?? 0),
    selling_gst_rate: Number(p.selling_gst_rate ?? 0),
    unit: p.selling_unit || p.unit || 'Piece',
    purchase_unit: p.purchase_unit || p.unit || 'Piece',
    selling_unit: p.selling_unit || p.unit || 'Piece',
    available_stock: stock,
    current_stock: stock,
    stock_quantity: stock,
    low_stock_enabled: Boolean(p.low_stock_enabled),
    low_stock_qty: lowQty,
    min_stock_level: lowQty,
    expiry_alert_enabled: Boolean(p.expiry_alert_enabled),
    is_low_stock: Boolean(p.is_low_stock ?? (p.low_stock_enabled && stock <= lowQty)),
    inventory_record: {
      current_stock: stock,
      minimum_stock: lowQty,
    },
  };
}

export const groceryProductService = {
  async previewNextId(): Promise<string> {
    const res = await apiClient.get<{ next_id: string }>('/grocery/products/preview-id');
    return (res as any)?.next_id || 'TM_PRD_0001';
  },

  async getLookupRates(): Promise<{ label: string; value: number }[]> {
    const res = await apiClient.get<{ gst_rates?: { label: string; value: number }[] }>('/grocery/lookup/gst-rates');
    return (res as any)?.gst_rates || [
      { label: '0% (Exempt)', value: 0 },
      { label: '5% GST', value: 5 },
      { label: '12% GST', value: 12 },
      { label: '18% GST', value: 18 },
      { label: '28% GST', value: 28 },
    ];
  },

  async getLookupUnits(): Promise<string[]> {
    const res = await apiClient.get<{ units?: string[] }>('/grocery/lookup/units');
    return (res as any)?.units || [
      'Piece', 'Packet', 'Kilogram', 'Gram', 'Litre', 'Millilitre',
      'Dozen', 'Box', 'Bag', 'Bottle', 'Tin', 'Pouch', 'Carton', 'Tray',
    ];
  },

  async getProducts(params?: { search?: string; low_stock_only?: boolean; expiring_only?: boolean; page?: number; limit?: number }) {
    const res = await apiClient.get<{ items?: any[]; total?: number }>('/grocery/products', { params });
    const items = Array.isArray((res as any)?.items)
      ? (res as any).items.map(normalizeGroceryProduct)
      : Array.isArray(res)
      ? (res as any[]).map(normalizeGroceryProduct)
      : [];
    return { ...(res as any), items };
  },

  async getProductById(id: string | number) {
    const res = await apiClient.get<any>(`/grocery/products/${id}`);
    return {
      ...res,
      product: res?.product ? normalizeGroceryProduct(res.product) : normalizeGroceryProduct(res),
      ...normalizeGroceryProduct(res?.product || res),
      batches: Array.isArray(res?.batches) ? res.batches : [],
      stock_movements: Array.isArray(res?.stock_movements) ? res.stock_movements : [],
    };
  },

  async createProduct(payload: GroceryProductCreateInput) {
    const res = await apiClient.post('/grocery/products', payload);
    return normalizeGroceryProduct(res);
  },

  async updateProduct(id: string | number, payload: Partial<GroceryProductCreateInput>) {
    const res = await apiClient.put(`/grocery/products/${id}`, payload);
    return normalizeGroceryProduct(res);
  },

  async adjustStock(id: string | number, payload: { qty: number; type: 'add' | 'remove'; reason?: string }) {
    return apiClient.post(`/grocery/products/${id}/stock`, payload);
  },

  async deleteProduct(id: string | number) {
    return apiClient.delete(`/grocery/products/${id}`);
  },
};

export default groceryProductService;
