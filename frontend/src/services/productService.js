import api from './api';
import { API_ENDPOINTS } from '../constants';

export const productService = {
  getProducts: async ({ categoryId = null, search = '', isActive = null, page = 1, limit = 50 } = {}) => {
    const params = new URLSearchParams();
    if (categoryId) params.append('category_id', categoryId);
    if (search) params.append('search', search);
    if (isActive !== null) params.append('is_active', isActive);
    params.append('page', page);
    params.append('limit', limit);
    return await api.get(`${API_ENDPOINTS.PRODUCTS.LIST}?${params.toString()}`);
  },
  getProduct: async (id) => {
    return await api.get(API_ENDPOINTS.PRODUCTS.DETAILS(id));
  },
  createProduct: async (productData) => {
    return await api.post(API_ENDPOINTS.PRODUCTS.CREATE, productData);
  },
  updateProduct: async (id, productData) => {
    return await api.put(API_ENDPOINTS.PRODUCTS.UPDATE(id), productData);
  },
  deleteProduct: async (id) => {
    return await api.delete(API_ENDPOINTS.PRODUCTS.DELETE(id));
  }
};

export default productService;

