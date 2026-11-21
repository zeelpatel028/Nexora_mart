import sys
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from app.database.connection import Base, engine
from app.models import *
Base.metadata.create_all(bind=engine)

from tests.test_authentication_lifecycle import test_registration_and_login_lifecycle
from tests.test_store_isolation import test_store_isolation_and_cross_access_prevention
from tests.test_store_types_and_products import test_store_types_and_product_validation
from tests.test_multi_category_flow import test_full_store_flow
from tests.test_audit_security_and_ratelimit import test_audit_security_and_ratelimit
from tests.test_cart_and_caching import test_cart_and_caching
from tests.test_reports_sales_analytics import test_reports_sales_analytics
from tests.test_tulsi_mart_v2_features import TestTulsiMartV2Features
import unittest

def run_all():
    print("=" * 60)
    print("RUNNING COMPLETE TULSI MART MULTI-STORE TEST SUITE")
    print("=" * 60)

    print("\n--- Suite 1: Authentication & Token Lifecycle ---")
    test_registration_and_login_lifecycle()

    print("\n--- Suite 2: Store Isolation & Security Access Control ---")
    test_store_isolation_and_cross_access_prevention()

    print("\n--- Suite 3: 8 Store Types & Dynamic Product Schemas ---")
    test_store_types_and_product_validation()

    print("\n--- Suite 4: Multi-Category Integration Flow ---")
    test_full_store_flow()

    print("\n--- Suite 5: Security, 3-Attempt Lockout & Rate Limiting ---")
    test_audit_security_and_ratelimit()

    print("\n--- Suite 6: Cart, Wishlist & Redis Caching ---")
    test_cart_and_caching()

    print("\n--- Suite 7: Reports, Sales Analytics & Caching ---")
    test_reports_sales_analytics()

    print("\n--- Suite 8: Tulsi Mart V2 Store Prefixes, Orders, Billing & Ledgers ---")
    suite = unittest.TestLoader().loadTestsFromTestCase(TestTulsiMartV2Features)
    runner = unittest.TextTestRunner(verbosity=1)
    result = runner.run(suite)
    if not result.wasSuccessful():
        sys.exit(1)

    print("\n" + "=" * 60)
    print("ALL TESTS PASSED SUCCESSFULLY! (8 / 8 Suites Verified)")
    print("=" * 60)

if __name__ == "__main__":
    run_all()

