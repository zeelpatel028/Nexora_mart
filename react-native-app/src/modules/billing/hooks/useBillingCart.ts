import { useState, useMemo, useCallback } from 'react';
import { BillingCartItem } from '../types';
import { Product } from '../../../models/types';

export const useBillingCart = () => {
  const [cart, setCart] = useState<BillingCartItem[]>([]);
  const [billDiscount, setBillDiscount] = useState<number>(0);
  const [taxPercent, setTaxPercent] = useState<number>(0); // e.g. 0%, 5%, 12%, 18%

  const addToCart = useCallback((product: Product, quantity: number = 1) => {
    setCart((prev) => {
      const idx = prev.findIndex((item) => String(item.product_id) === String(product.id));
      const sp = Number(product.selling_price || product.pricing?.selling_price || 0);
      const stock = Number(product.current_stock ?? product.inventory_record?.current_stock ?? 9999);
      const unitStr = product.unit || 'pcs';

      if (idx >= 0) {
        const copy = [...prev];
        const current = copy[idx];
        const newQty = Math.max(1, current.quantity + quantity);
        const itemLineTotal = Math.max(0, (newQty * current.unit_price) - current.discount);
        copy[idx] = {
          ...current,
          quantity: newQty,
          total: Math.round(itemLineTotal * 100) / 100,
        };
        return copy;
      }

      const itemTotal = Math.max(0, (quantity * sp));
      return [
        ...prev,
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
    });
  }, []);

  const updateQuantity = useCallback((productId: string | number, qty: number) => {
    setCart((prev) => {
      if (qty <= 0) {
        return prev.filter((item) => String(item.product_id) !== String(productId));
      }
      return prev.map((item) => {
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
    });
  }, []);

  const updateUnitPrice = useCallback((productId: string | number, newPrice: number) => {
    setCart((prev) =>
      prev.map((item) => {
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
      })
    );
  }, []);

  const updateItemDiscount = useCallback((productId: string | number, discount: number) => {
    setCart((prev) =>
      prev.map((item) => {
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
      })
    );
  }, []);

  const removeFromCart = useCallback((productId: string | number) => {
    setCart((prev) => prev.filter((item) => String(item.product_id) !== String(productId)));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    setBillDiscount(0);
    setTaxPercent(0);
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

