# Tulsi Mart – Product Management Flow

## 1. Overview
The Add & Edit Product module provides complete inventory and pricing configuration for all 8 retail categories.

---

## 2. Key Features

### Auto-Generated Product ID
- Generated server-side using the store's configured product prefix (`TM_PRD_0001`).
- Displayed as a read-only field in the frontend to maintain sequence integrity.

### Supplier Association
- Searchable dropdown using `SearchDropdown`.
- In-place "+ Quick Add Supplier" modal allows creating vendors without losing product form state.

### Purchase & Selling Prices
- Separate entry of **Purchase Price (Cost Price)** and **Selling Price (MRP / Retail Price)**.
- Profit margin percentage is computed live: $\text{Margin \%} = \frac{\text{Selling Price} - \text{Purchase Price}}{\text{Selling Price}} \times 100$.

### GST Tax Rates
- Supported tax slabs: 0% (Exempt), 5%, 12%, 18%, 28%.
- Applied seamlessly during POS billing and invoice generation.

### Unit Conversion
- Configurable **Purchase Unit** (e.g. BAG, BOX, DOZEN, CARTON) and **Selling Unit** (e.g. KG, PCS, GRAM, PACK).
- Conversion factor maps stock additions to retail units (e.g., 1 BAG = 50 KG).

### Stock & Expiry Alerts
- **Low Stock Alert**: Toggle switch with configurable minimum stock threshold. Dashboard alerts highlight items below this limit.
- **Batch & Expiry Alert**: Toggle switch with batch number and expiry date selection.
