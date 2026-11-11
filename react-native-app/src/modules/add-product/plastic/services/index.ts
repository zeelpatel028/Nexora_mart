import apiClient from '../../../../api/apiClient';
import { PlasticProductFormData } from '../types';

export const plasticProductService = {
  async getProducts(params?: Record<string, any>) {
    return apiClient.get('/plastic/products', { params });
  },

  async getProductById(id: string) {
    return apiClient.get(`/plastic/products/${id}`);
  },

  async createProduct(formData: PlasticProductFormData) {
    const payload = {
      product_name: formData.basic.productName,
      sku: formData.basic.sku || undefined,
      barcode: formData.basic.barcode || undefined,
      category_id: formData.basic.categoryId || undefined,
      sub_category_id: formData.basic.subcategoryId || undefined,
      brand_id: formData.basic.brandId || undefined,
      description: formData.basic.description || formData.basic.shortDescription || undefined,
      status: formData.basic.status,

      // Plastic Specs
      plastic_type: formData.specifications.plasticType,
      material_grade: formData.specifications.materialGrade,
      color: formData.specifications.color,
      shape: formData.specifications.shape,
      capacity: formData.specifications.capacity,
      capacity_unit: formData.specifications.capacityUnit,
      length: formData.specifications.length,
      width: formData.specifications.width,
      height: formData.specifications.height,
      thickness: formData.specifications.thickness,
      weight: formData.specifications.weight,
      food_grade: formData.specifications.foodGrade,
      recyclable: formData.specifications.recyclable,
      uv_resistant: formData.specifications.uvResistant,

      // Pricing & Tax
      purchase_price: parseFloat(formData.pricing.purchasePrice) || 0,
      selling_price: parseFloat(formData.pricing.sellingPrice) || 0,
      mrp: formData.pricing.mrp ? parseFloat(formData.pricing.mrp) : undefined,
      tax_type: formData.pricing.taxType,
      tax_rate: formData.pricing.gstRate,
      hsn_code: formData.pricing.hsnCode || formData.units.hsnCode || '3924',

      // Inventory
      stock_quantity: parseFloat(formData.inventory.openingStock) || 0,
      min_stock_level: parseFloat(formData.inventory.minimumStock) || 5,
      reorder_level: parseFloat(formData.inventory.reorderLevel) || 10,
    };

    return apiClient.post('/plastic/products', payload);
  },

  async updateProduct(id: string, formData: Partial<PlasticProductFormData>) {
    return apiClient.put(`/plastic/products/${id}`, formData);
  },

  async deleteProduct(id: string) {
    return apiClient.delete(`/plastic/products/${id}`);
  },
};

