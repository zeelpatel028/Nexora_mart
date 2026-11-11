import api from './api';
import { API_ENDPOINTS } from '../constants';

export const productService = {
  getFormConfig: async () => {
    return await api.get(API_ENDPOINTS.PRODUCTS.FORM_CONFIG);
  },

  getProducts: async ({
    categoryId = null,
    brandId = null,
    search = '',
    barcode = '',
    status = '',
    stockFilter = '',
    isActive = null,
    sortBy = 'created_at',
    sortOrder = 'desc',
    page = 1,
    limit = 50
  } = {}) => {
    const params = new URLSearchParams();
    if (categoryId) params.append('category_id', categoryId);
    if (brandId) params.append('brand_id', brandId);
    if (search) params.append('search', search);
    if (barcode) params.append('barcode', barcode);
    if (status) params.append('status_filter', status);
    if (stockFilter) params.append('stock_filter', stockFilter);
    if (isActive !== null) params.append('is_active', isActive);
    if (sortBy) params.append('sort_by', sortBy);
    if (sortOrder) params.append('sort_order', sortOrder);
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
  },

  getBrands: async () => {
    return await api.get(API_ENDPOINTS.BRANDS.LIST);
  },

  createBrand: async (brandData) => {
    return await api.post(API_ENDPOINTS.BRANDS.CREATE, brandData);
  },

  getProductBatches: async (productId) => {
    return await api.get(API_ENDPOINTS.PRODUCTS.BATCHES(productId));
  },

  addProductBatch: async (productId, batchData) => {
    return await api.post(API_ENDPOINTS.PRODUCTS.BATCHES(productId), batchData);
  },

  getProductVariants: async (productId) => {
    return await api.get(API_ENDPOINTS.PRODUCTS.VARIANTS(productId));
  },

  addProductVariant: async (productId, variantData) => {
    return await api.post(API_ENDPOINTS.PRODUCTS.VARIANTS(productId), variantData);
  }
};

export default productService;

