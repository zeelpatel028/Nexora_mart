import api from './api';
import { API_ENDPOINTS } from '../constants';

export const categoryService = {
  getCategories: async (activeOnly = true) => {
    return await api.get(`${API_ENDPOINTS.CATEGORIES.LIST}?active_only=${activeOnly}`);
  },
  getCategoryDetail: async (id) => {
    return await api.get(API_ENDPOINTS.CATEGORIES.DETAILS(id));
  },
  getCategoryFields: async (id) => {
    return await api.get(API_ENDPOINTS.CATEGORIES.FIELDS(id));
  },
  createCategory: async (categoryData) => {
    return await api.post(API_ENDPOINTS.CATEGORIES.CREATE, categoryData);
  },
  updateCategory: async (id, categoryData) => {
    return await api.put(API_ENDPOINTS.CATEGORIES.UPDATE(id), categoryData);
  },
  deleteCategory: async (id) => {
    return await api.delete(API_ENDPOINTS.CATEGORIES.DELETE(id));
  }
};

export default categoryService;

