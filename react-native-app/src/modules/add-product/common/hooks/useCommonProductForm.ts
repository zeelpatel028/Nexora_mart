import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  BaseProductBasicInfo,
  BaseProductPricingInfo,
  BaseProductInventoryInfo,
  BaseProductUnitInfo,
  StoreTypeCode,
  ProductUnitOption,
} from '../types';
import {
  DEFAULT_BASIC_INFO,
  DEFAULT_PRICING_INFO,
  DEFAULT_INVENTORY_INFO,
  DEFAULT_UNIT_INFO,
  DEFAULT_PRODUCT_UNITS,
  STORE_TYPE_SKU_PREFIXES,
} from '../constants';
import {
  validateCommonBasicInfo,
  validateCommonPricingInfo,
  validateCommonInventoryInfo,
} from '../validations';
import {
  calculateProfit,
  calculateMarginPercentage,
  calculateTaxAmount,
  calculateNetPrice,
} from '../utils/calculations';
import { generateProductSku } from '../utils/skuGenerator';
import { commonProductService } from '../services';
import { Category, Brand } from '../../../../models/types';

interface UseCommonProductFormOptions {
  storeType: StoreTypeCode;
  storeCode?: string;
  initialBasicInfo?: Partial<BaseProductBasicInfo>;
  initialPricingInfo?: Partial<BaseProductPricingInfo>;
  initialInventoryInfo?: Partial<BaseProductInventoryInfo>;
  initialUnitInfo?: Partial<BaseProductUnitInfo>;
}

export function useCommonProductForm({
  storeType,
  storeCode = 'STR001',
  initialBasicInfo = {},
  initialPricingInfo = {},
  initialInventoryInfo = {},
  initialUnitInfo = {},
}: UseCommonProductFormOptions) {
  // 1. Basic Info State
  const [basicInfo, setBasicInfo] = useState<BaseProductBasicInfo>(() => {
    const skuPrefix = STORE_TYPE_SKU_PREFIXES[storeType] || 'PRD';
    return {
      ...DEFAULT_BASIC_INFO,
      sku: generateProductSku(skuPrefix, storeCode),
      ...initialBasicInfo,
    };
  });

  // 2. Pricing Info State
  const [pricingInfo, setPricingInfo] = useState<BaseProductPricingInfo>(() => ({
    ...DEFAULT_PRICING_INFO,
    ...initialPricingInfo,
  }));

  // 3. Inventory Info State
  const [inventoryInfo, setInventoryInfo] = useState<BaseProductInventoryInfo>(() => ({
    ...DEFAULT_INVENTORY_INFO,
    ...initialInventoryInfo,
  }));

  // 4. Units Info State
  const [unitInfo, setUnitInfo] = useState<BaseProductUnitInfo>(() => ({
    ...DEFAULT_UNIT_INFO,
    ...initialUnitInfo,
  }));

  // 5. Master Data States
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [units, setUnits] = useState<ProductUnitOption[]>(DEFAULT_PRODUCT_UNITS);
  const [isLoadingMasterData, setIsLoadingMasterData] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // 6. Form Errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch Master Data
  useEffect(() => {
    let isMounted = true;
    const fetchMasterData = async () => {
      setIsLoadingMasterData(true);
      try {
        const [cats, brs, uList] = await Promise.all([
          commonProductService.getCategories(storeType),
          commonProductService.getBrands(),
          commonProductService.getUnits(),
        ]);
        if (isMounted) {
          if (cats && cats.length > 0) setCategories(cats);
          if (brs && brs.length > 0) setBrands(brs);
          if (uList && uList.length > 0) setUnits(uList);
        }
      } catch (err) {
        console.warn('Failed to load master data:', err);
      } finally {
        if (isMounted) setIsLoadingMasterData(false);
      }
    };

    fetchMasterData();
    return () => {
      isMounted = false;
    };
  }, [storeType]);

  // Update Handlers
  const updateBasicInfo = useCallback((updated: Partial<BaseProductBasicInfo>) => {
    setBasicInfo((prev) => ({ ...prev, ...updated }));
    setErrors((prev) => {
      const next = { ...prev };
      Object.keys(updated).forEach((k) => delete next[k]);
      return next;
    });
  }, []);

  const updatePricingInfo = useCallback((updated: Partial<BaseProductPricingInfo>) => {
    setPricingInfo((prev) => ({ ...prev, ...updated }));
    setErrors((prev) => {
      const next = { ...prev };
      Object.keys(updated).forEach((k) => delete next[k]);
      return next;
    });
  }, []);

  const updateInventoryInfo = useCallback((updated: Partial<BaseProductInventoryInfo>) => {
    setInventoryInfo((prev) => ({ ...prev, ...updated }));
    setErrors((prev) => {
      const next = { ...prev };
      Object.keys(updated).forEach((k) => delete next[k]);
      return next;
    });
  }, []);

  const updateUnitInfo = useCallback((updated: Partial<BaseProductUnitInfo>) => {
    setUnitInfo((prev) => ({ ...prev, ...updated }));
    setErrors((prev) => {
      const next = { ...prev };
      Object.keys(updated).forEach((k) => delete next[k]);
      return next;
    });
  }, []);

  // Live Calculations
  const calculations = useMemo(() => {
    const buyPrice = parseFloat(pricingInfo.purchasePrice) || 0;
    const sellPrice = parseFloat(pricingInfo.sellingPrice) || 0;
    const gstRate = pricingInfo.gstRate || 0;
    const isInclusive = pricingInfo.taxType === 'inclusive';

    const profit = calculateProfit(buyPrice, sellPrice);
    const margin = calculateMarginPercentage(buyPrice, sellPrice);
    const taxAmt = calculateTaxAmount(sellPrice, gstRate, isInclusive);
    const netPrice = calculateNetPrice(sellPrice, gstRate, isInclusive);

    return {
      profitAmount: profit,
      marginPercentage: margin,
      taxAmount: taxAmt,
      netPrice,
    };
  }, [pricingInfo.purchasePrice, pricingInfo.sellingPrice, pricingInfo.gstRate, pricingInfo.taxType]);

  // Validation
  const validateCommonForm = useCallback((): boolean => {
    const basicErrors = validateCommonBasicInfo(basicInfo);
    const pricingErrors = validateCommonPricingInfo(pricingInfo);
    const inventoryErrors = validateCommonInventoryInfo(inventoryInfo);

    const mergedErrors = {
      ...basicErrors,
      ...pricingErrors,
      ...inventoryErrors,
    };

    setErrors(mergedErrors);
    return Object.keys(mergedErrors).length === 0;
  }, [basicInfo, pricingInfo, inventoryInfo]);

  // Reset Form
  const resetForm = useCallback(() => {
    const skuPrefix = STORE_TYPE_SKU_PREFIXES[storeType] || 'PRD';
    setBasicInfo({
      ...DEFAULT_BASIC_INFO,
      sku: generateProductSku(skuPrefix, storeCode),
    });
    setPricingInfo(DEFAULT_PRICING_INFO);
    setInventoryInfo(DEFAULT_INVENTORY_INFO);
    setUnitInfo(DEFAULT_UNIT_INFO);
    setErrors({});
  }, [storeType, storeCode]);

  return {
    // States
    basicInfo,
    pricingInfo,
    inventoryInfo,
    unitInfo,
    errors,
    categories,
    brands,
    units,
    isLoadingMasterData,
    isSubmitting,
    setIsSubmitting,
    calculations,

    // Updaters
    updateBasicInfo,
    updatePricingInfo,
    updateInventoryInfo,
    updateUnitInfo,
    setErrors,

    // Helpers
    validateCommonForm,
    resetForm,
  };
}

