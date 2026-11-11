import apiClient from '../../../../api/apiClient';
import { HandloomProductFormData } from '../types';

export const handloomProductService = {
  async getProducts(params?: Record<string, any>) {
    return apiClient.get('/handloom/products', { params });
  },

  async getProductById(id: string) {
    return apiClient.get(`/handloom/products/${id}`);
  },

  async createProduct(formData: HandloomProductFormData) {
    const payload = {
      product_name: formData.basic.productName,
      sku: formData.basic.sku || undefined,
      barcode: formData.basic.barcode || undefined,
      category_id: formData.basic.categoryId || undefined,
      sub_category_id: formData.basic.subcategoryId || undefined,
      brand_id: formData.basic.brandId || undefined,
      description: formData.basic.description || formData.basic.shortDescription || undefined,
      status: formData.basic.status,

      // Handloom Specs
      product_type: formData.specifications.productType,
      fabric_type: formData.specifications.fabricType,
      weaving_technique: formData.specifications.weavingTechnique,
      craft_type: formData.specifications.craftType,
      material: formData.specifications.material,
      design_pattern: formData.specifications.designPattern,
      origin_region: formData.specifications.originRegion,
      artisan_name: formData.specifications.artisanName,
      handwoven: formData.specifications.handwoven,

      // Pricing & Tax
      purchase_price: parseFloat(formData.pricing.purchasePrice) || 0,
      selling_price: parseFloat(formData.pricing.sellingPrice) || 0,
      mrp: formData.pricing.mrp ? parseFloat(formData.pricing.mrp) : undefined,
      tax_type: formData.pricing.taxType,
      tax_rate: formData.pricing.gstRate,
      hsn_code: formData.pricing.hsnCode || formData.units.hsnCode || '5007',

      // Inventory
      stock_quantity: parseFloat(formData.inventory.openingStock) || 0,
      min_stock_level: parseFloat(formData.inventory.minimumStock) || 2,
      reorder_level: parseFloat(formData.inventory.reorderLevel) || 5,
    };

    return apiClient.post('/handloom/products', payload);
  },

  async updateProduct(id: string, formData: Partial<HandloomProductFormData>) {
    return apiClient.put(`/handloom/products/${id}`, formData);
  },

  async deleteProduct(id: string) {
    return apiClient.delete(`/handloom/products/${id}`);
  },
};

