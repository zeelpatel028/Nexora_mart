# Tulsi Mart – Billing & POS Flow

## 1. POS Terminal & Make Bill
The POS module provides fast, keyboard-friendly checkout and invoicing for retail stores.

---

## 2. Walk-in vs Khata Customer
1. **Walk-in Customer**: Cash/UPI retail customer where customer details are optional.
2. **Khata (Debit) Customer**: Account customer with credit privileges. Shows running balance, warns on credit limit breaches, and logs an automatic debit in `customer_ledger`.

---

## 3. Dynamic Line Items & Price Isolation
- Cashiers can add multiple products to the bill.
- Selling prices and quantities can be adjusted directly in the bill row for discounts or custom pricing without altering the master catalog selling price.

---

## 4. GST Inclusive Calculations
All retail prices are handled with inclusive GST standards:
$$\text{Taxable Amount} = \frac{\text{Selling Price}}{1 + \frac{\text{GST Rate}}{100}}$$
$$\text{GST Amount} = \text{Selling Price} - \text{Taxable Amount}$$

GST is split into Central GST (CGST) and State GST (SGST) in a 50/50 ratio:
$$\text{CGST} = \frac{\text{GST Amount}}{2}, \quad \text{SGST} = \frac{\text{GST Amount}}{2}$$

---

## 5. Stock Decrement & Sound Notification
- Generating a bill atomically decrements current stock across the selected products.
- If sound is enabled in Settings, a cash register chime is played upon successful bill creation.
