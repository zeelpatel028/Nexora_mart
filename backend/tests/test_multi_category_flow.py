import sys
from pathlib import Path

backend_path = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_path))

from app.database.connection import SessionLocal
from app.models.user import User
from app.models.store_type import StoreType
from app.schemas.auth_schema import UserRegisterRequest
from app.services.auth_service import AuthService
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
    test_email = "flow_test_user@nexoramart.com"
    created_temp = False
    try:
        user = db.query(User).filter(User.email == "demo@nmart.com").first()
        if not user:
            existing = db.query(User).filter(User.email == test_email).first()
            if existing:
                db.delete(existing)
                db.commit()
            st = db.query(StoreType).filter(StoreType.code == "grocery").first()
            user, _, _, _ = AuthService.register_user(
                db,
                UserRegisterRequest(
                    name="Flow Tester",
                    email=test_email,
                    password="FlowPassword123!",
                    store_type_id=st.id if st else None,
                    storeType="Grocery Store" if not st else None,
                ),
            )
            created_temp = True

        store = get_my_store(db=db, current_user=user)
        store_id = store.id if hasattr(store, 'id') else store.get('id')
        assert store_id is not None

        categories = get_categories(active_only=True, db=db)
        assert len(categories) >= 8, f"Expected at least 8 categories, got {len(categories)}"

        units = get_units(db=db, current_user=user)
        assert len(units) >= 10

        summary = get_dashboard_summary(db=db, current_user=user)
        assert "total_sales" in summary
    finally:
        if created_temp:
            u = db.query(User).filter(User.email == test_email).first()
            if u:
                db.delete(u)
                db.commit()
        db.close()

if __name__ == "__main__":
    test_full_store_flow()
    print("All tests passed.")

