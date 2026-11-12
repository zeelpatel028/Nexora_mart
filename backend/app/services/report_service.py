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
        ).join(Product, Product.shop_category_id == Category.id)\
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

    @staticmethod
    def get_analytics_overview(db: Session, store: Store, user=None) -> dict:
        now = datetime.datetime.now(datetime.timezone.utc)
        user_name = user.first_name if (user and getattr(user, 'first_name', None)) else "Owner"
        
        # Calculate real stats from database if available
        today_start = datetime.datetime(now.year, now.month, now.day, 0, 0, 0, tzinfo=datetime.timezone.utc)
        today_sales_sum = db.query(func.coalesce(func.sum(Sale.total_amount), 0.0)).filter(
            Sale.store_id == store.id,
            Sale.sale_date >= today_start
        ).scalar() or 0.0

        total_orders_count = db.query(Sale).filter(Sale.store_id == store.id).count()
        total_products_count = db.query(Product).filter(
            Product.store_id == store.id,
            Product.is_active == True
        ).count()

        # Low stock query from database
        db_low_stock = db.query(Inventory).filter(
            Inventory.store_id == store.id,
            Inventory.quantity <= (Inventory.reorder_level or 15)
        ).limit(5).all()

        low_stock_list = []
        if db_low_stock:
            for item in db_low_stock:
                p_name = item.product.name if item.product else "Product"
                qty = item.quantity
                is_crit = qty <= 10
                low_stock_list.append({
                    "id": item.id,
                    "name": p_name,
                    "stock": f"{int(qty)} units",
                    "status": "Critical" if is_crit else "Low Stock",
                    "status_color": "danger" if is_crit else "warning",
                    "category": item.product.category.name if (item.product and item.product.category) else "General"
                })

        today_sales_display = f"₹ {today_sales_sum:,.2f}"
        orders_display = str(total_orders_count)
        products_display = f"{total_products_count:,}"

        # Real 7-day sales overview
        weekly_analytics = ReportService.get_sales_analytics(db, store, days=7)
        sales_overview_points = []
        for item in weekly_analytics.get("items", []):
            try:
                dt = datetime.datetime.strptime(f"{now.year} {item['date']}", "%Y %b %d")
                day_label = dt.strftime("%a")
            except Exception:
                day_label = item["date"]
            sales_overview_points.append({
                "day": day_label,
                "sales": float(item.get("sales", 0.0)),
                "orders": int(item.get("orders", 0))
            })

        # Real recent activities from Sales and Purchases
        recent_sales = db.query(Sale).filter(Sale.store_id == store.id).order_by(Sale.sale_date.desc()).limit(5).all()
        recent_acts = []
        for s in recent_sales:
            recent_acts.append({
                "id": f"sale-{s.id}",
                "title": f"Invoice #{s.invoice_number or s.id}",
                "description": f"Sale completed • ₹ {s.total_amount:,.2f}",
                "timestamp": s.sale_date.strftime("%I:%M %p") if s.sale_date else "Today",
                "icon": "cart"
            })

        if len(recent_acts) < 5:
            recent_purchases = db.query(Purchase).filter(Purchase.store_id == store.id).order_by(Purchase.purchase_date.desc()).limit(5 - len(recent_acts)).all()
            for pur in recent_purchases:
                recent_acts.append({
                    "id": f"pur-{pur.id}",
                    "title": f"Purchase #{pur.invoice_number or pur.id}",
                    "description": f"Supplier purchase • ₹ {pur.total_amount:,.2f}",
                    "timestamp": pur.purchase_date.strftime("%b %d") if pur.purchase_date else "Recent",
                    "icon": "box"
                })

        day_num = now.day
        date_str = f"{now.strftime('%a')}, {day_num} {now.strftime('%b %Y')}"
        return {
            "store_name": store.name or "NEXORA MART",
            "greeting": f"Good Morning, {user_name}!",
            "date_display": date_str,
            "stats": [
                {
                    "id": "sales",
                    "title": "Today's Sales",
                    "value": today_sales_display,
                    "trend": None,
                    "is_positive": True,
                    "subtitle": None,
                    "color_scheme": "orange"
                },
                {
                    "id": "orders",
                    "title": "Total Orders",
                    "value": orders_display,
                    "trend": None,
                    "is_positive": True,
                    "subtitle": None,
                    "color_scheme": "red"
                },
                {
                    "id": "products",
                    "title": "Total Products",
                    "value": products_display,
                    "trend": None,
                    "is_positive": True,
                    "subtitle": "Active catalog",
                    "color_scheme": "blue"
                },
                {
                    "id": "customers",
                    "title": "Customers",
                    "value": str(db.query(Customer).filter(Customer.store_id == store.id).count()),
                    "trend": None,
                    "is_positive": True,
                    "subtitle": "Registered partners",
                    "color_scheme": "green"
                }
            ],
            "sales_overview": sales_overview_points,
            "category_sales": [],
            "category_total_sales": f"₹ {today_sales_sum:,.2f}",
            "recent_activities": recent_acts,
            "low_stock_products": low_stock_list
        }

