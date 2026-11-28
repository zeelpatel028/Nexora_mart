"""
14-Day Realistic Demo Data Seeder (Strictly for Grocery Store only).
Idempotent: seeds only if the target store has store_type='grocery' and zero existing products/bills.
"""
import datetime
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func

from ...models.store import Store
from ...utils.id_generator import generate_next_id
from .grocery_supplier.models import GrocerySupplier
from .grocery_product.models import GroceryProduct, GroceryProductBatch, GroceryStockMovement
from .grocery_khata_customer.models import GroceryCustomer
from .grocery_purchase_order.models import GroceryPurchaseOrder, GroceryOrder, GroceryOrderItem
from .grocery_billing.models import GroceryBill, GroceryBillItem, GroceryInvoice
from .grocery_finance.models import GroceryExpense, GroceryPayment


def is_grocery_store(store: Optional[Store]) -> bool:
    """Return True if the store represents a Grocery / Kirana / Supermarket category."""
    if not store:
        return False
    parts = [
        str(getattr(store, "store_type", "") or ""),
        str(getattr(getattr(store, "shop_category", None), "code", "") or ""),
        str(getattr(getattr(store, "shop_category", None), "name", "") or ""),
        str(getattr(getattr(store, "store_type_rel", None), "code", "") or ""),
        str(getattr(getattr(store, "store_type_rel", None), "name", "") or ""),
    ]
    joined = " ".join(parts).strip().lower()
    return any(tok in joined for tok in ("grocery", "kirana", "supermarket"))


def seed_grocery_14_days_demo(db: Session, store: Store) -> Dict[str, Any]:
    """Seed exactly 14 days (days -13 .. today) of realistic Grocery Store demo records."""
    if not store:
        return {"seeded": False, "reason": "missing_store"}

    if not is_grocery_store(store):
        return {"seeded": False, "reason": "not_grocery_store"}

    existing_prods = db.query(func.count(GroceryProduct.id)).filter(GroceryProduct.store_id == store.id).scalar() or 0
    existing_bills = db.query(func.count(GroceryBill.id)).filter(GroceryBill.store_id == store.id).scalar() or 0
    if existing_prods > 0 or existing_bills > 0:
        return {"seeded": False, "reason": "already_has_data"}

    now = datetime.datetime.now(datetime.timezone.utc)
    uid = store.user_id

    # 1. Seed 3 Grocery Suppliers
    supp_specs = [
        ("Shree Annapurna Grains", "Maheshbhai Patel", "9825011122", "APMC Market, Ahmedabad", "24AAACA1111A1Z5", "State Bank of India", "Shree Annapurna Grains", "30112233445", "SBIN0000300", "annapurna@sbi"),
        ("Amul Dairy Agency", "Kirtibhai Desai", "9825033344", "Dairy Circle, Anand", "24AAACB2222B1Z8", "HDFC Bank", "Amul Dairy Agency", "502000445566", "HDFC0000124", "amuldairy@hdfcbank"),
        ("Narmada FMCG Distributors", "Hiteshbhai Shah", "9825055566", "Ring Road, Surat", "24AAACC3333C1Z2", "ICICI Bank", "Narmada FMCG", "002405009911", "ICIC0000024", "narmada@icici"),
    ]
    suppliers = []
    for s_name, seller, phone, addr, gst, b_name, holder, acc, ifsc, upi in supp_specs:
        sup = GrocerySupplier(
            store_id=store.id,
            user_id=uid,
            supplier_code=generate_next_id(db, store.id, "supplier"),
            store_name=s_name,
            seller_name=seller,
            phone=phone,
            address=addr,
            gst_number=gst,
            bank_name=b_name,
            account_holder=holder,
            account_number=acc,
            ifsc=ifsc,
            upi_id=upi,
            is_active=True,
            created_at=now - datetime.timedelta(days=13),
        )
        db.add(sup)
        db.flush()
        suppliers.append(sup)

    # 2. Seed 12 Grocery Products (2 intentionally low-stock for alerts; expiry enabled on perishables)
    prod_specs = [
        ("India Gate Basmati Rice 5kg", 0, 480.0, 5.0, "Bag", 575.0, 5.0, "Bag", 24.0, True, 5.0, False),
        ("Amul Gold Full Cream Milk 1L", 1, 58.0, 0.0, "Litre", 66.0, 0.0, "Litre", 42.0, True, 10.0, True),
        ("Tata Salt Iodized 1kg", 2, 21.0, 0.0, "Packet", 28.0, 0.0, "Packet", 65.0, True, 12.0, False),
        ("Fortune Sunlite Oil 1L", 0, 128.0, 5.0, "Bottle", 152.0, 5.0, "Bottle", 34.0, True, 8.0, True),
        ("Unpolished Toor Dal 1kg", 0, 132.0, 0.0, "Kilogram", 160.0, 0.0, "Kilogram", 30.0, True, 6.0, False),
        ("Aashirvaad Shudh Atta 10kg", 0, 390.0, 0.0, "Bag", 455.0, 0.0, "Bag", 4.0, True, 5.0, False),  # low stock
        ("Parle-G Gold Biscuit Pack", 2, 72.0, 18.0, "Box", 90.0, 18.0, "Box", 28.0, True, 5.0, True),
        ("Red Label Tea 500g", 2, 235.0, 5.0, "Packet", 285.0, 5.0, "Packet", 18.0, True, 4.0, True),
        ("Amul Pasteurised Butter 500g", 1, 248.0, 12.0, "Packet", 285.0, 12.0, "Packet", 3.0, True, 5.0, True),  # low stock + soon expiry
        ("Maggi 2-Min Masala 12 Pack", 2, 138.0, 18.0, "Packet", 168.0, 18.0, "Packet", 22.0, True, 5.0, True),
        ("Surf Excel Easy Wash 1kg", 2, 118.0, 18.0, "Packet", 142.0, 18.0, "Packet", 20.0, True, 5.0, False),
        ("Gujarat Jeera Whole 500g", 0, 195.0, 5.0, "Packet", 240.0, 5.0, "Packet", 14.0, True, 3.0, False),
    ]
    products = []
    for name, s_idx, p_price, p_gst, p_unit, s_price, s_gst, s_unit, stock, low_en, low_qty, exp_en in prod_specs:
        prod = GroceryProduct(
            store_id=store.id,
            user_id=uid,
            product_code=generate_next_id(db, store.id, "product"),
            name=name,
            supplier_id=suppliers[s_idx].id,
            purchase_price_with_tax=p_price,
            purchase_gst_rate=p_gst,
            purchase_unit=p_unit,
            selling_price_with_tax=s_price,
            selling_unit=s_unit,
            selling_gst_rate=s_gst,
            available_stock=stock,
            low_stock_enabled=low_en,
            low_stock_qty=low_qty,
            expiry_alert_enabled=exp_en,
            is_active=True,
            created_at=now - datetime.timedelta(days=13),
        )
        db.add(prod)
        db.flush()
        db.add(
            GroceryStockMovement(
                store_id=store.id,
                user_id=uid,
                product_id=prod.id,
                type="initial",
                qty=stock,
                ref_id=prod.product_code,
                created_at=now - datetime.timedelta(days=13),
            )
        )
        if exp_en:
            exp_dt = now + datetime.timedelta(days=10 if "Butter" in name else 45)
            db.add(
                GroceryProductBatch(
                    store_id=store.id,
                    user_id=uid,
                    product_id=prod.id,
                    qty=stock,
                    remaining_qty=stock,
                    expiry_date=exp_dt,
                    received_at=now - datetime.timedelta(days=13),
                    created_at=now - datetime.timedelta(days=13),
                )
            )
        products.append(prod)

    # 3. Seed 5 Khata Customers
    cust_specs = [
        ("Rameshbhai Patel", "9876501122", "12 Shanti Nagar, Ahmedabad"),
        ("Suresh Kirana & Tea", "9876502233", "Station Road Corner"),
        ("Meenaben Shah", "9876503344", "45 Swastik Society"),
        ("Jayeshbhai Desai", "9876504455", "18 College Road"),
        ("Kavita Joshi", "9876505566", "7B Gokul Apartment"),
    ]
    customers = []
    for c_name, c_phone, c_addr in cust_specs:
        cust = GroceryCustomer(
            store_id=store.id,
            user_id=uid,
            customer_code=generate_next_id(db, store.id, "debit_customer"),
            name=c_name,
            phone=c_phone,
            address=c_addr,
            is_active=True,
            created_at=now - datetime.timedelta(days=13),
        )
        db.add(cust)
        db.flush()
        customers.append(cust)

    # 4. Seed 6 Purchase Orders across 14 days (5 received + 4 paid + 1 newly placed)
    po_specs = [
        (13, 0, 0, 10.0, "received", "paid"),
        (11, 1, 1, 20.0, "received", "paid"),
        (8, 2, 6, 12.0, "received", "paid"),
        (5, 0, 4, 15.0, "received", "pending"),
        (2, 1, 8, 8.0, "received", "paid"),
        (0, 2, 10, 10.0, "placed", "pending"),
    ]
    for d_off, s_idx, p_idx, qty, st_val, pay_val in po_specs:
        dt = now - datetime.timedelta(days=d_off, hours=3)
        prod = products[p_idx]
        supp = suppliers[s_idx]
        ord_code = generate_next_id(db, store.id, "order")
        tot = round(qty * prod.purchase_price_with_tax, 2)
        exp_dt = (now + datetime.timedelta(days=30)) if prod.expiry_alert_enabled else None

        po = GroceryPurchaseOrder(
            store_id=store.id,
            user_id=uid,
            order_code=ord_code,
            supplier_id=supp.id,
            product_id=prod.id,
            qty=qty,
            unit=prod.purchase_unit,
            purchase_price=prod.purchase_price_with_tax,
            total_amount=tot,
            expected_delivery_date=dt + datetime.timedelta(days=2),
            status=st_val,
            received_at=dt if st_val == "received" else None,
            expiry_date=exp_dt if st_val == "received" else None,
            payment_status=pay_val,
            paid_at=dt if pay_val == "paid" else None,
            created_at=dt,
        )
        db.add(po)
        db.flush()

        g_ord = GroceryOrder(
            store_id=store.id,
            user_id=uid,
            supplier_id=supp.id,
            order_code=ord_code,
            expected_delivery_date=dt + datetime.timedelta(days=2),
            total_amount=tot,
            paid_amount=tot if pay_val == "paid" else 0.0,
            status=st_val,
            payment_status=pay_val,
            received_at=dt if st_val == "received" else None,
            paid_at=dt if pay_val == "paid" else None,
            created_at=dt,
            updated_at=dt,
        )
        db.add(g_ord)
        db.flush()
        db.add(
            GroceryOrderItem(
                store_id=store.id,
                user_id=uid,
                order_id=g_ord.id,
                product_id=prod.id,
                product_name=prod.name,
                ordered_qty=qty,
                received_qty=qty if st_val == "received" else 0.0,
                unit=prod.purchase_unit,
                purchase_price=prod.purchase_price_with_tax,
                line_total=tot,
                expiry_date=exp_dt if st_val == "received" else None,
            )
        )
        if st_val == "received":
            db.add(
                GroceryStockMovement(
                    store_id=store.id,
                    user_id=uid,
                    product_id=prod.id,
                    type="order_received",
                    qty=qty,
                    ref_id=ord_code,
                    created_at=dt,
                )
            )
            if pay_val == "paid":
                db.add(
                    GroceryPayment(
                        store_id=store.id,
                        user_id=uid,
                        reference_type="supplier_order",
                        reference_id=po.id,
                        reference_code=ord_code,
                        amount=tot,
                        payment_method="UPI",
                        payment_date=dt,
                        notes=f"Supplier payment for {ord_code}",
                        created_at=dt,
                    )
                )

    # 5. Seed 21 Sales / Bills spread across all 14 days (day_offset 13 .. 0)
    walkin_names = [
        ("Kiran Patel", "9824011100", "Navrangpura"),
        ("Pooja Verma", "9824022200", "Satellite Road"),
        ("Walk-in Customer", None, None),
        ("Nilesh Mehta", "9824033300", "Bapunagar"),
    ]
    bill_schedule = [
        (13, "walk_in", None, "CASH", "paid", [(0, 1), (2, 3), (3, 1)]),
        (12, "khata", 0, "KHATA", "paid", [(4, 2), (7, 1)]),
        (11, "walk_in", None, "UPI", "paid", [(1, 2), (6, 2), (9, 1)]),
        (10, "walk_in", None, "CASH", "paid", [(2, 4), (10, 1)]),
        (9, "khata", 1, "KHATA", "paid", [(0, 2), (4, 3)]),
        (8, "walk_in", None, "UPI", "paid", [(3, 2), (7, 1), (11, 1)]),
        (7, "khata", 2, "KHATA", "unpaid", [(0, 1), (5, 1), (4, 2)]),
        (6, "walk_in", None, "CARD", "paid", [(6, 3), (9, 2), (10, 1)]),
        (5, "khata", 3, "KHATA", "unpaid", [(1, 4), (3, 2), (8, 1)]),
        (4, "walk_in", None, "UPI", "paid", [(0, 1), (2, 2), (11, 1)]),
        (4, "walk_in", None, "CASH", "paid", [(4, 1), (7, 1)]),
        (3, "khata", 4, "KHATA", "paid", [(3, 2), (10, 1)]),
        (3, "walk_in", None, "UPI", "paid", [(1, 3), (9, 1)]),
        (2, "walk_in", None, "CASH", "paid", [(0, 2), (6, 2)]),
        (2, "khata", 0, "KHATA", "unpaid", [(7, 2), (4, 2)]),
        (1, "walk_in", None, "UPI", "paid", [(1, 2), (2, 3), (3, 1)]),
        (1, "khata", 1, "KHATA", "unpaid", [(0, 1), (11, 2)]),
        (0, "walk_in", None, "UPI", "paid", [(0, 1), (3, 1), (6, 2)]),
        (0, "walk_in", None, "CASH", "paid", [(1, 2), (2, 2), (9, 1)]),
        (0, "khata", 2, "KHATA", "unpaid", [(4, 2), (7, 1)]),
    ]
    for idx, (d_off, c_type, c_idx, p_method, pay_st, item_pairs) in enumerate(bill_schedule):
        bill_dt = now - datetime.timedelta(days=d_off, hours=(idx % 5) + 1)
        inv_code = generate_next_id(db, store.id, "invoice")
        cust = customers[c_idx] if c_idx is not None else None
        w_name, w_phone, w_addr = walkin_names[idx % len(walkin_names)]

        subtotal = 0.0
        total_tax = 0.0
        grand_total = 0.0
        bill_items = []

        for p_idx, q in item_pairs:
            prod = products[p_idx]
            qty = float(q)
            p_tax = float(prod.selling_price_with_tax)
            gst = float(prod.selling_gst_rate or 0.0)
            base_p = p_tax / (1.0 + gst / 100.0) if gst > 0 else p_tax
            tax_amt = (p_tax - base_p) * qty
            line_tot = p_tax * qty
            subtotal += base_p * qty
            total_tax += tax_amt
            grand_total += line_tot
            bill_items.append((prod, qty, p_tax, base_p, gst, tax_amt, line_tot))

        subtotal = round(subtotal, 2)
        total_tax = round(total_tax, 2)
        grand_total = round(grand_total, 2)
        paid_amt = grand_total if pay_st == "paid" else 0.0

        bill = GroceryBill(
            store_id=store.id,
            user_id=uid,
            invoice_code=inv_code,
            customer_type=c_type,
            customer_id=cust.id if cust else None,
            walk_in_name=w_name if c_type == "walk_in" else None,
            walk_in_phone=w_phone if c_type == "walk_in" else None,
            walk_in_address=w_addr if c_type == "walk_in" else None,
            subtotal=subtotal,
            total_tax=total_tax,
            discount_amount=0.0,
            grand_total=grand_total,
            paid_amount=paid_amt,
            payment_method=p_method,
            payment_status=pay_st,
            paid_at=bill_dt if pay_st == "paid" else None,
            template_id="modern_orange",
            created_by=uid,
            created_at=bill_dt,
            updated_at=bill_dt,
        )
        db.add(bill)
        db.flush()

        for prod, qty, p_tax, base_p, gst, tax_amt, line_tot in bill_items:
            db.add(
                GroceryBillItem(
                    bill_id=bill.id,
                    store_id=store.id,
                    product_id=prod.id,
                    product_name=prod.name,
                    price_with_tax=round(p_tax, 2),
                    base_price=round(base_p, 2),
                    gst_rate=gst,
                    tax_amount=round(tax_amt, 2),
                    unit=prod.selling_unit,
                    qty=qty,
                    line_total=round(line_tot, 2),
                    created_at=bill_dt,
                )
            )
            db.add(
                GroceryStockMovement(
                    store_id=store.id,
                    user_id=uid,
                    product_id=prod.id,
                    type="sale",
                    qty=-qty,
                    ref_id=inv_code,
                    created_at=bill_dt,
                )
            )

        db.add(
            GroceryInvoice(
                store_id=store.id,
                user_id=uid,
                bill_id=bill.id,
                customer_id=cust.id if cust else None,
                invoice_number=inv_code,
                subtotal=subtotal,
                total_tax=total_tax,
                grand_total=grand_total,
                payment_status=pay_st,
                template_id="modern_orange",
                invoice_date=bill_dt,
                created_at=bill_dt,
            )
        )
        if pay_st == "paid":
            db.add(
                GroceryPayment(
                    store_id=store.id,
                    user_id=uid,
                    reference_type="khata" if c_type == "khata" else "bill",
                    reference_id=cust.id if (c_type == "khata" and cust) else bill.id,
                    reference_code=inv_code,
                    amount=grand_total,
                    payment_method=p_method,
                    payment_date=bill_dt,
                    notes=f"Invoice {inv_code}",
                    created_at=bill_dt,
                )
            )

    # 6. Seed 8 Expenses across 14 days
    exp_specs = [
        (13, "Rent", 8500.0, "BANK_TRANSFER", "Monthly Grocery Shop Rent"),
        (10, "Electricity", 1850.0, "UPI", "Store Refrigerator & Lights Bill"),
        (8, "Transport", 650.0, "CASH", "APMC Tempo Loading Charge"),
        (6, "Packaging", 480.0, "CASH", "Carry Bags & Paper Rolls"),
        (4, "Staff Salary", 4500.0, "UPI", "Helper Mid-Month Advance"),
        (3, "Maintenance", 350.0, "CASH", "Digital Weighing Scale Calibration"),
        (1, "Transport", 520.0, "UPI", "Dairy & Morning Stock Delivery"),
        (0, "Other", 240.0, "CASH", "Store Cleaning & Sanitization"),
    ]
    for d_off, cat, amt, p_meth, desc in exp_specs:
        e_dt = now - datetime.timedelta(days=d_off, hours=2)
        e_code = generate_next_id(db, store.id, "expense")
        exp = GroceryExpense(
            store_id=store.id,
            user_id=uid,
            expense_code=e_code,
            category=cat,
            amount=amt,
            payment_method=p_meth,
            expense_date=e_dt,
            description=desc,
            created_at=e_dt,
            updated_at=e_dt,
        )
        db.add(exp)
        db.flush()
        db.add(
            GroceryPayment(
                store_id=store.id,
                user_id=uid,
                reference_type="expense",
                reference_id=exp.id,
                reference_code=e_code,
                amount=amt,
                payment_method=p_meth,
                payment_date=e_dt,
                notes=desc,
                created_at=e_dt,
            )
        )

    db.commit()
    return {"seeded": True, "store_id": store.id, "days": 14, "bills": len(bill_schedule), "products": len(products)}
