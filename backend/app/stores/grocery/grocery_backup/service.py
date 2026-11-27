import json
import datetime
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from .models import GroceryBackup
from ..grocery_product.models import GroceryProduct
from ..grocery_supplier.models import GrocerySupplier
from ..grocery_khata_customer.models import GroceryCustomer
from ..grocery_purchase_order.models import GroceryPurchaseOrder
from ..grocery_billing.models import GroceryBill, GroceryBillItem
from ..grocery_prefix.models import GroceryPrefix, GroceryStorePrefix
from ..grocery_setting.models import GrocerySetting
from ..grocery_finance.models import GroceryExpense, GroceryPayment
from ....models.store import Store


class GroceryBackupService:
    @staticmethod
    def export_store_backup(db: Session, store: Store) -> dict:
        now_str = datetime.datetime.now(datetime.timezone.utc).isoformat()

        # 1. Products
        prods = db.query(GroceryProduct).filter(
            GroceryProduct.store_id == store.id,
            GroceryProduct.is_deleted == False
        ).all()
        prod_data = [
            {
                "product_code": p.product_code,
                "name": p.name,
                "supplier_id": p.supplier_id,
                "purchase_price_with_tax": p.purchase_price_with_tax,
                "purchase_gst_rate": p.purchase_gst_rate,
                "purchase_unit": p.purchase_unit,
                "selling_price_with_tax": p.selling_price_with_tax,
                "selling_unit": p.selling_unit,
                "selling_gst_rate": p.selling_gst_rate,
                "available_stock": p.available_stock,
                "low_stock_enabled": p.low_stock_enabled,
                "low_stock_qty": p.low_stock_qty,
                "expiry_alert_enabled": p.expiry_alert_enabled
            } for p in prods
        ]

        # 2. Suppliers
        supps = db.query(GrocerySupplier).filter(
            GrocerySupplier.store_id == store.id,
            GrocerySupplier.is_deleted == False
        ).all()
        supp_data = [
            {
                "supplier_code": s.supplier_code,
                "store_name": s.store_name,
                "seller_name": s.seller_name,
                "phone": s.phone,
                "email": s.email,
                "address": s.address,
                "gst_number": s.gst_number,
                "bank_name": s.bank_name,
                "account_holder": s.account_holder,
                "account_number": s.account_number,
                "ifsc": s.ifsc,
                "upi_id": s.upi_id
            } for s in supps
        ]

        # 3. Khata Customers
        custs = db.query(GroceryCustomer).filter(
            GroceryCustomer.store_id == store.id,
            GroceryCustomer.is_deleted == False
        ).all()
        cust_data = [
            {
                "customer_code": c.customer_code,
                "name": c.name,
                "phone": c.phone,
                "address": c.address
            } for c in custs
        ]

        # 4. Prefixes
        prefixes = db.query(GroceryPrefix).filter(
            GroceryPrefix.store_id == store.id,
            GroceryPrefix.is_deleted == False
        ).all()
        pfx_data = {p.key: p.prefix_value for p in prefixes}

        # 5. Settings
        st = db.query(GrocerySetting).filter(GrocerySetting.store_id == store.id).first()
        st_data = {
            "theme": st.theme if st else "system",
            "language": st.language if st else "en",
            "currency_code": st.currency_code if st else "INR",
            "currency_symbol": st.currency_symbol if st else "₹",
            "bill_template_id": st.bill_template_id if st else "modern_orange",
            "bill_sound_enabled": st.bill_sound_enabled if st else True,
            "bill_sound_id": st.bill_sound_id if st else "sound_gpay"
        }

        # 6. Expenses
        exps = db.query(GroceryExpense).filter(
            GroceryExpense.store_id == store.id,
            GroceryExpense.is_deleted == False
        ).all()
        exp_data = [
            {
                "expense_code": e.expense_code,
                "category": e.category,
                "amount": e.amount,
                "payment_method": e.payment_method,
                "description": e.description,
                "expense_date": str(e.expense_date),
            } for e in exps
        ]

        backup_payload = {
            "version": "1.1",
            "app": "Tulsi Mart",
            "store_type": "grocery",
            "exported_at": now_str,
            "store": {
                "id": store.id,
                "name": store.name,
                "phone": store.phone,
                "address": store.address
            },
            "prefixes": pfx_data,
            "settings": st_data,
            "products": prod_data,
            "suppliers": supp_data,
            "customers": cust_data,
            "expenses": exp_data,
        }

        raw_json = json.dumps(backup_payload)
        size_bytes = len(raw_json.encode("utf-8"))

        backup_record = GroceryBackup(
            store_id=store.id,
            user_id=store.user_id,
            file_url=f"/backups/backup_{store.id}_{int(datetime.datetime.now().timestamp())}.json",
            size=size_bytes
        )
        db.add(backup_record)
        db.commit()

        return {
            "success": True,
            "message": "Backup created successfully.",
            "backup_id": backup_record.id,
            "size_bytes": size_bytes,
            "data": backup_payload
        }

    @staticmethod
    def list_backups(db: Session, store_id: int) -> List[dict]:
        rows = db.query(GroceryBackup).filter(
            GroceryBackup.store_id == store_id
        ).order_by(GroceryBackup.created_at.desc()).all()

        return [
            {
                "id": r.id,
                "store_id": r.store_id,
                "file_url": r.file_url,
                "size": r.size,
                "created_at": str(r.created_at)
            } for r in rows
        ]

    @staticmethod
    def restore_store_backup(db: Session, store: Store, payload: dict) -> dict:
        data = payload.get("data") or payload.get("backup_data") or payload
        if not isinstance(data, dict):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid backup file payload format.")

        now = datetime.datetime.now(datetime.timezone.utc)

        # Restore Settings
        st_data = data.get("settings")
        if st_data and isinstance(st_data, dict):
            st = db.query(GrocerySetting).filter(GrocerySetting.store_id == store.id).first()
            if not st:
                st = GrocerySetting(store_id=store.id, user_id=store.user_id)
                db.add(st)
            st.user_id = store.user_id
            for k in ("theme", "language", "currency_code", "currency_symbol", "bill_template_id", "bill_sound_enabled", "bill_sound_id"):
                if k in st_data:
                    setattr(st, k, st_data[k])
            st.updated_at = now

        # Restore Prefixes
        pfx_data = data.get("prefixes")
        if pfx_data and isinstance(pfx_data, dict):
            from ..grocery_prefix.service import _sync_store_prefix_row
            for k, val in pfx_data.items():
                pfx = db.query(GroceryPrefix).filter(GroceryPrefix.store_id == store.id, GroceryPrefix.key == k).first()
                if pfx:
                    pfx.prefix_value = str(val).strip().upper()
                    pfx.user_id = store.user_id
                    pfx.updated_at = now
                else:
                    db.add(GroceryPrefix(store_id=store.id, user_id=store.user_id, key=k, prefix_value=str(val).strip().upper()))
            db.flush()
            _sync_store_prefix_row(db, store.id, store.user_id)

        db.commit()
        return {
            "success": True,
            "message": "Store backup restored successfully."
        }
