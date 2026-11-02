/**
 * Category & Dynamic Field Metadata Service
 */
import apiClient from '../api/apiClient';
import Endpoints from '../api/endpoints';
import { Category, CategoryField } from '../models/types';

export const categoryService = {
  async getCategories(activeOnly: boolean = false): Promise<Category[]> {
    return apiClient.get<Category[]>(Endpoints.CATEGORIES.LIST, {
      params: { active_only: activeOnly },
    });
  },

  async getCategoryDetail(id: number): Promise<Category> {
    return apiClient.get<Category>(Endpoints.CATEGORIES.DETAIL(id));
  },

  async getCategoryFields(id: number): Promise<CategoryField[]> {
    return apiClient.get<CategoryField[]>(Endpoints.CATEGORIES.FIELDS(id));
  },

  async createCategory(payload: {
    name: string;
    code: string;
    description?: string;
    icon?: string;
  }): Promise<Category> {
    return apiClient.post<Category>(Endpoints.CATEGORIES.CREATE, payload);
  },

  async updateCategory(
    id: number,
    payload: { name?: string; description?: string; icon?: string; is_active?: boolean }
  ): Promise<Category> {
    return apiClient.put<Category>(Endpoints.CATEGORIES.UPDATE(id), payload);
  },

  async deleteCategory(id: number): Promise<{ message: string }> {
    return apiClient.delete(Endpoints.CATEGORIES.DELETE(id));
  },
};

export default categoryService;

