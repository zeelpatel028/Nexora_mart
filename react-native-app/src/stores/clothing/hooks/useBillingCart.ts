import { useState, useMemo, useCallback, useEffect } from 'react';
import { BillingCartItem } from '../utils/billingTypes';
import { Product } from '../../../api/types';

// Persistent shared state across tab navigation / unmounts
let sharedCart: BillingCartItem[] = [];
let sharedBillDiscount: number = 0;
let sharedTaxPercent: number = 0;
const cartListeners = new Set<() => void>();

const broadcastChange = () => {
  cartListeners.forEach((fn) => fn());
};

export const useBillingCart = () => {
  const [cart, setCart] = useState<BillingCartItem[]>(sharedCart);
  const [billDiscount, setBillDiscountState] = useState<number>(sharedBillDiscount);
  const [taxPercent, setTaxPercentState] = useState<number>(sharedTaxPercent);

  useEffect(() => {
    const sync = () => {
      setCart([...sharedCart]);
      setBillDiscountState(sharedBillDiscount);
      setTaxPercentState(sharedTaxPercent);
    };
    cartListeners.add(sync);
    return () => {
      cartListeners.delete(sync);
    };
  }, []);

  const setBillDiscount = useCallback((discount: number) => {
    sharedBillDiscount = discount;
    setBillDiscountState(discount);
    broadcastChange();
  }, []);

  const setTaxPercent = useCallback((tax: number) => {
    sharedTaxPercent = tax;
    setTaxPercentState(tax);
    broadcastChange();
  }, []);

  const addToCart = useCallback((product: Product, quantity: number = 1) => {
    const idx = sharedCart.findIndex((item) => String(item.product_id) === String(product.id));
    const sp = Number(product.selling_price || product.pricing?.selling_price || 0);
    const stock = Number(product.current_stock ?? product.inventory_record?.current_stock ?? 9999);
    const unitStr = product.unit || 'pcs';

    if (idx >= 0) {
      const copy = [...sharedCart];
      const current = copy[idx];
      const newQty = Math.max(1, current.quantity + quantity);
      const itemLineTotal = Math.max(0, (newQty * current.unit_price) - current.discount);
      copy[idx] = {
        ...current,
        quantity: newQty,
        total: Math.round(itemLineTotal * 100) / 100,
      };
      sharedCart = copy;
    } else {
      const itemTotal = Math.max(0, (quantity * sp));
      sharedCart = [
        ...sharedCart,
        {
          product_id: product.id,
          name: product.product_name || product.name,
          sku: product.sku || '',
          barcode: product.barcode || '',
          unit: unitStr,
          unit_price: sp,
          original_price: sp,
          quantity: quantity,
          discount: 0,
          available_stock: stock,
          total: Math.round(itemTotal * 100) / 100,
        },
      ];
    }
    setCart([...sharedCart]);
    broadcastChange();
  }, []);

  const updateQuantity = useCallback((productId: string | number, qty: number) => {
    if (qty <= 0) {
      sharedCart = sharedCart.filter((item) => String(item.product_id) !== String(productId));
    } else {
      sharedCart = sharedCart.map((item) => {
        if (String(item.product_id) === String(productId)) {
          const itemTotal = Math.max(0, (qty * item.unit_price) - item.discount);
          return {
            ...item,
            quantity: qty,
            total: Math.round(itemTotal * 100) / 100,
          };
        }
        return item;
      });
    }
    setCart([...sharedCart]);
    broadcastChange();
  }, []);

  const updateUnitPrice = useCallback((productId: string | number, newPrice: number) => {
    sharedCart = sharedCart.map((item) => {
      if (String(item.product_id) === String(productId)) {
        const p = Math.max(0, newPrice);
        const itemTotal = Math.max(0, (item.quantity * p) - item.discount);
        return {
          ...item,
          unit_price: p,
          total: Math.round(itemTotal * 100) / 100,
        };
      }
      return item;
    });
    setCart([...sharedCart]);
    broadcastChange();
  }, []);

  const updateItemDiscount = useCallback((productId: string | number, discount: number) => {
    sharedCart = sharedCart.map((item) => {
      if (String(item.product_id) === String(productId)) {
        const d = Math.max(0, discount);
        const itemTotal = Math.max(0, (item.quantity * item.unit_price) - d);
        return {
          ...item,
          discount: d,
          total: Math.round(itemTotal * 100) / 100,
        };
      }
      return item;
    });
    setCart([...sharedCart]);
    broadcastChange();
  }, []);

  const removeFromCart = useCallback((productId: string | number) => {
    sharedCart = sharedCart.filter((item) => String(item.product_id) !== String(productId));
    setCart([...sharedCart]);
    broadcastChange();
  }, []);

  const clearCart = useCallback(() => {
    sharedCart = [];
    sharedBillDiscount = 0;
    sharedTaxPercent = 0;
    setCart([]);
    setBillDiscountState(0);
    setTaxPercentState(0);
    broadcastChange();
  }, []);

  // Totals calculations
  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.total, 0);
  }, [cart]);

  const totalItemsCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  const taxAmount = useMemo(() => {
    if (taxPercent <= 0) return 0;
    const taxable = Math.max(0, subtotal - billDiscount);
    return Math.round((taxable * (taxPercent / 100)) * 100) / 100;
  }, [subtotal, billDiscount, taxPercent]);

  const grandTotal = useMemo(() => {
    const total = subtotal - billDiscount + taxAmount;
    return Math.max(0, Math.round(total * 100) / 100);
  }, [subtotal, billDiscount, taxAmount]);

  return {
    cart,
    addToCart,
    updateQuantity,
    updateUnitPrice,
    updateItemDiscount,
    removeFromCart,
    clearCart,
    subtotal,
    billDiscount,
    setBillDiscount,
    taxPercent,
    setTaxPercent,
    taxAmount,
    grandTotal,
    totalItemsCount,
  };
};

