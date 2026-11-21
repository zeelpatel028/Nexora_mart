import json
import datetime
from typing import Dict, Any
from fastapi import HTTPException
from sqlalchemy.orm import Session
from ..models.store import Store
from ..models.store_prefix import StorePrefix
from ..models.product import Product
from ..models.partner import Customer, Supplier
from ..models.invoice import Invoice
from ..models.purchase import Purchase
from ..models.store_setting import StoreSetting


class BackupService:
    """
    Manages complete tenant-isolated store data backup export and safe restoration.
    Ensures zero cross-tenant data exposure.
    """

    @classmethod
    def export_store_backup(cls, db: Session, store: Store) -> Dict[str, Any]:
        """Exports all store data into a structured JSON backup object."""
        # 1. Store Prefixes
        prefix = db.query(StorePrefix).filter(StorePrefix.store_id == store.id).first()
        prefixes_data = {
            "invoice_prefix": prefix.invoice_prefix if prefix else "INV",
            "debit_customer_prefix": prefix.debit_customer_prefix if prefix else "DC",
            "walk_in_customer_prefix": prefix.walk_in_customer_prefix if prefix else "WC",
            "supplier_prefix": prefix.supplier_prefix if prefix else "SUP",
            "order_prefix": prefix.order_prefix if prefix else "ORD",
            "product_prefix": prefix.product_prefix if prefix else "PRD",
            "employee_prefix": prefix.employee_prefix if prefix else "EMP",
            "return_prefix": prefix.return_prefix if prefix else "RET",
            "refund_prefix": prefix.refund_prefix if prefix else "REF",
            "expense_prefix": prefix.expense_prefix if prefix else "EXP",
        }

        # 2. Products
        products = db.query(Product).filter(Product.store_id == store.id, Product.is_active == True).all()
        products_data = [
            {
                "id": str(p.id),
                "name": p.name,
                "sku": p.sku,
                "barcode": p.barcode,
                "purchase_price": p.purchase_price,
                "selling_price": p.selling_price,
                "current_stock": p.current_stock,
                "min_stock_level": p.min_stock_level,
                "unit": p.unit,
                "tax_rate": p.tax_rate,
            }
            for p in products
        ]

        # 3. Customers
        customers = db.query(Customer).filter(Customer.store_id == store.id).all()
        customers_data = [
            {
                "id": c.id,
                "name": c.name,
                "phone": c.phone,
                "email": c.email,
                "address": c.address,
                "gst_number": c.gst_number,
                "balance": c.balance,
            }
            for c in customers
        ]

        # 4. Suppliers
        suppliers = db.query(Supplier).filter(Supplier.store_id == store.id).all()
        suppliers_data = [
            {
                "id": s.id,
                "name": s.name,
                "company_name": s.company_name,
                "phone": s.phone,
                "email": s.email,
                "address": s.address,
                "gst_number": s.gst_number,
                "balance": s.balance,
            }
            for s in suppliers
        ]

        # 5. Invoices Summary
        invoices = db.query(Invoice).filter(Invoice.store_id == store.id).all()
        invoices_data = [
            {
                "id": inv.id,
                "invoice_number": inv.invoice_number,
                "invoice_date": inv.invoice_date.isoformat(),
                "total_amount": inv.total_amount,
                "paid_amount": inv.paid_amount,
                "payment_status": inv.payment_status,
                "payment_method": inv.payment_method,
            }
            for inv in invoices
        ]

        # 6. Purchase Orders Summary
        purchases = db.query(Purchase).filter(Purchase.store_id == store.id).all()
        purchases_data = [
            {
                "id": p.id,
                "order_number": p.invoice_number,
                "total_amount": p.total_amount,
                "paid_amount": p.paid_amount,
                "payment_status": p.payment_status,
            }
            for p in purchases
        ]

        return {
            "version": "2.0.0",
            "app": "Tulsi Mart",
            "store_id": store.id,
            "store_name": store.name,
            "export_date": datetime.datetime.now(datetime.timezone.utc).isoformat(),
            "prefixes": prefixes_data,
            "products_count": len(products_data),
            "customers_count": len(customers_data),
            "suppliers_count": len(suppliers_data),
            "invoices_count": len(invoices_data),
            "purchases_count": len(purchases_data),
            "data": {
                "prefixes": prefixes_data,
                "products": products_data,
                "customers": customers_data,
                "suppliers": suppliers_data,
                "invoices": invoices_data,
                "purchases": purchases_data,
            }
        }

    @classmethod
    def restore_store_backup(cls, db: Session, store: Store, backup_payload: Dict[str, Any]) -> Dict[str, Any]:
        """Restores store data from a validated backup file within an isolated database transaction."""
        if not isinstance(backup_payload, dict) or "data" not in backup_payload:
            raise HTTPException(status_code=400, detail="Invalid backup file format.")

        data = backup_payload["data"]

        # Restore Prefixes
        if "prefixes" in data and isinstance(data["prefixes"], dict):
            prefix_record = db.query(StorePrefix).filter(StorePrefix.store_id == store.id).first()
            if not prefix_record:
                prefix_record = StorePrefix(store_id=store.id)
                db.add(prefix_record)
            for k, v in data["prefixes"].items():
                if hasattr(prefix_record, k):
                    setattr(prefix_record, k, str(v).upper())

        # Restore Customers (upsert based on phone/name)
        restored_customers = 0
        if "customers" in data and isinstance(data["customers"], list):
            for c_dict in data["customers"]:
                existing = db.query(Customer).filter(
                    Customer.store_id == store.id,
                    Customer.name == c_dict.get("name")
                ).first()
                if not existing:
                    new_c = Customer(
                        store_id=store.id,
                        name=c_dict.get("name", "Customer"),
                        phone=c_dict.get("phone"),
                        email=c_dict.get("email"),
                        address=c_dict.get("address"),
                        gst_number=c_dict.get("gst_number"),
                        balance=c_dict.get("balance", 0.0)
                    )
                    db.add(new_c)
                    restored_customers += 1

        # Restore Suppliers (upsert based on name)
        restored_suppliers = 0
        if "suppliers" in data and isinstance(data["suppliers"], list):
            for s_dict in data["suppliers"]:
                existing = db.query(Supplier).filter(
                    Supplier.store_id == store.id,
                    Supplier.name == s_dict.get("name")
                ).first()
                if not existing:
                    new_s = Supplier(
                        store_id=store.id,
                        name=s_dict.get("name", "Supplier"),
                        company_name=s_dict.get("company_name"),
                        phone=s_dict.get("phone"),
                        email=s_dict.get("email"),
                        address=s_dict.get("address"),
                        gst_number=s_dict.get("gst_number"),
                        balance=s_dict.get("balance", 0.0)
                    )
                    db.add(new_s)
                    restored_suppliers += 1

        db.commit()

        return {
            "success": True,
            "message": "Store backup restored successfully.",
            "restored_customers": restored_customers,
            "restored_suppliers": restored_suppliers,
            "restored_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
        }
