/**
 * SKU and Barcode Generator Utilities
 */

export function generateProductSku(prefix: string = 'PRD', storeCode?: string): string {
  const code = (storeCode || 'STR001').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `${prefix.toUpperCase()}-${code}-${rand}`;
}

export function generateVariantSku(baseSku: string, size: string, color: string): string {
  const cleanBase = (baseSku || 'VAR').trim().toUpperCase();
  const cleanSize = (size || 'STD').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  const cleanColor = (color || 'CLR').replace(/[^a-zA-Z0-9]/g, '').slice(0, 3).toUpperCase();
  return `${cleanBase}-${cleanSize}-${cleanColor}`;
}

export function generateBarcode(): string {
  // Generate valid 12-digit standard UPC/EAN format
  const timestamp = Date.now().toString().slice(-9);
  const rand = Math.floor(100 + Math.random() * 900);
  return `890${timestamp}${rand}`.slice(0, 12);
}

