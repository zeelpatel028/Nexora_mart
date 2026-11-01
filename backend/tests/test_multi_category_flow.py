import sys
from pathlib import Path

backend_path = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_path))

from app.database.connection import SessionLocal
from app.models.user import User
from app.routes.store_routes import get_my_store
from app.routes.category_routes import get_categories, get_category_fields
from app.routes.product_routes import list_products, create_product
from app.routes.inventory_routes import get_inventory
from app.routes.sale_routes import list_sales, create_sale
from app.routes.purchase_routes import list_purchases, create_purchase
from app.routes.partner_routes import list_customers, create_customer, list_suppliers, create_supplier
from app.routes.finance_routes import list_expenses, create_expense
from app.routes.report_routes import get_dashboard_summary, get_sales_analytics, get_inventory_valuation
from app.routes.unit_routes import get_units
from app.schemas.product_schema import ProductCreate
from app.schemas.partner_schema import CustomerCreate, SupplierCreate
from app.schemas.purchase_schema import PurchaseCreate, PurchaseItemCreate
from app.schemas.sale_schema import SaleCreate, SaleItemCreate
from app.schemas.finance_schema import ExpenseCreate

def test_full_store_flow():
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == "demo@nmart.com").first()
        assert user is not None, "Demo user not found"

        store = get_my_store(db=db, current_user=user)
        assert store.id is not None

        categories = get_categories(active_only=True, db=db)
        assert len(categories) >= 10, f"Expected at least 10 categories, got {len(categories)}"

        units = get_units(db=db, current_user=user)
        assert len(units) >= 10

        summary = get_dashboard_summary(db=db, current_user=user)
        assert "total_sales" in summary
    finally:
        db.close()

if __name__ == "__main__":
    test_full_store_flow()
    print("All tests passed.")

