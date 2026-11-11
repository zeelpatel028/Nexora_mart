import apiClient from '../../../../api/apiClient';
import { ElectronicsProductFormData } from '../types';

export const electronicsProductService = {
  async getProducts(params?: Record<string, any>) {
    return apiClient.get('/electronics/products', { params });
  },

  async getProductById(id: string) {
    return apiClient.get(`/electronics/products/${id}`);
  },

  async createProduct(formData: ElectronicsProductFormData) {
    const payload = {
      product_name: formData.basic.productName,
      sku: formData.basic.sku || undefined,
      barcode: formData.basic.barcode || undefined,
      category_id: formData.basic.categoryId || undefined,
      sub_category_id: formData.basic.subcategoryId || undefined,
      brand_id: formData.basic.brandId || undefined,
      description: formData.basic.description || formData.basic.shortDescription || undefined,
      status: formData.basic.status,

      // Electronics Specs
      device_type: formData.specifications.deviceType,
      model_name: formData.specifications.modelName,
      model_number: formData.specifications.modelNumber,
      color: formData.specifications.color,
      ram: formData.specifications.ram,
      storage_capacity: formData.specifications.storageCapacity,
      processor: formData.specifications.processor,
      screen_size: formData.specifications.screenSize,
      battery_capacity: formData.specifications.batteryCapacity,
      connectivity: formData.specifications.connectivity,
      warranty_months: formData.specifications.warrantyMonths || 12,
      warranty_type: formData.specifications.warrantyType,

      // Pricing & Tax
      purchase_price: parseFloat(formData.pricing.purchasePrice) || 0,
      selling_price: parseFloat(formData.pricing.sellingPrice) || 0,
      mrp: formData.pricing.mrp ? parseFloat(formData.pricing.mrp) : undefined,
      tax_type: formData.pricing.taxType,
      tax_rate: formData.pricing.gstRate,
      hsn_code: formData.pricing.hsnCode || formData.units.hsnCode || '8517',

      // Inventory
      stock_quantity: parseFloat(formData.inventory.openingStock) || formData.serialNumbers.length || 0,
      min_stock_level: parseFloat(formData.inventory.minimumStock) || 2,
      reorder_level: parseFloat(formData.inventory.reorderLevel) || 5,

      // Serial / IMEI Numbers
      serial_numbers: formData.serialNumbers.map((s) => ({
        serial_number: s.serialNumber,
        imei_number: s.imeiNumber,
        status: s.status || 'available',
      })),
    };

    return apiClient.post('/electronics/products', payload);
  },

  async updateProduct(id: string, formData: Partial<ElectronicsProductFormData>) {
    return apiClient.put(`/electronics/products/${id}`, formData);
  },

  async deleteProduct(id: string) {
    return apiClient.delete(`/electronics/products/${id}`);
  },
};

