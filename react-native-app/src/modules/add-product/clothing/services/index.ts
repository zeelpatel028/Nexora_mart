import apiClient from '../../../../api/apiClient';
import { ClothingProductFormData } from '../types';

export const clothingProductService = {
  async getProducts(params?: Record<string, any>) {
    return apiClient.get('/clothing/products', { params });
  },

  async getProductById(id: string) {
    return apiClient.get(`/clothing/products/${id}`);
  },

  async createProduct(formData: ClothingProductFormData) {
    const payload = {
      product_name: formData.basic.productName,
      sku: formData.basic.sku || undefined,
      barcode: formData.basic.barcode || undefined,
      category_id: formData.basic.categoryId || undefined,
      sub_category_id: formData.basic.subcategoryId || undefined,
      brand_id: formData.basic.brandId || undefined,
      description: formData.basic.description || formData.basic.shortDescription || undefined,
      status: formData.basic.status,

      // Clothing specific
      gender: formData.specifications.gender,
      clothing_type: formData.specifications.clothingType,
      fabric_type: formData.specifications.fabric,
      pattern: formData.specifications.pattern,
      fit_type: formData.specifications.fit,
      neck_type: formData.specifications.neckType,
      sleeve_type: formData.specifications.sleeveLength,
      occasion: formData.specifications.occasion,

      // Pricing & Tax
      purchase_price: parseFloat(formData.pricing.purchasePrice) || 0,
      selling_price: parseFloat(formData.pricing.sellingPrice) || 0,
      mrp: formData.pricing.mrp ? parseFloat(formData.pricing.mrp) : undefined,
      tax_type: formData.pricing.taxType,
      tax_rate: formData.pricing.gstRate,
      hsn_code: formData.pricing.hsnCode || formData.units.hsnCode || '6109',

      // Inventory
      stock_quantity: parseFloat(formData.inventory.openingStock) || 0,
      min_stock_level: parseFloat(formData.inventory.minimumStock) || 5,
      reorder_level: parseFloat(formData.inventory.reorderLevel) || 10,

      // Detail & Measurements
      detail: {
        chest_measure: formData.measurements.chest,
        waist_measure: formData.measurements.waist,
        hip_measure: formData.measurements.hip,
        length_measure: formData.measurements.length,
        shoulder_measure: formData.measurements.shoulder,
        sleeve_measure: formData.measurements.sleeve,
        inseam_measure: formData.measurements.inseam,
        care_instructions: formData.specifications.careInstructions,
      },

      // Size-Color Variants
      variants: formData.variants.map((v) => ({
        size: v.size,
        color: v.color,
        sku: v.sku,
        barcode: v.barcode,
        purchase_price: parseFloat(v.purchase_price) || parseFloat(formData.pricing.purchasePrice) || 0,
        selling_price: parseFloat(v.selling_price) || parseFloat(formData.pricing.sellingPrice) || 0,
        mrp: v.mrp ? parseFloat(v.mrp) : undefined,
        stock_quantity: parseFloat(v.stock_quantity) || 0,
      })),
    };

    return apiClient.post('/clothing/products', payload);
  },

  async updateProduct(id: string, formData: Partial<ClothingProductFormData>) {
    return apiClient.put(`/clothing/products/${id}`, formData);
  },

  async deleteProduct(id: string) {
    return apiClient.delete(`/clothing/products/${id}`);
  },
};

