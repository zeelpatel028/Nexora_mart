import { ProductVariantItem } from '../types';
import { generateVariantSku } from './skuGenerator';

/**
 * Generates Cartesian product combinations for sizes and colors safely.
 * Preserves previously entered stock, purchase price, selling price, and barcodes!
 */
export function generateVariantCombinations(
  sizes: string[],
  colors: string[],
  baseSku: string,
  defaultPurchasePrice: string = '0',
  defaultSellingPrice: string = '0',
  defaultMrp: string = '',
  existingVariants: ProductVariantItem[] = []
): ProductVariantItem[] {
  if (!sizes.length && !colors.length) {
    return [];
  }

  const effectiveSizes = sizes.length ? sizes : ['Standard'];
  const effectiveColors = colors.length ? colors : ['Standard'];

  // Map existing by size_color key
  const existingMap = new Map<string, ProductVariantItem>();
  for (const v of existingVariants) {
    const key = `${v.size.trim().toLowerCase()}_${v.color.trim().toLowerCase()}`;
    existingMap.set(key, v);
  }

  const result: ProductVariantItem[] = [];

  for (const size of effectiveSizes) {
    for (const color of effectiveColors) {
      const key = `${size.trim().toLowerCase()}_${color.trim().toLowerCase()}`;
      const existing = existingMap.get(key);

      if (existing) {
        result.push({
          ...existing,
          size,
          color,
        });
      } else {
        const vSku = generateVariantSku(baseSku, size, color);
        result.push({
          id: `var_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          size,
          color,
          sku: vSku,
          barcode: '',
          stock_quantity: '0',
          purchase_price: defaultPurchasePrice,
          selling_price: defaultSellingPrice,
          mrp: defaultMrp,
          wholesale_price: '',
          min_stock_alert: '3',
          is_active: true,
        });
      }
    }
  }

  return result;
}

export const generateVariantMatrix = generateVariantCombinations;

