import datetime
from typing import List, Optional, Tuple
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from ..models.sale import Sale, SaleItem
from ..models.product import Product, ProductVariant
from ..models.inventory import Inventory, StockMovement
from ..models.partner import Customer
from ..models.store import Store
from ..models.user import User
from ..schemas.sale_schema import SaleCreate
from ..category_rules.rule_registry import CategoryRuleRegistry

class SaleService:
    @staticmethod
    def list_sales(
        db: Session,
        store_id: int,
        customer_id: Optional[int] = None,
        payment_status: Optional[str] = None,
        page: int = 1,
        limit: int = 50
    ) -> Tuple[List[dict], int]:
        query = db.query(Sale).filter(Sale.store_id == store_id)

        if customer_id:
            query = query.filter(Sale.customer_id == customer_id)
        if payment_status:
            query = query.filter(Sale.payment_status == payment_status.upper())

        total = query.count()
        p_val = getattr(page, 'default', page)
        l_val = getattr(limit, 'default', limit)
        p_int = int(p_val) if isinstance(p_val, (int, float, str)) else 1
        l_int = int(l_val) if isinstance(l_val, (int, float, str)) else 50
        offset = (max(p_int, 1) - 1) * l_int
        sales = query.order_by(Sale.id.desc()).offset(offset).limit(l_int).all()

        results = []
        for s in sales:
            cust_name = s.customer.name if s.customer else "Walk-in Customer"
            results.append({
                "id": s.id,
                "store_id": s.store_id,
                "customer_id": s.customer_id,
                "customer_name": cust_name,
                "invoice_number": s.invoice_number,
                "sale_date": s.sale_date,
                "subtotal": s.subtotal,
                "tax_amount": s.tax_amount,
                "discount_amount": s.discount_amount,
                "total_amount": s.total_amount,
                "paid_amount": s.paid_amount,
                "payment_status": s.payment_status,
                "payment_method": s.payment_method,
                "notes": s.notes,
                "items_count": len(s.items)
            })

        return results, total

    @staticmethod
    def get_sale_detail(db: Session, store_id: int, sale_id: int) -> dict:
        sale = db.query(Sale).filter(Sale.id == sale_id, Sale.store_id == store_id).first()
        if not sale:
            raise HTTPException(status_code=404, detail="Sale invoice not found.")

        items = []
        for it in sale.items:
            prod = db.query(Product).filter(Product.id == it.product_id).first()
            var_name = None
            if it.variant_id:
                v = db.query(ProductVariant).filter(ProductVariant.id == it.variant_id).first()
                if v:
                    var_name = v.name

            items.append({
                "id": it.id,
                "product_id": it.product_id,
                "product_name": prod.name if prod else "Unknown Product",
                "variant_id": it.variant_id,
                "variant_name": var_name,
                "batch_number": it.batch_number,
                "quantity": it.quantity,
                "unit_price": it.unit_price,
                "discount": it.discount,
                "total_price": it.total_price
            })

        return {
            "id": sale.id,
            "store_id": sale.store_id,
            "customer_id": sale.customer_id,
            "customer_name": sale.customer.name if sale.customer else "Walk-in Customer",
            "invoice_number": sale.invoice_number,
            "sale_date": sale.sale_date,
            "subtotal": sale.subtotal,
            "tax_amount": sale.tax_amount,
            "discount_amount": sale.discount_amount,
            "total_amount": sale.total_amount,
            "paid_amount": sale.paid_amount,
            "payment_status": sale.payment_status,
            "payment_method": sale.payment_method,
            "notes": sale.notes,
            "items_count": len(items),
            "items": items
        }

    @staticmethod
    def create_sale(db: Session, store: Store, user: User, request: SaleCreate) -> dict:
        if not request.items:
            raise HTTPException(status_code=400, detail="Sale must contain at least one line item.")

        # Atomic transaction
        try:
            # 1. Generate unique invoice number if not provided
            now = datetime.datetime.now(datetime.timezone.utc)
            date_prefix = now.strftime("%Y%m%d")
            count_today = db.query(Sale).filter(Sale.store_id == store.id).count() + 1
            invoice_num = request.invoice_number or f"INV-{date_prefix}-{count_today:04d}"

            # Check uniqueness
            if db.query(Sale).filter(Sale.invoice_number == invoice_num).first():
                invoice_num = f"INV-{date_prefix}-{count_today:04d}-{now.strftime('%H%M%S')}"

            subtotal = 0.0
            prepared_items = []

            # 2. Process each item: check product, inventory, category rules
            category_rule = CategoryRuleRegistry.get_rule_for_category(store.category.code if store.category else "default")

            for item in request.items:
                product = db.query(Product).filter(
                    Product.id == item.product_id,
                    Product.store_id == store.id,
                    Product.is_active == True
                ).first()
                if not product:
                    raise HTTPException(status_code=404, detail=f"Product ID {item.product_id} not found in this store.")

                # Locate inventory
                inv_query = db.query(Inventory).filter(
                    Inventory.store_id == store.id,
                    Inventory.product_id == product.id
                )
                if item.variant_id:
                    inv_query = inv_query.filter(Inventory.variant_id == item.variant_id)
                else:
                    inv_query = inv_query.filter(Inventory.variant_id == None)

                inventory = inv_query.first()

                # Run category rule validation (e.g. medicine expiry, produce weight check)
                rule_res = category_rule.validate_sale_item(item.model_dump(), product, inventory)
                if not rule_res.is_valid:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="; ".join(rule_res.errors)
                    )

                # Check inventory sufficiency
                available_qty = inventory.quantity if inventory else 0.0
                if available_qty < item.quantity:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Insufficient stock for '{product.name}'. Available: {available_qty}, Requested: {item.quantity}"
                    )

                line_total = (item.unit_price * item.quantity) - (item.discount or 0.0)
                subtotal += line_total

                prepared_items.append({
                    "product": product,
                    "inventory": inventory,
                    "item_data": item,
                    "line_total": max(0.0, line_total)
                })

            total_amount = subtotal + (request.tax_amount or 0.0) - (request.discount_amount or 0.0)
            total_amount = max(0.0, total_amount)

            paid_amount = request.paid_amount
            if paid_amount >= total_amount:
                pay_status = "PAID"
            elif paid_amount > 0:
                pay_status = "PARTIAL"
            else:
                pay_status = "UNPAID"

            # 3. Create Sale Record
            sale = Sale(
                store_id=store.id,
                customer_id=request.customer_id,
                invoice_number=invoice_num,
                sale_date=now,
                subtotal=subtotal,
                tax_amount=request.tax_amount or 0.0,
                discount_amount=request.discount_amount or 0.0,
                total_amount=total_amount,
                paid_amount=paid_amount,
                payment_status=pay_status,
                payment_method=request.payment_method.upper(),
                notes=request.notes
            )
            db.add(sale)
            db.flush()

            # 4. Create Sale Items and Deduct Inventory
            for prep in prepared_items:
                prod = prep["product"]
                inv = prep["inventory"]
                item_req = prep["item_data"]

                sale_item = SaleItem(
                    sale_id=sale.id,
                    product_id=prod.id,
                    variant_id=item_req.variant_id,
                    batch_number=item_req.batch_number or (inv.batch_number if inv else None),
                    quantity=item_req.quantity,
                    unit_price=item_req.unit_price,
                    discount=item_req.discount or 0.0,
                    total_price=prep["line_total"]
                )
                db.add(sale_item)

                # Deduct inventory
                inv.quantity -= item_req.quantity

                # Deduct variant quantity if variant
                if item_req.variant_id:
                    v = db.query(ProductVariant).filter(ProductVariant.id == item_req.variant_id).first()
                    if v:
                        v.stock_quantity = max(0.0, v.stock_quantity - item_req.quantity)

                # Record Stock Movement
                movement = StockMovement(
                    store_id=store.id,
                    product_id=prod.id,
                    variant_id=item_req.variant_id,
                    movement_type="SALE",
                    quantity=item_req.quantity,
                    reference_id=sale.id,
                    reference_type="SALE",
                    unit_price=item_req.unit_price,
                    notes=f"Sold via Invoice #{sale.invoice_number}",
                    performed_by=user.id
                )
                db.add(movement)

            # 5. Handle customer balance if credit/partial
            if request.customer_id and (total_amount - paid_amount) > 0:
                customer = db.query(Customer).filter(Customer.id == request.customer_id, Customer.store_id == store.id).first()
                if customer:
                    customer.balance += (total_amount - paid_amount)

            db.commit()
            db.refresh(sale)
            return SaleService.get_sale_detail(db, store.id, sale.id)

        except HTTPException:
            db.rollback()
            raise
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=500, detail=f"Billing transaction failed: {str(e)}")
