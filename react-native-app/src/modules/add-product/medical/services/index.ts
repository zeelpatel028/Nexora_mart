import apiClient from '../../../../api/apiClient';
import { MedicalProductFormData } from '../types';

export const medicalProductService = {
  async getProducts(params?: Record<string, any>) {
    return apiClient.get('/medical/products', { params });
  },

  async getProductById(id: string) {
    return apiClient.get(`/medical/products/${id}`);
  },

  async createProduct(formData: MedicalProductFormData) {
    const payload = {
      product_name: formData.basic.productName,
      generic_name: formData.specifications.genericName || undefined,
      sku: formData.basic.sku || undefined,
      barcode: formData.basic.barcode || undefined,
      category_id: formData.basic.categoryId || undefined,
      sub_category_id: formData.basic.subcategoryId || undefined,
      brand_id: formData.basic.brandId || undefined,
      description: formData.basic.description || formData.basic.shortDescription || undefined,
      status: formData.basic.status,

      // Pharmacy Specs
      medicine_type: formData.specifications.medicineType,
      composition: formData.specifications.composition,
      strength: formData.specifications.strength,
      strength_unit: formData.specifications.strengthUnit,
      dosage_form: formData.specifications.dosageForm,
      route_of_administration: formData.specifications.routeOfAdministration || 'Oral',
      prescription_required: formData.specifications.prescriptionRequired,
      schedule_type: formData.specifications.scheduleType,
      therapeutic_category: formData.specifications.therapeuticCategory,
      drug_license_number: formData.specifications.drugLicenseNumber,
      storage_condition: formData.specifications.storageCondition,

      // Pricing & Tax
      purchase_price: parseFloat(formData.pricing.purchasePrice) || 0,
      selling_price: parseFloat(formData.pricing.sellingPrice) || 0,
      mrp: formData.pricing.mrp ? parseFloat(formData.pricing.mrp) : undefined,
      tax_type: formData.pricing.taxType,
      tax_rate: formData.pricing.gstRate,
      hsn_code: formData.pricing.hsnCode || formData.units.hsnCode || '3004',

      // Inventory
      stock_quantity: parseFloat(formData.inventory.openingStock) || 0,
      min_stock_level: parseFloat(formData.inventory.minimumStock) || 10,
      reorder_level: parseFloat(formData.inventory.reorderLevel) || 20,

      // Packaging
      details: {
        pack_size: formData.packaging.packSize,
        strips_per_box: formData.packaging.stripsPerBox || 10,
        tablets_per_strip: formData.packaging.tabletsPerStrip || 10,
        keep_refrigerated: formData.packaging.keepRefrigerated,
        light_sensitive: formData.packaging.lightSensitive,
        manufacturer: formData.packaging.manufacturer,
        side_effects: formData.packaging.sideEffects,
      },

      // Batches (FEFO Compliance)
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

    return apiClient.post('/medical/products', payload);
  },

  async updateProduct(id: string, formData: Partial<MedicalProductFormData>) {
    return apiClient.put(`/medical/products/${id}`, formData);
  },

  async deleteProduct(id: string) {
    return apiClient.delete(`/medical/products/${id}`);
  },
};

