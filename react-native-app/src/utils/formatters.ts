/**
 * Display Formatters for Currency, Dates, Quantities, and Status
 */
export const formatCurrency = (amount: number | string | undefined | null, symbol: string = '$'): string => {
  const num = Number(amount || 0);
  return `${symbol}${num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
};

export const formatDate = (dateString?: string | null): string => {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString(undefined, {
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
    return d.toLocaleString(undefined, {
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

