import datetime
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..models.store import Store
from ..models.product import Product
from ..models.inventory import Inventory
from ..models.sale import Sale, SaleItem
from ..models.purchase import Purchase
from ..models.finance import Expense
from ..models.partner import Customer
from ..models.category import Category

class ReportService:
    @staticmethod
    def get_dashboard_summary(db: Session, store: Store) -> dict:
        now = datetime.datetime.now(datetime.timezone.utc)
        today_start = datetime.datetime(now.year, now.month, now.day, 0, 0, 0, tzinfo=datetime.timezone.utc)
        thirty_days = now + datetime.timedelta(days=30)

        # Total sales
        total_sales = db.query(func.coalesce(func.sum(Sale.total_amount), 0.0)).filter(
            Sale.store_id == store.id
        ).scalar()

        # Today's sales
        today_sales = db.query(func.coalesce(func.sum(Sale.total_amount), 0.0)).filter(
            Sale.store_id == store.id,
            Sale.sale_date >= today_start
        ).scalar()

        # Total orders count
        total_orders = db.query(Sale).filter(Sale.store_id == store.id).count()

        # Active products count
        active_products = db.query(Product).filter(
            Product.store_id == store.id,
            Product.is_active == True
        ).count()

        # Low stock count
        low_stock_count = db.query(Inventory).filter(
            Inventory.store_id == store.id,
            Inventory.quantity <= Inventory.reorder_level
        ).count()

        # Expiring soon count (<= 30 days or already expired)
        expiring_count = db.query(Inventory).filter(
            Inventory.store_id == store.id,
            Inventory.expiry_date != None,
            Inventory.expiry_date <= thirty_days
        ).count()

        # Customers count
        total_customers = db.query(Customer).filter(
            Customer.store_id == store.id,
            Customer.is_active == True
        ).count()

        # Total expenses
        total_expenses = db.query(func.coalesce(func.sum(Expense.amount), 0.0)).filter(
            Expense.store_id == store.id
        ).scalar()

        # Net profit approximation (Total sales - purchases - expenses)
        total_purchases = db.query(func.coalesce(func.sum(Purchase.total_amount), 0.0)).filter(
            Purchase.store_id == store.id
        ).scalar()

        net_profit = float(total_sales) - float(total_purchases) - float(total_expenses)

        return {
            "store_name": store.name,
            "category_name": store.category.name if store.category else "Retail Store",
            "total_sales": float(total_sales),
            "today_sales": float(today_sales),
            "total_orders": total_orders,
            "active_products": active_products,
            "low_stock_count": low_stock_count,
            "expiring_soon_count": expiring_count,
            "total_customers": total_customers,
            "total_expenses": float(total_expenses),
            "net_profit": net_profit,
            "currency": store.currency or "USD"
        }

    @staticmethod
    def get_sales_analytics(db: Session, store: Store, days: int = 14) -> dict:
        now = datetime.datetime.now(datetime.timezone.utc)
        start_date = now - datetime.timedelta(days=days)

        sales = db.query(Sale).filter(
            Sale.store_id == store.id,
            Sale.sale_date >= start_date
        ).order_by(Sale.sale_date).all()

        daily_map = {}
        for i in range(days):
            d = (now - datetime.timedelta(days=(days - 1 - i))).strftime("%b %d")
            daily_map[d] = {"date": d, "sales": 0.0, "orders": 0}

        total_rev = 0.0
        for s in sales:
            d_key = s.sale_date.strftime("%b %d")
            if d_key in daily_map:
                daily_map[d_key]["sales"] += s.total_amount
                daily_map[d_key]["orders"] += 1
            total_rev += s.total_amount

        return {
            "items": list(daily_map.values()),
            "total_revenue": total_rev,
            "total_orders": len(sales)
        }

    @staticmethod
    def get_category_performance(db: Session, store: Store) -> dict:
        # Group sales by category
        rows = db.query(
            Category.name,
            func.count(func.distinct(Product.id)),
            func.coalesce(func.sum(SaleItem.quantity), 0.0),
            func.coalesce(func.sum(SaleItem.total_price), 0.0)
        ).join(Product, Product.category_id == Category.id)\
         .outerjoin(SaleItem, SaleItem.product_id == Product.id)\
         .filter(Product.store_id == store.id)\
         .group_by(Category.id, Category.name).all()

        results = []
        for cat_name, p_cnt, sold_qty, rev in rows:
            results.append({
                "category_name": cat_name,
                "products_count": p_cnt,
                "units_sold": float(sold_qty),
                "revenue": float(rev)
            })

        return {"categories": results}

    @staticmethod
    def get_inventory_valuation(db: Session, store: Store) -> dict:
        products = db.query(Product).filter(
            Product.store_id == store.id,
            Product.is_active == True
        ).all()

        total_items = 0.0
        total_cost = 0.0
        total_retail = 0.0

        for p in products:
            qty = p.inventory.quantity if p.inventory else 0.0
            total_items += qty
            total_cost += (qty * (p.purchase_price or 0.0))
            total_retail += (qty * p.selling_price)

        return {
            "total_products": len(products),
            "total_inventory_items": total_items,
            "total_cost_valuation": round(total_cost, 2),
            "total_retail_valuation": round(total_retail, 2),
            "potential_profit": round(total_retail - total_cost, 2)
        }

