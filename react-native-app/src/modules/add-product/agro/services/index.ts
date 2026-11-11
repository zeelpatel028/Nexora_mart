import apiClient from '../../../../api/apiClient';
import { AgroProductFormData } from '../types';

export const agroProductService = {
  async getProducts(params?: Record<string, any>) {
    return apiClient.get('/agro/products', { params });
  },

  async getProductById(id: string) {
    return apiClient.get(`/agro/products/${id}`);
  },

  async createProduct(formData: AgroProductFormData) {
    const payload: Record<string, any> = {
      product_name: formData.basic.productName,
      sku: formData.basic.sku || undefined,
      barcode: formData.basic.barcode || undefined,
      category_id: formData.basic.categoryId || undefined,
      sub_category_id: formData.basic.subcategoryId || undefined,
      brand_id: formData.basic.brandId || undefined,
      description: formData.basic.description || formData.basic.shortDescription || undefined,
      status: formData.basic.status,

      agro_product_type: formData.agroProductType,

      // Pricing & Tax
      purchase_price: parseFloat(formData.pricing.purchasePrice) || 0,
      selling_price: parseFloat(formData.pricing.sellingPrice) || 0,
      mrp: formData.pricing.mrp ? parseFloat(formData.pricing.mrp) : undefined,
      tax_type: formData.pricing.taxType,
      tax_rate: formData.pricing.gstRate,
      hsn_code: formData.pricing.hsnCode || formData.units.hsnCode || '3808',

      // Inventory
      stock_quantity: parseFloat(formData.inventory.openingStock) || 0,
      min_stock_level: parseFloat(formData.inventory.minimumStock) || 5,
      reorder_level: parseFloat(formData.inventory.reorderLevel) || 10,
    };

    // Sub-type detail mapping
    if (formData.agroProductType === 'Crop Medicine' && formData.medicineDetails) {
      const med = formData.medicineDetails;
      payload.details = {
        medicine_type: med.medicineType,
        active_ingredient: med.activeIngredient,
        chemical_composition: med.chemicalComposition,
        concentration: med.concentration,
        formulation_type: med.formulationType,
        target_pest: med.targetPest,
        suitable_crops: med.suitableCrops,
        application_method: med.applicationMethod,
        recommended_dosage: med.recommendedDosage,
        dosage_unit: med.dosageUnit || 'ml / Litre',
        waiting_period_phi: med.waitingPeriodPhi,
        re_entry_interval: med.reEntryInterval,
        toxicity_class: med.toxicityClass,
        registration_number: med.registrationNumber,
        label_instructions: med.labelInstructions,
        safety_instructions: med.safetyInstructions,
      };
    } else if (formData.agroProductType === 'Crop' && formData.cropDetails) {
      const c = formData.cropDetails;
      payload.details = {
        crop_category: c.cropCategory,
        crop_variety: c.cropVariety,
        crop_season: c.cropSeason,
        crop_duration: c.cropDuration,
        growing_region: c.growingRegion,
        grade: c.grade,
        moisture_content: c.moistureContent,
        organic_certified: c.organicCertified,
        harvest_year: c.harvestYear,
      };
    } else if (formData.agroProductType === 'Fertilizer' && formData.fertilizerDetails) {
      const f = formData.fertilizerDetails;
      payload.details = {
        fertilizer_type: f.fertilizerType,
        nitrogen_pct: f.nitrogenPct ? parseFloat(f.nitrogenPct) : 0,
        phosphorus_pct: f.phosphorusPct ? parseFloat(f.phosphorusPct) : 0,
        potassium_pct: f.potassiumPct ? parseFloat(f.potassiumPct) : 0,
        sulphur_pct: f.sulphurPct ? parseFloat(f.sulphurPct) : 0,
        zinc_pct: f.zincPct ? parseFloat(f.zincPct) : 0,
        boron_pct: f.boronPct ? parseFloat(f.boronPct) : 0,
        physical_form: f.physicalForm,
        application_method: f.applicationMethod,
        suitable_crops: f.suitableCrops,
      };
    } else if (formData.agroProductType === 'Seeds' && formData.seedDetails) {
      const s = formData.seedDetails;
      payload.details = {
        seed_type: s.seedType,
        crop_name: s.cropName,
        seed_variety: s.seedVariety,
        hybrid_type: s.hybridType,
        seed_class: s.seedClass,
        germination_rate: s.germinationRate ? parseFloat(s.germinationRate) : 85,
        physical_purity: s.physicalPurity ? parseFloat(s.physicalPurity) : 98,
        genetic_purity: s.geneticPurity ? parseFloat(s.geneticPurity) : 99,
        seed_certification_number: s.seedCertificationNumber,
        lot_number: s.lotNumber,
        days_to_maturity: s.daysToMaturity ? parseInt(s.daysToMaturity, 10) : undefined,
      };
    }

    // Batches
    if (formData.batches && formData.batches.length > 0) {
      payload.batches = formData.batches.map((b) => ({
        batch_number: b.batch_number,
        manufacturing_date: b.manufacturing_date,
        expiry_date: b.expiry_date,
        purchase_price: parseFloat(b.purchase_price) || 0,
        selling_price: parseFloat(b.selling_price) || 0,
        mrp: b.mrp ? parseFloat(b.mrp) : undefined,
        current_quantity: parseFloat(b.current_quantity) || 0,
        rack_location: b.rack_location,
      }));
    }

    return apiClient.post('/agro/products', payload);
  },

  async updateProduct(id: string, formData: Partial<AgroProductFormData>) {
    return apiClient.put(`/agro/products/${id}`, formData);
  },

  async deleteProduct(id: string) {
    return apiClient.delete(`/agro/products/${id}`);
  },
};

