/**
 * Product Catalog & Variants Service
 */
import apiClient from '../api/apiClient';
import Endpoints from '../api/endpoints';
import { Product, ProductCreatePayload, ProductUpdatePayload } from '../models/types';

export const productService = {
  async getProducts(params?: {
    categoryId?: number;
    search?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
  }): Promise<Product[]> {
    return apiClient.get<Product[]>(Endpoints.PRODUCTS.LIST, {
      params: {
        category_id: params?.categoryId,
        search: params?.search,
        is_active: params?.isActive,
        page: params?.page || 1,
        limit: params?.limit || 50,
      },
    });
  },

  async getProduct(id: number): Promise<Product> {
    return apiClient.get<Product>(Endpoints.PRODUCTS.DETAIL(id));
  },

  async createProduct(payload: ProductCreatePayload): Promise<Product> {
    return apiClient.post<Product>(Endpoints.PRODUCTS.CREATE, payload);
  },

  async updateProduct(id: number, payload: ProductUpdatePayload): Promise<Product> {
    return apiClient.put<Product>(Endpoints.PRODUCTS.UPDATE(id), payload);
  },

  async deleteProduct(id: number): Promise<{ message: string }> {
    return apiClient.delete(Endpoints.PRODUCTS.DELETE(id));
  },
};

export default productService;

