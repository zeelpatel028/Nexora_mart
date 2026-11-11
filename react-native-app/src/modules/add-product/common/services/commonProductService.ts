import apiClient from '../../../../api/apiClient';
import Endpoints from '../../../../api/endpoints';
import { Category, Brand } from '../../../../models/types';
import { UnitConversionRule } from '../types';

export interface CommonFormDataMaster {
  categories: Category[];
  brands: Brand[];
  units: Array<{ id: number; name: string; symbol: string }>;
  taxRates: Array<{ id: number; name: string; rate: number; is_default?: boolean }>;
  warehouses: Array<{ id: number; name: string; code?: string }>;
}

export const commonProductService = {
  async loadMasterData(): Promise<CommonFormDataMaster> {
    try {
      const [cats, brands, units, taxRates, warehouses] = await Promise.all([
        apiClient.get<Category[]>(Endpoints.CATEGORIES.LIST).catch(() => []),
        apiClient.get<Brand[]>(Endpoints.BRANDS.LIST).catch(() => []),
        apiClient.get<any[]>('/product-units').catch(() => [
          { id: 1, name: 'Piece', symbol: 'PCS' },
          { id: 2, name: 'Kilogram', symbol: 'KG' },
          { id: 3, name: 'Gram', symbol: 'GM' },
          { id: 4, name: 'Litre', symbol: 'LTR' },
          { id: 5, name: 'Packet', symbol: 'PKT' },
          { id: 6, name: 'Box', symbol: 'BOX' },
          { id: 7, name: 'Meter', symbol: 'METER' },
        ]),
        apiClient.get<any[]>('/tax-rates').catch(() => [
          { id: 1, name: '0% (Exempt)', rate: 0 },
          { id: 2, name: '5% GST', rate: 5 },
          { id: 3, name: '12% GST', rate: 12 },
          { id: 4, name: '18% GST', rate: 18, is_default: true },
          { id: 5, name: '28% GST', rate: 28 },
        ]),
        apiClient.get<any[]>('/warehouses').catch(() => [
          { id: 1, name: 'Main Store Warehouse', code: 'WH01' },
        ]),
      ]);

      return {
        categories: cats || [],
        brands: brands || [],
        units: units || [],
        taxRates: taxRates || [],
        warehouses: warehouses || [],
      };
    } catch (err) {
      console.warn('Error loading master data:', err);
      return {
        categories: [],
        brands: [],
        units: [{ id: 1, name: 'Piece', symbol: 'PCS' }],
        taxRates: [{ id: 1, name: '18% GST', rate: 18, is_default: true }],
        warehouses: [],
      };
    }
  },

  async getCategories(storeType?: string): Promise<Category[]> {
    try {
      const url = storeType ? `${Endpoints.CATEGORIES.LIST}?store_type=${storeType}` : Endpoints.CATEGORIES.LIST;
      const res = await apiClient.get<Category[]>(url);
      return res || [];
    } catch {
      return [];
    }
  },

  async getBrands(): Promise<Brand[]> {
    try {
      const res = await apiClient.get<Brand[]>(Endpoints.BRANDS.LIST);
      return res || [];
    } catch {
      return [];
    }
  },

  async getUnits(): Promise<any[]> {
    try {
      const res = await apiClient.get<any[]>('/product-units');
      return (res || []).map((u) => ({
        unitCode: u.symbol || u.code || u.unitCode,
        unitName: u.name || u.unitName,
        allowDecimal: u.allow_decimal ?? u.allowDecimal ?? true,
      }));
    } catch {
      return [
        { unitCode: 'PCS', unitName: 'Pieces / Nos', allowDecimal: false },
        { unitCode: 'KG', unitName: 'Kilograms (kg)', allowDecimal: true },
        { unitCode: 'GM', unitName: 'Grams (g)', allowDecimal: true },
        { unitCode: 'LTR', unitName: 'Litres (L)', allowDecimal: true },
        { unitCode: 'ML', unitName: 'Millilitres (ml)', allowDecimal: true },
        { unitCode: 'BOX', unitName: 'Box', allowDecimal: false },
        { unitCode: 'STRIP', unitName: 'Strip', allowDecimal: false },
        { unitCode: 'PKT', unitName: 'Packet', allowDecimal: false },
      ];
    }
  },

  async getUnitConversions(): Promise<UnitConversionRule[]> {
    try {
      const res = await apiClient.get<any[]>('/unit-conversions');
      return (res || []).map((r) => ({
        fromUnit: r.from_unit,
        toUnit: r.to_unit,
        multiplier: parseFloat(r.multiplier) || 1,
        description: r.description,
      }));
    } catch {
      return [];
    }
  },

  async createUnitConversion(rule: UnitConversionRule): Promise<void> {
    await apiClient.post('/unit-conversions', {
      from_unit: rule.fromUnit,
      to_unit: rule.toUnit,
      multiplier: rule.multiplier,
      description: rule.description,
    });
  },
};
