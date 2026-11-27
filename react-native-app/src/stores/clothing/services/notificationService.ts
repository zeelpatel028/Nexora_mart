import { Alert } from 'react-native';

export const notificationService = {
  showSuccess: (message: string, title: string = 'Success') => {
    Alert.alert(title, message, [{ text: 'OK' }]);
  },

  showError: (message: string, title: string = 'Error') => {
    Alert.alert(title, message, [{ text: 'OK' }]);
  },

  showLowStockAlert: (productName: string, currentStock: number, threshold: number) => {
    Alert.alert(
      'Low Stock Alert',
      `Product "${productName}" is running low!\nCurrent Stock: ${currentStock} (Alert threshold: ${threshold}).\nPlease order from supplier soon.`,
      [{ text: 'Dismiss' }, { text: 'Create Order' }]
    );
  },

  showExpiryAlert: (productName: string, batchNumber: string, expiryDate: string) => {
    Alert.alert(
      'Product Expiry Alert',
      `Product "${productName}" (Batch: ${batchNumber}) expires on ${expiryDate}.\nPlease take appropriate inventory action.`,
      [{ text: 'OK' }]
    );
  },
};

export default notificationService;
