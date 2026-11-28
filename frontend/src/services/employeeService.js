import api from './api';
import { API_ENDPOINTS } from '../constants';

export const employeeService = {
  getEmployees: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const url = query ? `${API_ENDPOINTS.EMPLOYEES.LIST}?${query}` : API_ENDPOINTS.EMPLOYEES.LIST;
    return await api.get(url);
  },
  getEmployeeDetail: async (id) => {
    return await api.get(API_ENDPOINTS.EMPLOYEES.DETAILS(id));
  },
  createEmployee: async (data) => {
    return await api.post(API_ENDPOINTS.EMPLOYEES.CREATE, data);
  },
  updateEmployee: async (id, data) => {
    return await api.put(API_ENDPOINTS.EMPLOYEES.UPDATE(id), data);
  },
  deleteEmployee: async (id) => {
    return await api.delete(API_ENDPOINTS.EMPLOYEES.DELETE(id));
  }
};

export default employeeService;

