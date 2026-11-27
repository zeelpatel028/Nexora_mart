/**
 * Grocery Product Catalog Service (backed by /grocery/products)
 */
import groceryProductService from './storeProductService';
import { Product, ProductCreatePayload, ProductUpdatePayload, FormConfigResponse } from '../../../api/types';

export const productService = {
  async getFormConfig(): Promise<FormConfigResponse> {
    const [rates, units] = await Promise.all([
      groceryProductService.getLookupRates().catch(() => []),
      groceryProductService.getLookupUnits().catch(() => []),
    ]);
    return { gst_rates: rates, units } as any;
  },

  async getProducts(params?: {
    categoryId?: number;
    brandId?: number;
    search?: string;
    lowStockOnly?: boolean;
    expiringOnly?: boolean;
    page?: number;
    limit?: number;
    stockFilter?: string;
    isActive?: boolean;
  }): Promise<Product[]> {
    const res = await groceryProductService.getProducts({
      search: params?.search,
      low_stock_only: params?.lowStockOnly || params?.stockFilter === 'low_stock',
      expiring_only: params?.expiringOnly,
      page: params?.page || 1,
      limit: Math.min(Math.max(1, params?.limit || 50), 100),
    });
    return (res.items || []) as Product[];
  },

  async getAllProducts(params?: { search?: string }): Promise<Product[]> {
    const all: Product[] = [];
    let page = 1;
    while (page <= 20) {
      const res = await groceryProductService.getProducts({ search: params?.search, page, limit: 100 });
      const items = res.items || [];
      all.push(...items);
      if (items.length < 100) break;
      page += 1;
    }
    return all;
  },

  async getProduct(id: string | number): Promise<Product> {
    return (await groceryProductService.getProductById(id)) as any;
  },

  async createProduct(payload: ProductCreatePayload | any): Promise<Product> {
    return groceryProductService.createProduct({
      name: payload.name || payload.product_name,
      supplier_id: payload.supplier_id ?? null,
      purchase_price_with_tax: Number(payload.purchase_price_with_tax ?? payload.purchase_price ?? 0),
      purchase_gst_rate: Number(payload.purchase_gst_rate ?? payload.tax_rate ?? 0),
      purchase_unit: payload.purchase_unit || payload.unit || 'Piece',
      selling_price_with_tax: Number(payload.selling_price_with_tax ?? payload.selling_price ?? 0),
      selling_unit: payload.selling_unit || payload.unit || 'Piece',
      selling_gst_rate: Number(payload.selling_gst_rate ?? payload.tax_rate ?? 0),
      available_stock: Number(payload.available_stock ?? payload.stock_quantity ?? 0),
      low_stock_enabled: Boolean(payload.low_stock_enabled),
      low_stock_qty: Number(payload.low_stock_qty ?? payload.min_stock_level ?? 5),
      expiry_alert_enabled: Boolean(payload.expiry_alert_enabled),
    }) as any;
  },

  async updateProduct(id: string | number, payload: ProductUpdatePayload | any): Promise<Product> {
    return groceryProductService.updateProduct(id, payload) as any;
  },

  async deleteProduct(id: string | number): Promise<{ message: string }> {
    return groceryProductService.deleteProduct(id) as any;
  },
};

export default productService;
