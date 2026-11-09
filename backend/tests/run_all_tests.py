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

def run_all():
    print("=" * 60)
    print("RUNNING COMPLETE NEXORA MART MULTI-STORE TEST SUITE")
    print("=" * 60)

    print("\n--- Suite 1: Authentication & Token Lifecycle ---")
    test_registration_and_login_lifecycle()

    print("\n--- Suite 2: Store Isolation & Security Access Control ---")
    test_store_isolation_and_cross_access_prevention()

    print("\n--- Suite 3: 8 Store Types & Dynamic Product Schemas ---")
    test_store_types_and_product_validation()

    print("\n--- Suite 4: Multi-Category Integration Flow ---")
    test_full_store_flow()

    print("\n" + "=" * 60)
    print("ALL TESTS PASSED SUCCESSFULLY! (4 / 4 Suites Verified)")
    print("=" * 60)

if __name__ == "__main__":
    run_all()

