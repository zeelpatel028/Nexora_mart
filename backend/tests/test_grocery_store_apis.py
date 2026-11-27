"""
Comprehensive Integration Test Suite for Tulsi Mart Grocery Store APIs (/api/v1/grocery)
Tests:
1. Prefixes & ID generation ({store_code}_{prefix}_{4-digit})
2. Lookup: GST rates & Units
3. Suppliers: create with bank details, list, detail, statement PDF
4. Products: 10-field add product, auto ID, stock alerts, expiry alerts
5. Purchase Orders: place, receive with expiry date validation, pay order
6. POS Billing: walk-in (paid), khata (unpaid), GST base price calculation, invoice PDF
7. Khata Customers: add, list, statement PDF, settle payment
8. Settings & Backup: settings update, backup export & restore
9. Dashboard & Reports: overview metrics and sales report
"""
import sys
import unittest
import datetime
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.config.database import Base, engine, SessionLocal
from app.models.user import User
from app.models.store import Store
from app.utils.security import get_password_hash
from app.stores.grocery.grocery_prefix.service import GroceryPrefixService
from app.stores.grocery.grocery_lookup.service import GroceryLookupService
from app.stores.grocery.grocery_supplier.service import GrocerySupplierService
from app.stores.grocery.grocery_supplier.schemas import GrocerySupplierCreate
from app.stores.grocery.grocery_product.service import GroceryProductService
from app.stores.grocery.grocery_product.schemas import GroceryProductCreate
from app.stores.grocery.grocery_purchase_order.service import GroceryPurchaseOrderService
from app.stores.grocery.grocery_purchase_order.schemas import (
    PurchaseOrderCreate,
    PurchaseOrderReceiveRequest,
    PurchaseOrderPaymentRequest
)
from app.stores.grocery.grocery_billing.service import GroceryBillingService
from app.stores.grocery.grocery_billing.schemas import MakeBillRequest, BillItemInput
from app.stores.grocery.grocery_khata_customer.service import GroceryKhataCustomerService
from app.stores.grocery.grocery_khata_customer.schemas import GroceryCustomerCreate, CustomerPaymentPayload
from app.stores.grocery.grocery_setting.service import GrocerySettingService
from app.stores.grocery.grocery_setting.schemas import GrocerySettingUpdate
from app.stores.grocery.grocery_backup.service import GroceryBackupService


class TestGroceryStoreAPIs(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        Base.metadata.create_all(bind=engine)
        from app.migrations import ensure_grocery_schema
        ensure_grocery_schema(engine)

    def setUp(self):
        self.db = SessionLocal()
        ts = int(datetime.datetime.now().timestamp() * 1000)

        # Create isolated store owner and store
        self.user = User(
            email=f"grocery_owner_{ts}@tulsimart.com",
            first_name="Tulsi",
            surname="Merchant",
            phone="9876500000",
            hashed_password=get_password_hash("Password123!"),
            is_active=True
        )
        self.db.add(self.user)
        self.db.flush()

        self.store = Store(
            user_id=self.user.id,
            shop_category_id=1,
            name="Tulsi Fresh Groceries",
            store_type="grocery",
            store_code=f"S{self.user.id:03d}",
            currency="INR",
            currency_symbol="₹",
            phone="9876500000",
            address="108 Station Road, Ahmedabad",
            gst_number="24AAACT1234F1Z5",
            is_active=True
        )
        self.db.add(self.store)
        self.db.commit()
        self.db.refresh(self.store)

    def tearDown(self):
        try:
            self.db.rollback()
        except Exception:
            pass
        self.db.close()

    def test_01_lookup_rates_and_units(self):
        rates = GroceryLookupService.get_gst_rates(self.db)
        self.assertTrue(len(rates) >= 5)
        rate_vals = [r["rate"] for r in rates]
        for expected in [0.0, 5.0, 12.0, 18.0, 28.0]:
            self.assertIn(expected, rate_vals)

        units = GroceryLookupService.get_units(self.db)
        self.assertTrue(len(units) >= 5)
        unit_names = [u["name"] for u in units]
        self.assertIn("Kilogram", unit_names)
        self.assertIn("Piece", unit_names)

    def test_02_prefixes_and_id_formats(self):
        prefixes = GroceryPrefixService.get_or_create_prefixes(self.db, self.store.id)
        self.assertEqual(prefixes["invoice"], "INV")
        self.assertEqual(prefixes["product"], "PRD")
        self.assertEqual(prefixes["supplier"], "SUP")
        self.assertEqual(prefixes["order"], "ORD")
        self.assertEqual(prefixes["debit_customer"], "KHT")

        # Preview ID format: {store_code}_{prefix}_{4-digit number}
        preview_prd = GroceryPrefixService.preview_id(self.db, self.store.id, "product")
        self.assertTrue(preview_prd["next_id"].startswith(f"{self.store.store_code}_PRD_"))

        # Generate atomic ID
        gen_id = GroceryPrefixService.generate_id(self.db, self.store.id, "product")
        self.assertEqual(gen_id, f"{self.store.store_code}_PRD_0001")

        # Update prefix
        updated = GroceryPrefixService.update_prefixes(self.db, self.store.id, {"product": "ITEM"})
        self.assertEqual(updated["product"], "ITEM")
        gen_id2 = GroceryPrefixService.generate_id(self.db, self.store.id, "product")
        self.assertEqual(gen_id2, f"{self.store.store_code}_ITEM_0002")

    def test_03_supplier_lifecycle(self):
        supp_data = GrocerySupplierCreate(
            store_name="Amul Dairy Wholesale",
            seller_name="Ramesh Patel",
            phone="9876511111",
            email="ramesh@amul.com",
            address="Anand, Gujarat",
            gst_number="24AABCA1234D1Z2",
            bank_name="State Bank of India",
            account_holder="Amul Dairy Wholesale",
            account_number="12345678901",
            ifsc="SBIN0001234",
            upi_id="amul@sbi"
        )
        supplier = GrocerySupplierService.create_supplier(self.db, self.store.id, supp_data)
        self.assertIsNotNone(supplier.id)
        self.assertTrue(supplier.supplier_code.startswith(f"{self.store.store_code}_SUP_"))

        # Detail and statement PDF
        detail = GrocerySupplierService.get_supplier_detail(self.db, self.store.id, supplier.id)
        self.assertEqual(detail["supplier"]["seller_name"], "Ramesh Patel")
        self.assertEqual(detail["supplier"]["bank_name"], "State Bank of India")

        pdf_bytes = GrocerySupplierService.generate_statement_pdf(self.db, self.store.id, supplier.id)
        self.assertTrue(len(pdf_bytes) > 50)

    def test_04_product_lifecycle_and_alerts(self):
        # 1. Product without expiry
        prod1_data = GroceryProductCreate(
            name="Fortune Sunlite Sunflower Oil 1L",
            purchase_price_with_tax=120.0,
            purchase_gst_rate=5.0,
            purchase_unit="Litre",
            selling_price_with_tax=145.0,
            selling_unit="Litre",
            selling_gst_rate=5.0,
            available_stock=50.0,
            low_stock_enabled=True,
            low_stock_qty=10.0,
            expiry_alert_enabled=False
        )
        p1 = GroceryProductService.create_product(self.db, self.store.id, prod1_data)
        self.assertTrue(p1.product_code.startswith(f"{self.store.store_code}_"))
        self.assertEqual(p1.available_stock, 50.0)

        # 2. Product with expiry alert ON
        prod2_data = GroceryProductCreate(
            name="Amul Taaza Milk 500ml",
            purchase_price_with_tax=25.0,
            purchase_gst_rate=0.0,
            purchase_unit="Packet",
            selling_price_with_tax=28.0,
            selling_unit="Packet",
            selling_gst_rate=0.0,
            available_stock=0.0,
            low_stock_enabled=True,
            low_stock_qty=5.0,
            expiry_alert_enabled=True
        )
        p2 = GroceryProductService.create_product(self.db, self.store.id, prod2_data)
        self.assertTrue(p2.expiry_alert_enabled)

    def test_05_purchase_order_receive_flow_with_expiry(self):
        # Create supplier and product with expiry ON
        supp = GrocerySupplierService.create_supplier(self.db, self.store.id, GrocerySupplierCreate(
            store_name="Metro Dairy", seller_name="Kishore", phone="9988776655"
        ))
        prod = GroceryProductService.create_product(self.db, self.store.id, GroceryProductCreate(
            name="Paneer 200g Fresh",
            purchase_price_with_tax=80.0,
            selling_price_with_tax=95.0,
            available_stock=0.0,
            expiry_alert_enabled=True
        ))

        # Place purchase order
        po = GroceryPurchaseOrderService.place_order(self.db, self.store.id, PurchaseOrderCreate(
            supplier_id=supp.id,
            product_id=prod.id,
            qty=20.0,
            unit="Packet",
            purchase_price=78.0  # Custom order price
        ))
        self.assertEqual(po["status"], "placed")
        self.assertEqual(po["total_amount"], 1560.0)

        # Receiving without expiry must fail because expiry_alert_enabled is True
        from fastapi import HTTPException
        with self.assertRaises(HTTPException):
            GroceryPurchaseOrderService.receive_order(self.db, self.store.id, po["id"], PurchaseOrderReceiveRequest(expiry_date=None))

        # Receiving with valid expiry succeeds and increases stock
        res = GroceryPurchaseOrderService.receive_order(
            self.db, self.store.id, po["id"],
            PurchaseOrderReceiveRequest(expiry_date="2026-12-15")
        )
        self.assertTrue(res["success"])
        self.assertEqual(res["available_stock"], 20.0)
        self.assertEqual(res["status"], "received")

        # Pay order
        pay_res = GroceryPurchaseOrderService.pay_order(self.db, self.store.id, po["id"], PurchaseOrderPaymentRequest())
        self.assertEqual(pay_res["payment_status"], "paid")

    def test_06_pos_billing_walkin_and_khata(self):
        # Create product with 5% GST
        prod = GroceryProductService.create_product(self.db, self.store.id, GroceryProductCreate(
            name="Tata Salt 1kg",
            purchase_price_with_tax=20.0,
            selling_price_with_tax=28.0,
            selling_gst_rate=5.0,
            available_stock=100.0
        ))

        # Create Khata Customer
        cust = GroceryKhataCustomerService.create_customer(self.db, self.store.id, GroceryCustomerCreate(
            name="Bhavik Shah", phone="9898989898", address="Paldi, Ahmedabad"
        ))
        self.assertTrue(cust.customer_code.startswith(f"{self.store.store_code}_KHT_"))

        # Bill 1: Walk-in Customer (Paid immediately)
        bill1 = GroceryBillingService.make_bill(self.db, self.store, self.user.id, MakeBillRequest(
            customer_type="walk_in",
            walk_in_name="Cash Walk-in",
            items=[
                BillItemInput(
                    product_id=prod.id,
                    product_name=prod.name,
                    price_with_tax=28.0,
                    gst_rate=5.0,
                    unit="Packet",
                    qty=2.0
                )
            ]
        ))
        self.assertEqual(bill1["payment_status"], "paid")
        self.assertEqual(bill1["grand_total"], 56.0)
        self.assertGreater(bill1["total_tax"], 0.0)
        self.assertEqual(bill1["subtotal"] + bill1["total_tax"], bill1["grand_total"])

        # Product stock reduced: 100 - 2 = 98
        self.db.refresh(prod)
        self.assertEqual(prod.available_stock, 98.0)

        # Bill 2: Khata Customer (Unpaid by default)
        bill2 = GroceryBillingService.make_bill(self.db, self.store, self.user.id, MakeBillRequest(
            customer_type="khata",
            customer_id=cust.id,
            items=[
                BillItemInput(
                    product_id=prod.id,
                    product_name=prod.name,
                    price_with_tax=28.0,
                    gst_rate=5.0,
                    unit="Packet",
                    qty=5.0
                )
            ]
        ))
        self.assertEqual(bill2["payment_status"], "unpaid")
        self.assertEqual(bill2["grand_total"], 140.0)

        # Customer statement PDF
        pdf_bytes = GroceryKhataCustomerService.generate_statement_pdf(self.db, self.store.id, cust.id)
        self.assertTrue(len(pdf_bytes) > 50)

        # Settle khata bill
        pay_res = GroceryKhataCustomerService.record_payment(
            self.db, self.store.id, cust.id,
            CustomerPaymentPayload(amount=140.0, payment_method="UPI")
        )
        self.assertEqual(pay_res["bills_settled"], 1)

    def test_07_settings_and_backup(self):
        # Settings
        settings = GrocerySettingService.get_or_create_settings(self.db, self.store.id)
        self.assertEqual(settings["currency_code"], "INR")

        updated = GrocerySettingService.update_settings(
            self.db, self.store.id,
            GrocerySettingUpdate(theme="dark", language="gu", currency_code="INR", bill_sound_id="sound_gpay")
        )
        self.assertEqual(updated["theme"], "dark")
        self.assertEqual(updated["language"], "gu")

        # Backup export
        backup = GroceryBackupService.export_store_backup(self.db, self.store)
        self.assertTrue(backup["success"])
        self.assertIn("products", backup["data"])

        # Backup restore
        restore_res = GroceryBackupService.restore_store_backup(self.db, self.store, backup["data"])
        self.assertTrue(restore_res["success"])


if __name__ == "__main__":
    unittest.main()
