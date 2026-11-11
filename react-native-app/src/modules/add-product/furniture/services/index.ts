import apiClient from '../../../../api/apiClient';
import { FurnitureProductFormData } from '../types';

export const furnitureProductService = {
  async getProducts(params?: Record<string, any>) {
    return apiClient.get('/furniture/products', { params });
  },

  async getProductById(id: string) {
    return apiClient.get(`/furniture/products/${id}`);
  },

  async createProduct(formData: FurnitureProductFormData) {
    const payload = {
      product_name: formData.basic.productName,
      sku: formData.basic.sku || undefined,
      barcode: formData.basic.barcode || undefined,
      category_id: formData.basic.categoryId || undefined,
      sub_category_id: formData.basic.subcategoryId || undefined,
      brand_id: formData.basic.brandId || undefined,
      description: formData.basic.description || formData.basic.shortDescription || undefined,
      status: formData.basic.status,

      // Furniture Specs
      furniture_type: formData.specifications.furnitureType,
      material: formData.specifications.material,
      wood_type: formData.specifications.woodType,
      finish_type: formData.specifications.finishType,
      color: formData.specifications.color,
      seating_capacity: formData.specifications.seatingCapacity ? parseInt(formData.specifications.seatingCapacity, 10) : undefined,
      length: formData.specifications.length,
      width: formData.specifications.width,
      height: formData.specifications.height,
      dimension_unit: formData.specifications.dimensionUnit || 'inch',
      weight: formData.specifications.weight,
      weight_unit: formData.specifications.weightUnit || 'kg',
      assembly_required: formData.specifications.assemblyRequired,
      storage_available: formData.specifications.storageAvailable,
      warranty_period: formData.specifications.warrantyPeriod || 36,
      warranty_unit: formData.specifications.warrantyUnit || 'Months',

      // Pricing & Tax
      purchase_price: parseFloat(formData.pricing.purchasePrice) || 0,
      selling_price: parseFloat(formData.pricing.sellingPrice) || 0,
      mrp: formData.pricing.mrp ? parseFloat(formData.pricing.mrp) : undefined,
      tax_type: formData.pricing.taxType,
      tax_rate: formData.pricing.gstRate,
      hsn_code: formData.pricing.hsnCode || formData.units.hsnCode || '9403',

      // Inventory
      stock_quantity: parseFloat(formData.inventory.openingStock) || 0,
      min_stock_level: parseFloat(formData.inventory.minimumStock) || 1,
      reorder_level: parseFloat(formData.inventory.reorderLevel) || 3,
    };

    return apiClient.post('/furniture/products', payload);
  },

  async updateProduct(id: string, formData: Partial<FurnitureProductFormData>) {
    return apiClient.put(`/furniture/products/${id}`, formData);
  },

  async deleteProduct(id: string) {
    return apiClient.delete(`/furniture/products/${id}`);
  },
};

