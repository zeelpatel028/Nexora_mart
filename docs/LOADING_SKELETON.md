# Tulsi Mart – Loading Skeleton Architecture

## 1. Overview
Tulsi Mart replaces generic spinners with realistic shimmer skeletons that mimic the exact geometry of screens and cards, minimizing visual layout shift.

---

## 2. Skeleton Components (`components/skeletons/`)
- **`ProductCardSkeleton.tsx`**: Mimics product card with image thumbnail, title, price badge, and stock level pill.
- **`CustomerCardSkeleton.tsx`**: Mimics Khata customer card with avatar, name, phone, balance amount, and ledger link.
- **`SupplierCardSkeleton.tsx`**: Mimics vendor card with company avatar, phone, orders count, and payable balance.
- **`OrderCardSkeleton.tsx`**: Mimics purchase order cards with order number, supplier info, and status pill.
- **`InvoiceCardSkeleton.tsx`**: Mimics invoice history cards with invoice number, date, amount, and payment status.
- **`DashboardSkeleton.tsx`**: Mimics top metrics row, quick action buttons, and sales chart.
- **`TableSkeleton.tsx`**: Mimics multi-column tabular data for line items and ledger statements.
