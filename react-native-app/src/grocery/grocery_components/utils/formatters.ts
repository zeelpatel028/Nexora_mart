/**
 * Display Formatters for Indian Currency (₹), Dates, Quantities, and Numbers
 */

/**
 * Formats a number with Indian currency grouping (e.g. 1,25,000.00)
 */
export const formatIndianNumber = (amount: number | string | undefined | null): string => {
  const num = Number(amount || 0);
  if (isNaN(num)) return '0.00';

  const parts = num.toFixed(2).split('.');
  let integerPart = parts[0];
  const decimalPart = parts[1];
  const isNegative = integerPart.startsWith('-');
  if (isNegative) integerPart = integerPart.slice(1);

  if (integerPart.length > 3) {
    const lastThree = integerPart.substring(integerPart.length - 3);
    const otherNumbers = integerPart.substring(0, integerPart.length - 3);
    const formatted = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree;
    return `${isNegative ? '-' : ''}${formatted}.${decimalPart}`;
  }
  return `${isNegative ? '-' : ''}${integerPart}.${decimalPart}`;
};

/**
 * Formats an amount in Indian Rupee currency (₹1,25,000.00)
 */
export const formatCurrency = (amount: number | string | undefined | null, symbol: string = '₹'): string => {
  const safeSymbol =
    !symbol || String(symbol).trim().toUpperCase() === 'INR'
      ? '₹'
      : String(symbol).trim().toUpperCase() === 'USD'
      ? '$'
      : String(symbol).trim().toUpperCase() === 'EUR'
      ? '€'
      : symbol;
  return `${safeSymbol}${formatIndianNumber(amount)}`;
};

export const formatDate = (dateString?: string | null): string => {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
};

export const formatDateTime = (dateString?: string | null): string => {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
};

export const formatQuantity = (qty: number | string | undefined | null, unit: string = 'pcs'): string => {
  const num = Number(qty || 0);
  const formatted = num % 1 === 0 ? num.toString() : num.toFixed(2);
  return `${formatted} ${unit}`;
};
