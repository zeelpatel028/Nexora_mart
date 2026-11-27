import apiClient from '../../../api/apiClient';

export const settingsApi = {
  getShopSettings: async () => {
    return apiClient.get('/grocery/settings');
  },

  updateShopSettings: async (data: {
    theme?: string;
    language?: string;
    currency_code?: string;
    currency_symbol?: string;
    bill_template_id?: string;
    bill_sound_enabled?: boolean;
    bill_sound_id?: string;
  }) => {
    return apiClient.put('/grocery/settings', data);
  },

  exportBackup: async () => {
    return apiClient.get('/grocery/backup/export');
  },

  getBackupHistory: async () => {
    return apiClient.get('/grocery/backup/history');
  },

  restoreBackup: async (payload: any) => {
    return apiClient.post('/grocery/backup/restore', payload);
  },
};

export default settingsApi;
