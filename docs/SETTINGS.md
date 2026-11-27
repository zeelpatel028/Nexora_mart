# Tulsi Mart – Shop Settings & Data Security

## 1. Overview
The Settings module allows complete customization of store appearance, regional localization, audio feedback, document prefixing, and data backups.

---

## 2. Settings Sections

### 1. Theme & Appearance
- **Light Theme**: Clean, high-contrast daylight mode.
- **Dark Theme**: Battery-efficient dark palette.
- **System Theme**: Automatically matches device OS dark/light mode.

### 2. Regional & Currency
- **Languages**: English, Hindi (हिंदी), Gujarati (ગુજરાતી).
- **Currencies**: INR (₹ - Indian Rupee), USD ($), EUR (€).

### 3. Audio Feedback
- Toggle for sound chime on bill completion.
- Interactive "Test Sound" button.

### 4. Invoice Template
- Switch between **Modern Orange**, **Classic Clean**, and **Compact POS Thermal (3-inch)** templates with instant visual preview modal.

### 5. Store Document Prefixes
Configure custom prefixes for all 10 document types:
- `invoice_prefix` (`TM_INV_`)
- `debit_customer_prefix` (`TM_DC_`)
- `walk_in_customer_prefix` (`TM_WC_`)
- `supplier_prefix` (`TM_SUP_`)
- `order_prefix` (`TM_ORD_`)
- `product_prefix` (`TM_PRD_`)
- `employee_prefix` (`TM_EMP_`)
- `return_prefix` (`TM_RET_`)
- `refund_prefix` (`TM_REF_`)
- `expense_prefix` (`TM_EXP_`)

### 6. Store Backup & Restore
- **Create Backup**: Downloads/shares a complete JSON dump of store catalogs, customers, suppliers, and transaction records.
- **Restore Backup**: Modal to paste or upload JSON backup and safely restore data with transaction rollback guarantees.
