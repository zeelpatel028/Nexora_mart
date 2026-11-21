import sys
from pathlib import Path
import datetime

backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.database.connection import SessionLocal
from app.models.user import User
from app.models.store import Store
from app.models.invoice import Invoice
from app.services.cache_service import CacheService
from app.utils.security import get_password_hash
from app.routes.report_routes import get_sales_analytics as route_get_sales_analytics
from app.routes.report_routes import get_analytics_overview as route_get_analytics_overview

def test_reports_sales_analytics():
    print("\n" + "=" * 60)
    print("RUNNING TULSI MART SALES ANALYTICS & CACHING VERIFICATION")
    print("=" * 60)

    db = SessionLocal()
    try:
        user1_email = "analytics_store1@nmart.com"
        user2_email = "analytics_store2@nmart.com"

        # Cleanup any previous test data
        db.query(Invoice).filter(Invoice.invoice_number.like("TEST-ANL-%")).delete(synchronize_session=False)
        u1 = db.query(User).filter(User.email == user1_email).first()
        if u1:
            db.query(Store).filter(Store.user_id == u1.id).delete(synchronize_session=False)
            db.delete(u1)
        u2 = db.query(User).filter(User.email == user2_email).first()
        if u2:
            db.query(Store).filter(Store.user_id == u2.id).delete(synchronize_session=False)
            db.delete(u2)
        db.commit()

        # Create User 1 & Store 1
        user1 = User(
            email=user1_email,
            first_name="StoreOne",
            surname="Merchant",
            phone="+91-9999900001",
            hashed_password=get_password_hash("Password123!"),
            is_active=True
        )
        db.add(user1)
        db.flush()

        store1 = Store(
            user_id=user1.id,
            name="Store 1 Mart",
            code="STR1",
            is_active=True
        )
        db.add(store1)

        # Create User 2 & Store 2
        user2 = User(
            email=user2_email,
            first_name="StoreTwo",
            surname="Merchant",
            phone="+91-9999900002",
            hashed_password=get_password_hash("Password123!"),
            is_active=True
        )
        db.add(user2)
        db.flush()

        store2 = Store(
            user_id=user2.id,
            name="Store 2 Mart",
            code="STR2",
            is_active=True
        )
        db.add(store2)
        db.commit()

        # Clear any prior caches for both stores
        CacheService.invalidate_sales_analytics(store1.id)
        CacheService.invalidate_sales_analytics(store2.id)

        # -------------------------------------------------------------
        # TEST 1: Empty sales data (Returns all items with 0 sales)
        # -------------------------------------------------------------
        print("\n[TEST 1] Testing route_get_sales_analytics with empty sales...")
        res = route_get_sales_analytics(days=7, db=db, current_user=user1)
        assert isinstance(res, dict)
        assert "items" in res
        assert "total_revenue" in res
        assert "total_orders" in res
        assert len(res["items"]) == 7
        assert res["total_revenue"] == 0.0
        assert res["total_orders"] == 0
        for item in res["items"]:
            assert item["sales"] == 0.0
            assert item["orders"] == 0
        print("  -> PASS: Empty sales returns initialized daily buckets and zero revenue.")

        # -------------------------------------------------------------
        # TEST 2: Different 'days' query parameters (1, 7, 14, 30)
        # -------------------------------------------------------------
        print("\n[TEST 2] Testing different values for 'days' parameter...")
        for d in [1, 7, 14, 30]:
            r = route_get_sales_analytics(days=d, db=db, current_user=user1)
            assert len(r["items"]) == d, f"Expected {d} items, got {len(r['items'])}"
        print("  -> PASS: Correct number of items returned for days=1, 7, 14, 30.")

        # -------------------------------------------------------------
        # TEST 3: Add Sales to Store 1 and Store 2 (Strict Store Isolation)
        # -------------------------------------------------------------
        print("\n[TEST 3] Testing store data isolation...")
        now = datetime.datetime.now(datetime.timezone.utc)
        inv1 = Invoice(
            store_id=store1.id,
            invoice_number="TEST-ANL-001",
            invoice_date=now,
            subtotal=500.0,
            total_amount=500.0,
            paid_amount=500.0,
            payment_status="PAID"
        )
        inv2 = Invoice(
            store_id=store2.id,
            invoice_number="TEST-ANL-002",
            invoice_date=now,
            subtotal=1200.0,
            total_amount=1200.0,
            paid_amount=1200.0,
            payment_status="PAID"
        )
        db.add(inv1)
        db.add(inv2)
        db.commit()

        # Invalidate cache so DB is freshly queried
        CacheService.invalidate_sales_analytics(store1.id)
        CacheService.invalidate_sales_analytics(store2.id)

        # Store 1 should see only 500.0
        data1 = route_get_sales_analytics(days=7, db=db, current_user=user1)
        assert data1["total_revenue"] == 500.0, f"Expected 500.0 for Store 1, got {data1['total_revenue']}"
        assert data1["total_orders"] == 1

        # Store 2 should see only 1200.0
        data2 = route_get_sales_analytics(days=7, db=db, current_user=user2)
        assert data2["total_revenue"] == 1200.0, f"Expected 1200.0 for Store 2, got {data2['total_revenue']}"
        assert data2["total_orders"] == 1
        print("  -> PASS: Complete store data isolation verified. No cross-store data leakage.")

        # -------------------------------------------------------------
        # TEST 4: Verify Caching & Unique Keys by Store and Days
        # -------------------------------------------------------------
        print("\n[TEST 4] Testing CacheService get/set and unique cache keys...")
        cached_s1_d7 = CacheService.get_sales_analytics(store1.id, 7)
        assert cached_s1_d7 is not None, "Store 1 days=7 should be cached in Redis/Memory"
        assert cached_s1_d7["total_revenue"] == 500.0

        cached_s2_d7 = CacheService.get_sales_analytics(store2.id, 7)
        assert cached_s2_d7 is not None, "Store 2 days=7 should be cached in Redis/Memory"
        assert cached_s2_d7["total_revenue"] == 1200.0

        # Verify key for days=14 is separate from days=7
        cached_s1_d14 = CacheService.get_sales_analytics(store1.id, 14)
        assert cached_s1_d14 is None, "Store 1 days=14 was not requested yet, should be None"

        # Query days=14 now
        route_get_sales_analytics(days=14, db=db, current_user=user1)
        cached_s1_d14 = CacheService.get_sales_analytics(store1.id, 14)
        assert cached_s1_d14 is not None and len(cached_s1_d14["items"]) == 14
        print("  -> PASS: Unique cache keys per (store_id, days) verified.")

        # -------------------------------------------------------------
        # TEST 5: Cache Failure & Fallback Resilience
        # -------------------------------------------------------------
        print("\n[TEST 5] Testing resilience when CacheService fails or is unavailable...")
        original_get = CacheService.get_sales_analytics
        original_set = CacheService.set_sales_analytics

        def broken_get(store_id, days):
            raise RuntimeError("Simulated Redis Connection Outage")

        def broken_set(store_id, days, data, ttl=300):
            raise RuntimeError("Simulated Redis Write Failure")

        CacheService.get_sales_analytics = broken_get
        CacheService.set_sales_analytics = broken_set

        try:
            # Must NOT raise exception; must fall back to direct database query
            fallback_data = route_get_sales_analytics(days=7, db=db, current_user=user1)
            assert fallback_data["total_revenue"] == 500.0
            assert fallback_data["total_orders"] == 1
            print("  -> PASS: Fallback to database works seamlessly when Cache raises exceptions (no 500 error).")
        finally:
            CacheService.get_sales_analytics = original_get
            CacheService.set_sales_analytics = original_set

        # -------------------------------------------------------------
        # TEST 6: Invalidation on New Sale Creation
        # -------------------------------------------------------------
        print("\n[TEST 6] Testing cache invalidation upon new sale...")
        # Add another sale to store 1
        inv1_b = Invoice(
            store_id=store1.id,
            invoice_number="TEST-ANL-003",
            invoice_date=now,
            subtotal=250.0,
            total_amount=250.0,
            paid_amount=250.0,
            payment_status="PAID"
        )
        db.add(inv1_b)
        db.commit()

        # Invalidate cache for Store 1
        CacheService.invalidate_sales_analytics(store1.id)
        assert CacheService.get_sales_analytics(store1.id, 7) is None, "Cache should be cleared after invalidation"

        # Subsequent API call must fetch fresh total (500 + 250 = 750)
        fresh_data = route_get_sales_analytics(days=7, db=db, current_user=user1)
        assert fresh_data["total_revenue"] == 750.0, f"Expected 750.0, got {fresh_data['total_revenue']}"
        assert fresh_data["total_orders"] == 2
        print("  -> PASS: Cache invalidation successfully refreshed analytics data to 750.0.")

        # -------------------------------------------------------------
        # TEST 7: Analytics Overview Endpoint
        # -------------------------------------------------------------
        print("\n[TEST 7] Testing route_get_analytics_overview...")
        overview_data = route_get_analytics_overview(db=db, current_user=user1)
        assert "sales_overview" in overview_data
        assert len(overview_data["sales_overview"]) == 7
        print("  -> PASS: /api/reports/analytics-overview operates cleanly without errors.")

        print("\n" + "=" * 60)
        print("ALL SALES ANALYTICS & CACHING TESTS PASSED SUCCESSFULLY! (7 / 7)")
        print("=" * 60)

    finally:
        # Cleanup test data
        try:
            db.rollback()
            db.query(Invoice).filter(Invoice.invoice_number.like("TEST-ANL-%")).delete(synchronize_session=False)
            u1 = db.query(User).filter(User.email == user1_email).first()
            if u1:
                db.query(Store).filter(Store.user_id == u1.id).delete(synchronize_session=False)
                db.delete(u1)
            u2 = db.query(User).filter(User.email == user2_email).first()
            if u2:
                db.query(Store).filter(Store.user_id == u2.id).delete(synchronize_session=False)
                db.delete(u2)
            db.commit()
        except Exception:
            db.rollback()
        finally:
            db.close()

if __name__ == "__main__":
    test_reports_sales_analytics()
