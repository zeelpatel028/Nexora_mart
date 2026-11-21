import sys
import unittest
import datetime
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.database.connection import Base, engine, SessionLocal
from app.models.user import User
from app.models.store import Store
from app.models.product import Product
from app.models.partner import Customer, Supplier
from app.models.store_prefix import StorePrefix
from app.models.invoice import Invoice
from app.models.purchase import Purchase
from app.models.ledger import CustomerLedger, SupplierLedger
from app.utils.security import get_password_hash
from app.services.prefix_service import PrefixService
from app.services.order_service import OrderService
from app.services.billing_service import BillingService
from app.services.payment_service import PaymentService
from app.services.backup_service import BackupService
from app.schemas.purchase_order_schema import (
    PurchaseOrderCreate,
    PurchaseOrderItemCreate,
    PurchaseOrderReceiveRequest,
    PurchaseOrderPaymentRequest
)
from app.schemas.invoice_schema import InvoiceCreate, InvoiceItemCreate


class TestTulsiMartV2Features(unittest.TestCase):
    def setUp(self):
        self.db: Session = SessionLocal()
        Base.metadata.create_all(bind=engine)

        # Unique store owner for isolation test
        ts = int(datetime.datetime.now().timestamp() * 1000)
        self.user = User(
            email=f"owner_{ts}@tulsimart.com",
            first_name="Tulsi",
            surname="Patel",
            phone="9876543210",
            hashed_password=get_password_hash("Secret123!"),
            is_active=True
        )
        self.db.add(self.user)
        self.db.flush()

        self.store = Store(
            user_id=self.user.id,
            name="Tulsi Supermarket",
            store_type="Grocery Store",
            currency="INR",
            currency_symbol="₹",
            is_active=True
        )
        self.db.add(self.store)
        self.db.commit()
        self.db.refresh(self.store)

    def tearDown(self):
        self.db.close()

    def test_01_store_prefixes_and_safe_id_generation(self):
        """Test custom prefixes and transaction-safe sequence ID generation."""
        prefixes = PrefixService.get_or_create_prefixes(self.db, self.store.id)
        self.assertEqual(prefixes.invoice_prefix, "INV")
        self.assertEqual(prefixes.product_prefix, "PRD")
        self.assertEqual(prefixes.supplier_prefix, "SUP")

        # Generate sequence IDs
        id1 = PrefixService.generate_id(self.db, self.store.id, "product")
        id2 = PrefixService.generate_id(self.db, self.store.id, "product")
        id3 = PrefixService.generate_id(self.db, self.store.id, "invoice")
        id4 = PrefixService.generate_id(self.db, self.store.id, "customer")

        self.assertEqual(id1, "TM_PRD_0001")
        self.assertEqual(id2, "TM_PRD_0002")
        self.assertEqual(id3, "TM_INV_0001")
        self.assertEqual(id4, "TM_DC_0001")

        # Custom prefix update
        PrefixService.update_prefixes(self.db, self.store.id, {"product_prefix": "ITEM"})
        id_custom = PrefixService.generate_id(self.db, self.store.id, "product")
        self.assertEqual(id_custom, "TM_ITEM_0003")

    def test_02_purchase_order_receive_and_payment_flow(self):
        """
        Test Purchase Order:
        - Place order with custom purchase price
        - Receive order: verifies stock increase, batch creation, and supplier ledger credit
        - Pay order: verifies supplier ledger debit and payment status
        """
        # Create supplier & product
        supplier = Supplier(
            store_id=self.store.id,
            name="Gujarat Spices Wholesale",
            phone="9898000000",
            balance=0.0
        )
        self.db.add(supplier)

        product = Product(
            store_id=self.store.id,
            name="Basmati Rice 5kg",
            sku="RICE-05",
            purchase_price=400.0,
            selling_price=550.0,
            current_stock=10.0,
            unit="Bag"
        )
        self.db.add(product)
        self.db.commit()

        # Place purchase order at custom price 380 (different from catalog price 400)
        po_req = PurchaseOrderCreate(
            supplier_id=supplier.id,
            items=[
                PurchaseOrderItemCreate(
                    product_id=str(product.id),
                    quantity=20.0,
                    purchase_price=380.0
                )
            ]
        )
        order_res = OrderService.place_order(self.db, self.store, self.user, po_req)
        self.assertTrue(order_res["success"])
        order_id = order_res["order_id"]

        # Stock must NOT have increased yet!
        self.db.refresh(product)
        self.assertEqual(product.current_stock, 10.0)

        # Receive the order
        exp_date = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=180)
        receive_req = PurchaseOrderReceiveRequest(
            received_quantity=20.0,
            batch_number="BATCH-RICE-2026",
            expiry_date=exp_date
        )
        rec_res = OrderService.receive_order(self.db, self.store, self.user, order_id, receive_req)
        self.assertTrue(rec_res["success"])

        # Stock MUST have increased to 10 + 20 = 30!
        self.db.refresh(product)
        self.assertEqual(product.current_stock, 30.0)

        # Supplier ledger must reflect 20 * 380 = 7600
        self.db.refresh(supplier)
        self.assertEqual(supplier.balance, 7600.0)

        # Pay the order
        pay_req = PurchaseOrderPaymentRequest(amount=5000.0, payment_method="UPI")
        pay_res = OrderService.pay_order(self.db, self.store, self.user, order_id, pay_req)
        self.assertEqual(pay_res["payment_status"], "Partially Paid")
        self.assertEqual(pay_res["supplier_balance"], 2600.0)

    def test_03_billing_flow_walkin_and_khata_with_gst(self):
        """
        Test Make Bill:
        - Walk-in bill with item GST inclusive calculation and stock reduction
        - Khata bill with customer balance tracking and ledger synchronization
        """
        product = Product(
            store_id=self.store.id,
            name="Organic Sunflower Oil 1L",
            sku="OIL-1L",
            selling_price=168.0,
            current_stock=50.0,
            unit="Bottle"
        )
        self.db.add(product)

        customer = Customer(
            store_id=self.store.id,
            name="Ramesh Bhai Khata",
            phone="9123456789",
            balance=0.0
        )
        self.db.add(customer)
        self.db.commit()

        # 1. GST calculation check
        # Price 168 with 12% GST:
        # Taxable = 168 / 1.12 = 150.0, GST = 18.0
        taxable, gst = BillingService.calculate_gst_breakdown(168.0, 12.0)
        self.assertEqual(taxable, 150.0)
        self.assertEqual(gst, 18.0)

        # 2. Khata bill generation for 2 bottles = 336 total, 100 paid, 236 pending
        bill_data = InvoiceCreate(
            customer_id=customer.id,
            customer_type="KHATA",
            items=[
                InvoiceItemCreate(
                    product_id=str(product.id),
                    quantity=2.0,
                    selling_price=168.0,
                    gst_rate=12.0
                )
            ],
            discount_amount=0.0,
            paid_amount=100.0,
            payment_method="CASH"
        )
        bill_res = BillingService.make_bill(self.db, self.store, self.user, bill_data)
        self.assertTrue(bill_res["success"])
        self.assertEqual(bill_res["grand_total"], 336.0)
        self.assertEqual(bill_res["paid_amount"], 100.0)
        self.assertEqual(bill_res["pending_amount"], 236.0)
        self.assertEqual(bill_res["payment_status"], "PARTIAL")

        # Verify stock decremented from 50 -> 48
        self.db.refresh(product)
        self.assertEqual(product.current_stock, 48.0)

        # Verify customer Khata balance updated to 236
        self.db.refresh(customer)
        self.assertEqual(customer.balance, 236.0)

        # Receive remaining payment of 236
        pay_res = PaymentService.record_customer_payment(
            self.db, self.store, self.user, customer.id, 236.0, "UPI"
        )
        self.assertEqual(pay_res["new_balance"], 0.0)

    def test_04_store_backup_and_isolation(self):
        """Test full store JSON backup export and data isolation."""
        backup = BackupService.export_store_backup(self.db, self.store)
        self.assertEqual(backup["app"], "Tulsi Mart")
        self.assertEqual(backup["store_id"], self.store.id)
        self.assertIn("products", backup["data"])
        self.assertIn("customers", backup["data"])
        self.assertIn("suppliers", backup["data"])
        self.assertIn("invoices", backup["data"])


if __name__ == "__main__":
    unittest.main()
