/**
 * Product Catalog, Dynamic Form Config & Variants Service
 */
import apiClient from '../../../api/apiClient';
import Endpoints from '../../../api/endpoints';
import {
  Product,
  ProductCreatePayload,
  ProductUpdatePayload,
  FormConfigResponse,
  Brand,
  ProductBatch,
  ProductVariant
} from '../../../api/types';

export const productService = {
  async getFormConfig(): Promise<FormConfigResponse> {
    return apiClient.get<FormConfigResponse>(Endpoints.PRODUCTS.FORM_CONFIG);
  },

  async getProducts(params?: {
    categoryId?: number;
    brandId?: number;
    search?: string;
    barcode?: string;
    statusFilter?: string;
    stockFilter?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
  }): Promise<Product[]> {
    const page = Math.max(1, params?.page || 1);
    const limit = Math.min(Math.max(1, params?.limit || 50), 200);

    return apiClient.get<Product[]>(Endpoints.PRODUCTS.LIST, {
      params: {
        category_id: params?.categoryId,
        brand_id: params?.brandId,
        search: params?.search,
        barcode: params?.barcode,
        status_filter: params?.statusFilter,
        stock_filter: params?.stockFilter,
        is_active: params?.isActive !== undefined ? params.isActive : undefined,
        page,
        limit,
      },
    });
  },

  /**
   * Fetches all products using controlled batch pagination.
   * Safe alternative to requesting unsupported limits.
   */
  async getAllProducts(params?: {
    categoryId?: number;
    brandId?: number;
    search?: string;
    barcode?: string;
    statusFilter?: string;
    stockFilter?: string;
    isActive?: boolean;
    batchSize?: number;
  }): Promise<Product[]> {
    const batchSize = Math.min(Math.max(1, params?.batchSize || 100), 200);
    let currentPage = 1;
    const allProducts: Product[] = [];
    let hasMore = true;

    while (hasMore) {
      const batch = await productService.getProducts({
        ...params,
        page: currentPage,
        limit: batchSize,
      });

      if (!batch || !Array.isArray(batch) || batch.length === 0) {
        hasMore = false;
      } else {
        allProducts.push(...batch);
        if (batch.length < batchSize) {
          hasMore = false;
        } else {
          currentPage += 1;
        }
      }

      if (currentPage > 50) break; // Safety break
    }

    return allProducts;
  },

  async getProduct(id: string | number): Promise<Product> {
    return apiClient.get<Product>(Endpoints.PRODUCTS.DETAIL(id));
  },

  async createProduct(payload: ProductCreatePayload): Promise<Product> {
    return apiClient.post<Product>(Endpoints.PRODUCTS.CREATE, payload);
  },

  async updateProduct(id: string | number, payload: ProductUpdatePayload): Promise<Product> {
    return apiClient.put<Product>(Endpoints.PRODUCTS.UPDATE(id), payload);
  },

  async deleteProduct(id: string | number): Promise<{ message: string }> {
    return apiClient.delete(Endpoints.PRODUCTS.DELETE(id));
  },

  async getBrands(): Promise<Brand[]> {
    return apiClient.get<Brand[]>(Endpoints.BRANDS.LIST);
  },

  async createBrand(payload: { name: string; code?: string; is_active?: boolean }): Promise<Brand> {
    return apiClient.post<Brand>(Endpoints.BRANDS.CREATE, payload);
  },

  async getProductBatches(productId: string | number): Promise<ProductBatch[]> {
    return apiClient.get<ProductBatch[]>(Endpoints.PRODUCTS.BATCHES(productId));
  },

  async addProductBatch(productId: string | number, payload: any): Promise<ProductBatch> {
    return apiClient.post<ProductBatch>(Endpoints.PRODUCTS.BATCHES(productId), payload);
  },

  async getProductVariants(productId: string | number): Promise<ProductVariant[]> {
    return apiClient.get<ProductVariant[]>(Endpoints.PRODUCTS.VARIANTS(productId));
  },

  async addProductVariant(productId: string | number, payload: any): Promise<ProductVariant> {
    return apiClient.post<ProductVariant>(Endpoints.PRODUCTS.VARIANTS(productId), payload);
  },
};

export default productService;

