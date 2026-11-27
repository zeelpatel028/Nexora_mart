import { useState, useEffect } from 'react';
import localStorage from '../services/localStorage';

export const useCurrency = () => {
  const [currency, setCurrencyState] = useState<string>('INR');
  const [symbol, setSymbolState] = useState<string>('₹');

  useEffect(() => {
    localStorage.get('tulsimart_currency', 'INR').then((curr) => {
      setCurrencyState(curr);
      if (curr === 'USD') setSymbolState('$');
      else if (curr === 'EUR') setSymbolState('€');
      else setSymbolState('₹');
    });
  }, []);

  const setCurrency = async (newCurr: string) => {
    setCurrencyState(newCurr);
    let s = '₹';
    if (newCurr === 'USD') s = '$';
    else if (newCurr === 'EUR') s = '€';
    setSymbolState(s);
    await localStorage.set('tulsimart_currency', newCurr);
  };

  const format = (amount: number | null | undefined): string => {
    if (amount === null || amount === undefined || isNaN(amount)) return `${symbol}0.00`;
    return `${symbol}${amount.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return { currency, symbol, setCurrency, format };
};

export default useCurrency;
