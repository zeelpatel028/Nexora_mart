import apiClient from '../../../../api/apiClient';
import { GroceryProductFormData } from '../types';

export const groceryProductService = {
  async getProducts(params?: Record<string, any>) {
    return apiClient.get('/grocery/products', { params });
  },

  async getProductById(id: string) {
    return apiClient.get(`/grocery/products/${id}`);
  },

  async createProduct(formData: GroceryProductFormData) {
    const payload = {
      product_name: formData.basic.productName,
      sku: formData.basic.sku || undefined,
      barcode: formData.basic.barcode || undefined,
      category_id: formData.basic.categoryId || undefined,
      sub_category_id: formData.basic.subcategoryId || undefined,
      brand_id: formData.basic.brandId || undefined,
      description: formData.basic.description || formData.basic.shortDescription || undefined,
      status: formData.basic.status,

      // Grocery Specs
      food_type: formData.specifications.foodType,
      item_type: formData.specifications.itemType,
      packaging_type: formData.specifications.packagingType,
      net_weight: formData.specifications.netWeight || formData.units.netWeight,
      gross_weight: formData.specifications.grossWeight,
      shelf_life_days: formData.specifications.shelfLifeDays ? parseInt(formData.specifications.shelfLifeDays, 10) : undefined,
      is_vegetarian: formData.specifications.isVegetarian,
      storage_type: formData.specifications.storageType,
      fssai_license: formData.specifications.fssaiLicense,

      // Pricing & Tax
      purchase_price: parseFloat(formData.pricing.purchasePrice) || 0,
      selling_price: parseFloat(formData.pricing.sellingPrice) || 0,
      mrp: formData.pricing.mrp ? parseFloat(formData.pricing.mrp) : undefined,
      tax_type: formData.pricing.taxType,
      tax_rate: formData.pricing.gstRate,
      hsn_code: formData.pricing.hsnCode || formData.units.hsnCode || '1006',

      // Inventory
      stock_quantity: parseFloat(formData.inventory.openingStock) || 0,
      min_stock_level: parseFloat(formData.inventory.minimumStock) || 5,
      reorder_level: parseFloat(formData.inventory.reorderLevel) || 10,

      // Detail
      details: {
        ingredients: formData.specifications.ingredients,
        nutritional_info: formData.specifications.nutritionalInfo,
        allergen_info: formData.specifications.allergenInfo,
        manufacturer: formData.specifications.manufacturer,
      },

      // Batches
      batches: formData.batches.map((b) => ({
        batch_number: b.batch_number,
        manufacturing_date: b.manufacturing_date,
        expiry_date: b.expiry_date,
        purchase_price: parseFloat(b.purchase_price) || parseFloat(formData.pricing.purchasePrice) || 0,
        selling_price: parseFloat(b.selling_price) || parseFloat(formData.pricing.sellingPrice) || 0,
        mrp: b.mrp ? parseFloat(b.mrp) : undefined,
        current_quantity: parseFloat(b.current_quantity) || 0,
        rack_location: b.rack_location,
      })),
    };

    return apiClient.post('/grocery/products', payload);
  },

  async updateProduct(id: string, formData: Partial<GroceryProductFormData>) {
    return apiClient.put(`/grocery/products/${id}`, formData);
  },

  async deleteProduct(id: string) {
    return apiClient.delete(`/grocery/products/${id}`);
  },
};

