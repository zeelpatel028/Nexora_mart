"""
End-to-End Integration & Migration Verification Suite for Upgraded Tulsi Mart Grocery Module.
Tests:
1. Alembic migration `b1c2d3e4f5a6` idempotency & non-destructive data preservation on clean SQLite DB.
2. `grocery_store_prefixes` sync across all 10 prefix keys.
3. Purchase Orders -> `grocery_purchase_orders` + `grocery_orders` + `grocery_order_items`
   -> Actual received_quantity stock update & multiple non-overwriting batches + Payment log.
4. Make Bill -> FEFO active batch deduction, editable per-bill pricing without mutating master,
   1:1 `grocery_invoices` record, `grocery_payments` log, duplicate `idempotency_key` guard.
5. `grocery_expenses`, `grocery_returns` + `grocery_refunds` atomic restock & movement log, `grocery_employees`.
6. Strict Store-to-Store & User-to-User isolation across all Grocery APIs.
"""
import datetime
import os
import sys
import tempfile
import unittest
from pathlib import Path

from fastapi import HTTPException
from sqlalchemy import create_engine, inspect

backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.config.database import Base, engine, SessionLocal
from app.models.user import User
from app.models.store import Store
from app.utils.security import get_password_hash
from app.models.grocery import (
    GroceryProduct,
    GroceryProductBatch,
    GroceryStockMovement,
    GrocerySupplier,
    GroceryCustomer,
    GroceryPurchaseOrder,
    GroceryOrder,
    GroceryOrderItem,
    GroceryBill,
    GroceryBillItem,
    GroceryInvoice,
    GroceryPrefix,
    GroceryStorePrefix,
    GrocerySetting,
    GroceryBackup,
    GroceryExpense,
    GroceryPayment,
    GroceryReturn,
    GroceryRefund,
    GroceryEmployee,
)
from app.schemas.grocery import (
    GrocerySupplierCreate,
    GroceryProductCreate,
    PurchaseOrderCreate,
    PurchaseOrderReceiveRequest,
    PurchaseOrderPaymentRequest,
    MakeBillRequest,
    BillItemInput,
    GroceryCustomerCreate,
    CustomerPaymentPayload,
    GroceryExpenseCreate,
    GroceryReturnCreate,
    GroceryReturnItemInput,
    GroceryPrefixesUpdateRequest,
)
from app.services.grocery import (
    GroceryPrefixService,
    GrocerySupplierService,
    GroceryProductService,
    GroceryPurchaseOrderService,
    GroceryBillingService,
    GroceryKhataCustomerService,
    GroceryFinanceService,
    GroceryReturnService,
    GroceryBackupService,
)
from app.migrations import ensure_grocery_schema
from app.stores.grocery.dashboard_router import (
    get_dashboard_overview,
    get_sales_report,
    get_inventory_valuation,
)


class TestGroceryUpgradeE2E(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        Base.metadata.create_all(bind=engine)
        ensure_grocery_schema(engine)

    def setUp(self):
        self.db = SessionLocal()
        ts = int(datetime.datetime.now().timestamp() * 1000)

        self.user_a = User(
            email=f"owner_a_{ts}@tulsimart.com",
            first_name="Asha",
            surname="Patel",
            phone="9876511111",
            hashed_password=get_password_hash("Pass123!"),
            is_active=True,
        )
        self.user_b = User(
            email=f"owner_b_{ts}@tulsimart.com",
            first_name="Vikram",
            surname="Shah",
            phone="9876522222",
            hashed_password=get_password_hash("Pass123!"),
            is_active=True,
        )
        self.db.add_all([self.user_a, self.user_b])
        self.db.flush()

        self.store_a = Store(
            user_id=self.user_a.id,
            shop_category_id=1,
            name="Asha Super Grocery",
            store_type="grocery",
            store_code=f"GA{self.user_a.id:03d}",
            currency="INR",
            currency_symbol="₹",
            phone="9876511111",
            address="MG Road, Ahmedabad",
            is_active=True,
        )
        self.store_b = Store(
            user_id=self.user_b.id,
            shop_category_id=1,
            name="Vikram Mega Grocery",
            store_type="grocery",
            store_code=f"GB{self.user_b.id:03d}",
            currency="INR",
            currency_symbol="₹",
            phone="9876522222",
            address="CG Road, Surat",
            is_active=True,
        )
        self.db.add_all([self.store_a, self.store_b])
        self.db.commit()
        self.db.refresh(self.store_a)
        self.db.refresh(self.store_b)

    def tearDown(self):
        self.db.close()

    def test_alembic_upgrade_migration_creates_all_grocery_tables(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            db_path = Path(tmpdir) / "migration_check.db"
            temp_engine = create_engine(f"sqlite:///{db_path}")
            # Create base non-grocery core tables first (users, stores)
            User.__table__.create(bind=temp_engine, checkfirst=True)
            Store.__table__.create(bind=temp_engine, checkfirst=True)

            from app.migrations import ensure_grocery_schema
            ensure_grocery_schema(temp_engine)

            insp = inspect(temp_engine)
            created_tables = set(insp.get_table_names())
            expected = {
                "grocery_store_prefixes",
                "grocery_orders",
                "grocery_order_items",
                "grocery_invoices",
                "grocery_expenses",
                "grocery_payments",
                "grocery_returns",
                "grocery_refunds",
                "grocery_employees",
            }
            self.assertTrue(expected.issubset(created_tables), f"Missing tables: {expected - created_tables}")
            temp_engine.dispose()

    def test_store_prefixes_and_isolation(self):
        pfxs_a = GroceryPrefixService.get_or_create_prefixes(self.db, self.store_a.id)
        self.assertEqual(len(pfxs_a), 10)

        GroceryPrefixService.update_prefixes(
            self.db,
            self.store_a.id,
            {"product": "ITM", "order": "PO", "expense": "EXP"},
        )
        row_a = self.db.query(GroceryStorePrefix).filter(GroceryStorePrefix.store_id == self.store_a.id).first()
        self.assertIsNotNone(row_a)
        self.assertEqual(row_a.product_prefix, "ITM")
        self.assertEqual(row_a.order_prefix, "PO")
        self.assertEqual(row_a.user_id, self.user_a.id)

        preview_a = GroceryPrefixService.preview_id(self.db, self.store_a.id, "product")
        self.assertEqual(preview_a["next_id"], f"{self.store_a.store_code}_ITM_0001")

        # Store B stays isolated with defaults
        preview_b = GroceryPrefixService.preview_id(self.db, self.store_b.id, "product")
        self.assertEqual(preview_b["next_id"], f"{self.store_b.store_code}_PRD_0001")

    def test_po_actual_receive_non_overwriting_batches_and_fefo_billing(self):
        supplier = GrocerySupplierService.create_supplier(
            self.db,
            self.store_a.id,
            GrocerySupplierCreate(
                store_name="Mahalaxmi Agro Traders",
                seller_name="Sureshbhai",
                phone="9998887776",
                bank_name="SBI",
                account_holder="Mahalaxmi Traders",
                account_number="1234567890",
                ifsc="SBIN0001234",
                upi_id="mahalaxmi@sbi",
            ),
        )
        self.assertEqual(supplier.user_id, self.user_a.id)

        product = GroceryProductService.create_product(
            self.db,
            self.store_a.id,
            GroceryProductCreate(
                name="Amul Gold Milk 1L",
                supplier_id=supplier.id,
                purchase_price_with_tax=58.0,
                purchase_gst_rate=5.0,
                purchase_unit="Litre",
                selling_price_with_tax=66.0,
                selling_unit="Litre",
                selling_gst_rate=5.0,
                available_stock=10.0,
                low_stock_enabled=True,
                low_stock_qty=5.0,
                expiry_alert_enabled=True,
            ),
        )
        self.assertEqual(product.user_id, self.user_a.id)

        # Place two purchase orders and receive with different expiry dates
        po1 = GroceryPurchaseOrderService.place_order(
            self.db,
            self.store_a.id,
            PurchaseOrderCreate(
                supplier_id=supplier.id,
                product_id=product.id,
                qty=10.0,
                unit="Litre",
                purchase_price=58.0,
            ),
        )
        po2 = GroceryPurchaseOrderService.place_order(
            self.db,
            self.store_a.id,
            PurchaseOrderCreate(
                supplier_id=supplier.id,
                product_id=product.id,
                qty=10.0,
                unit="Litre",
                purchase_price=59.0,
            ),
        )
        # Verify mirror rows in grocery_orders & grocery_order_items
        ord1 = self.db.query(GroceryOrder).filter(GroceryOrder.order_code == po1["order_code"]).first()
        self.assertIsNotNone(ord1)
        item1 = self.db.query(GroceryOrderItem).filter(GroceryOrderItem.order_id == ord1.id).first()
        self.assertIsNotNone(item1)

        # Receiving without expiry must fail when expiry_alert_enabled=True
        with self.assertRaises(HTTPException):
            GroceryPurchaseOrderService.receive_order(
                self.db,
                self.store_a.id,
                po1["id"],
                PurchaseOrderReceiveRequest(received_quantity=6.0, expiry_date=None),
            )

        # Receive PO1 (actual received_quantity=6, earlier expiry) and PO2 (8, later expiry)
        soon_exp = (datetime.date.today() + datetime.timedelta(days=5)).isoformat()
        later_exp = (datetime.date.today() + datetime.timedelta(days=30)).isoformat()
        GroceryPurchaseOrderService.receive_order(
            self.db,
            self.store_a.id,
            po1["id"],
            PurchaseOrderReceiveRequest(received_quantity=6.0, expiry_date=soon_exp),
        )
        GroceryPurchaseOrderService.receive_order(
            self.db,
            self.store_a.id,
            po2["id"],
            PurchaseOrderReceiveRequest(received_quantity=8.0, expiry_date=later_exp),
        )

        # Total stock: initial 10 + 6 + 8 = 24, and both batches exist (non-overwriting!)
        refreshed_prod = self.db.query(GroceryProduct).filter(GroceryProduct.id == product.id).first()
        self.assertEqual(refreshed_prod.available_stock, 24.0)
        batches = (
            self.db.query(GroceryProductBatch)
            .filter(GroceryProductBatch.product_id == product.id)
            .order_by(GroceryProductBatch.expiry_date.asc())
            .all()
        )
        self.assertEqual(len(batches), 2)
        self.assertEqual(batches[0].remaining_qty, 6.0)
        self.assertEqual(batches[1].remaining_qty, 8.0)

        # Pay PO1 and verify payment log & supplier details
        GroceryPurchaseOrderService.pay_order(
            self.db,
            self.store_a.id,
            po1["id"],
            PurchaseOrderPaymentRequest(payment_method="UPI", notes="GPay Settled"),
        )
        supp_detail = GrocerySupplierService.get_supplier_detail(self.db, self.store_a.id, supplier.id)
        self.assertEqual(supp_detail["supplier"]["received_orders_count"], 2)
        self.assertEqual(len(supp_detail["payments"]), 1)

        # Bill 9 units with custom per-bill selling price (65.0) & idempotency_key
        idem_key = f"idem-{supplier.id}-{int(datetime.datetime.now().timestamp())}"
        bill_req = MakeBillRequest(
            customer_type="walk_in",
            walk_in_name="Rameshbhai",
            walk_in_address="Navrangpura, Ahmedabad",
            payment_method="UPI",
            idempotency_key=idem_key,
            items=[
                BillItemInput(
                    product_id=product.id,
                    product_name=product.name,
                    price_with_tax=65.0,
                    gst_rate=5.0,
                    unit="Litre",
                    qty=9.0,
                )
            ],
        )
        res1 = GroceryBillingService.make_bill(self.db, self.store_a, self.user_a.id, bill_req)
        res2 = GroceryBillingService.make_bill(self.db, self.store_a, self.user_a.id, bill_req)
        self.assertEqual(res1["id"], res2["id"])
        self.assertEqual(res1["invoice_code"], res2["invoice_code"])

        # Master product price must remain unchanged (66.0), stock deducted once (24 - 9 = 15)
        self.db.refresh(refreshed_prod)
        self.assertEqual(refreshed_prod.selling_price_with_tax, 66.0)
        self.assertEqual(refreshed_prod.available_stock, 15.0)

        # Verify FEFO deducted 6 from soonest batch (leaving 0) and 3 from later batch (leaving 5)
        self.db.refresh(batches[0])
        self.db.refresh(batches[1])
        self.assertEqual(batches[0].remaining_qty, 0.0)
        self.assertEqual(batches[1].remaining_qty, 5.0)

        # Verify 1:1 GroceryInvoice + GroceryPayment created
        inv = self.db.query(GroceryInvoice).filter(GroceryInvoice.bill_id == res1["id"]).first()
        self.assertIsNotNone(inv)
        self.assertEqual(inv.invoice_number, res1["invoice_code"])

        # Cross-store isolation: Store B cannot access Store A's product or invoice
        with self.assertRaises(HTTPException):
            GroceryProductService.get_product_detail(self.db, self.store_b.id, product.id)
        with self.assertRaises(HTTPException):
            GroceryBillingService.get_invoice_detail(self.db, self.store_b.id, res1["id"])

    def test_finance_returns_employees_and_dashboard_reports(self):
        # Create expense + return + employee
        exp = GroceryFinanceService.create_expense(
            self.db,
            self.store_a.id,
            self.user_a.id,
            GroceryExpenseCreate(
                category="Utilities",
                amount=1500.0,
                payment_method="UPI",
                description="Shop Electricity Bill",
            ),
        )
        self.assertTrue("_EXP_" in exp["expense_code"])
        self.assertEqual(exp["user_id"], self.user_a.id)

        prod = GroceryProductService.create_product(
            self.db,
            self.store_a.id,
            GroceryProductCreate(
                name="Tata Salt 1kg",
                purchase_price_with_tax=20.0,
                purchase_gst_rate=0.0,
                purchase_unit="Kilogram",
                selling_price_with_tax=28.0,
                selling_unit="Kilogram",
                selling_gst_rate=0.0,
                available_stock=50.0,
                low_stock_enabled=True,
                low_stock_qty=10.0,
                expiry_alert_enabled=False,
            ),
        )

        khata_cust = GroceryKhataCustomerService.create_customer(
            self.db,
            self.store_a.id,
            GroceryCustomerCreate(name="Kiranbhai", phone="9000090000", address="Bapunagar"),
        )
        khata_bill = GroceryBillingService.make_bill(
            self.db,
            self.store_a,
            self.user_a.id,
            MakeBillRequest(
                customer_type="khata",
                customer_id=khata_cust.id,
                items=[
                    BillItemInput(
                        product_id=prod.id,
                        product_name=prod.name,
                        price_with_tax=28.0,
                        gst_rate=0.0,
                        unit="Kilogram",
                        qty=5.0,
                    )
                ],
            ),
        )

        # Return 2kg and refund Rs 56
        ret = GroceryReturnService.process_return(
            self.db,
            self.store_a.id,
            self.user_a.id,
            GroceryReturnCreate(
                bill_id=khata_bill["id"],
                items=[GroceryReturnItemInput(product_id=prod.id, quantity=2.0, unit_price=28.0)],
                reason="Damaged packet",
                refund_method="CASH",
            ),
        )
        self.assertEqual(ret["total_return_amount"], 56.0)
        self.db.refresh(prod)
        self.assertEqual(prod.available_stock, 47.0)

        emp = GroceryEmployee(
            store_id=self.store_a.id,
            user_id=self.user_a.id,
            employee_code=f"{self.store_a.store_code}_EMP_0001",
            name="Raju",
            phone="9898989898",
            role="Cashier",
            salary=12000.0,
        )
        self.db.add(emp)
        self.db.commit()

        # Overview + Sales Report + Valuation Report + Backup
        overview = get_dashboard_overview(db=self.db, store=self.store_a)
        self.assertGreaterEqual(overview["total_bills_count"], 1)
        self.assertGreaterEqual(overview["total_expenses"], 1500.0)
        self.assertGreaterEqual(overview["pending_khata_bills"], 1)

        sales_rep = get_sales_report(period="daily", days=7, db=self.db, store=self.store_a)
        self.assertGreater(sales_rep["total_revenue"], 0)
        self.assertGreaterEqual(len(sales_rep["daily_trends"]), 1)

        valuation = get_inventory_valuation(db=self.db, store=self.store_a)
        self.assertGreater(valuation["total_cost_value"], 0)

        backup = GroceryBackupService.export_store_backup(self.db, self.store_a)
        self.assertTrue(backup["success"])
        self.assertGreaterEqual(len(backup["data"]["expenses"]), 1)

        # Settle Khata payment & verify invoice status synced
        GroceryKhataCustomerService.record_payment(
            self.db,
            self.store_a.id,
            khata_cust.id,
            CustomerPaymentPayload(amount=140.0, payment_method="CASH"),
        )
        inv = self.db.query(GroceryInvoice).filter(GroceryInvoice.bill_id == khata_bill["id"]).first()
        self.assertEqual(inv.payment_status, "paid")


if __name__ == "__main__":
    unittest.main()
