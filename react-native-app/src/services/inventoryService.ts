/**
 * Inventory, Stock Tracking & Audit Service
 */
import apiClient from '../api/apiClient';
import Endpoints from '../api/endpoints';
import {
  InventoryItem,
  StockAdjustPayload,
  StockInPayload,
  StockMovement,
  StockOutPayload,
} from '../models/types';

export const inventoryService = {
  async getInventory(search?: string): Promise<InventoryItem[]> {
    return apiClient.get<InventoryItem[]>(Endpoints.INVENTORY.LIST, {
      params: { search },
    });
  },

  async getLowStockAlerts(): Promise<InventoryItem[]> {
    return apiClient.get<InventoryItem[]>(Endpoints.INVENTORY.LOW_STOCK);
  },

  async getExpiryAlerts(): Promise<InventoryItem[]> {
    return apiClient.get<InventoryItem[]>(Endpoints.INVENTORY.EXPIRY_ALERTS);
  },

  async stockIn(payload: StockInPayload): Promise<any> {
    return apiClient.post(Endpoints.INVENTORY.STOCK_IN, payload);
  },

  async stockOut(payload: StockOutPayload): Promise<any> {
    return apiClient.post(Endpoints.INVENTORY.STOCK_OUT, payload);
  },

  async adjustStock(payload: StockAdjustPayload): Promise<any> {
    return apiClient.post(Endpoints.INVENTORY.ADJUST, payload);
  },

  async getMovements(productId?: number, limit: number = 50): Promise<StockMovement[]> {
    return apiClient.get<StockMovement[]>(Endpoints.INVENTORY.HISTORY, {
      params: { product_id: productId, limit },
    });
  },
};

export default inventoryService;

