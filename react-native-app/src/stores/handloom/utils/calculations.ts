/**
 * Common Price, Profit Margin & Tax Calculation Utilities
 */

export interface ProfitMarginResult {
  profitAmount: number;
  marginPercentage: number;
  markupPercentage: number;
}

export function calculateProfitMargin(
  purchasePriceStr: string | number,
  sellingPriceStr: string | number
): ProfitMarginResult {
  const purchase = parseFloat(String(purchasePriceStr)) || 0;
  const selling = parseFloat(String(sellingPriceStr)) || 0;

  if (selling <= 0) {
    return { profitAmount: 0, marginPercentage: 0, markupPercentage: 0 };
  }

  const profit = selling - purchase;
  const margin = (profit / selling) * 100;
  const markup = purchase > 0 ? (profit / purchase) * 100 : 0;

  return {
    profitAmount: parseFloat(profit.toFixed(2)),
    marginPercentage: parseFloat(margin.toFixed(2)),
    markupPercentage: parseFloat(markup.toFixed(2)),
  };
}

export interface GstSplitResult {
  taxableValue: number;
  totalTax: number;
  cgst: number;
  sgst: number;
  igst: number;
  finalPrice: number;
}

export function calculateGst(
  price: number,
  gstRate: number,
  taxType: 'exclusive' | 'inclusive' | 'exempt' = 'exclusive',
  isInterState: boolean = false
): GstSplitResult {
  if (taxType === 'exempt' || gstRate <= 0) {
    return {
      taxableValue: price,
      totalTax: 0,
      cgst: 0,
      sgst: 0,
      igst: 0,
      finalPrice: price,
    };
  }

  if (taxType === 'inclusive') {
    const taxable = price / (1 + gstRate / 100);
    const tax = price - taxable;
    const cgst = isInterState ? 0 : tax / 2;
    const sgst = isInterState ? 0 : tax / 2;
    const igst = isInterState ? tax : 0;

    return {
      taxableValue: parseFloat(taxable.toFixed(2)),
      totalTax: parseFloat(tax.toFixed(2)),
      cgst: parseFloat(cgst.toFixed(2)),
      sgst: parseFloat(sgst.toFixed(2)),
      igst: parseFloat(igst.toFixed(2)),
      finalPrice: price,
    };
  }

  // Tax exclusive
  const tax = price * (gstRate / 100);
  const cgst = isInterState ? 0 : tax / 2;
  const sgst = isInterState ? 0 : tax / 2;
  const igst = isInterState ? tax : 0;

  return {
    taxableValue: price,
    totalTax: parseFloat(tax.toFixed(2)),
    cgst: parseFloat(cgst.toFixed(2)),
    sgst: parseFloat(sgst.toFixed(2)),
    igst: parseFloat(igst.toFixed(2)),
    finalPrice: parseFloat((price + tax).toFixed(2)),
  };
}

export function convertUnits(
  quantity: number,
  conversionRatio: number,
  toBaseUnit: boolean = true
): number {
  if (conversionRatio <= 0) {
    return quantity;
  }
  return toBaseUnit ? quantity * conversionRatio : quantity / conversionRatio;
}

export function calculateProfit(purchasePrice: number, sellingPrice: number): number {
  return parseFloat((sellingPrice - purchasePrice).toFixed(2));
}

export function calculateMarginPercentage(purchasePrice: number, sellingPrice: number): number {
  if (sellingPrice <= 0) return 0;
  return parseFloat((((sellingPrice - purchasePrice) / sellingPrice) * 100).toFixed(2));
}

export function calculateTaxAmount(price: number, gstRate: number, isInclusive: boolean = false): number {
  if (gstRate <= 0) return 0;
  if (isInclusive) {
    const taxable = price / (1 + gstRate / 100);
    return parseFloat((price - taxable).toFixed(2));
  }
  return parseFloat((price * (gstRate / 100)).toFixed(2));
}

export function calculateNetPrice(price: number, gstRate: number, isInclusive: boolean = false): number {
  if (gstRate <= 0) return price;
  if (isInclusive) return price;
  return parseFloat((price + price * (gstRate / 100)).toFixed(2));
}

