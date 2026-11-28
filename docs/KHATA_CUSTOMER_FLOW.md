# Tulsi Mart – Customer Khata & Credit Management

## 1. Overview
The Khata module allows store owners to offer credit to trusted customers, track outstanding balances, record partial or full payments, and share professional ledger statements.

---

## 2. Dashboard Metrics
- **Total Khata Customers**: Count of customers registered for credit.
- **Pending Bills**: Count of unpaid and partially paid invoices.
- **Total Outstanding (To Receive)**: Cumulative balance across all customers.

---

## 3. Customer Ledger
Every credit purchase writes a `DEBIT` entry with the invoice reference.
Every payment received writes a `CREDIT` entry with the payment mode and notes.
The running balance is maintained transactionally.

---

## 4. Bill Filtering & Payment Settlement
The Customer Details screen allows filtering bills by:
- **All Bills**
- **Unpaid Bills**
- **Partially Paid Bills**
- **Paid Bills**

Store owners can tap "Receive Payment" to open the payment modal, input the received amount, choose the payment method (Cash, UPI, Bank, Cheque), and immediately update the ledger.

---

## 5. WhatsApp & Statement Sharing
Owners can tap "Statement" to generate a complete, formatted account statement and share it directly with the customer via WhatsApp or system share.
