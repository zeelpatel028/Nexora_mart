export const formatCurrency = (
  amount: number | string | null | undefined,
  symbol: string = '₹'
): string => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (num === null || num === undefined || isNaN(num)) {
    return `${symbol}0.00`;
  }
  return `${symbol}${num.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export default formatCurrency;
