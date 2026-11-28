import apiClient from '../../../api/apiClient';

export const settingsApi = {
  getShopSettings: async () => {
    const res = await apiClient.get('/settings/shop');
    return (res && (res as any).data !== undefined) ? (res as any).data : res;
  },

  updateShopSettings: async (data: any) => {
    const res = await apiClient.put('/settings/shop', data);
    return (res && (res as any).data !== undefined) ? (res as any).data : res;
  },

  exportBackup: async () => {
    const res = await apiClient.get('/settings/backup');
    return (res && (res as any).data !== undefined) ? (res as any).data : res;
  },

  restoreBackup: async (payload: any) => {
    const res = await apiClient.post('/settings/restore', payload);
    return (res && (res as any).data !== undefined) ? (res as any).data : res;
  },
};

export default settingsApi;
