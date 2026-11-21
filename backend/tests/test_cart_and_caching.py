import os
import sys
from pathlib import Path

_BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(_BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(_BACKEND_DIR))

from app.database.connection import SessionLocal
from app.models.user import User
from app.models.store import Store
from app.models.product import Product
from app.services.cache_service import CacheService
from app.services.rate_limiter_service import RateLimiterService
from app.routes.cart_routes import CartItemPayload, add_or_update_cart_item, get_cart, remove_cart_item, clear_cart
from app.routes.wishlist_routes import add_to_wishlist, get_wishlist, remove_from_wishlist

def test_cart_and_caching():
    print("\n" + "=" * 60)
    print("RUNNING TULSI MART CART, WISHLIST & REDIS CACHING TEST")
    print("=" * 60)

    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == "demo@nmart.com").first()
        assert user is not None, "Demo user must exist"

        store = db.query(Store).filter(Store.user_id == user.id).first()
        assert store is not None, "Demo store must exist"

        prod = db.query(Product).filter(Product.store_id == store.id).first()
        if not prod:
            prod = Product(
                store_id=store.id,
                product_name="Test Basmati Rice 1kg",
                sku="TEST-RICE-1KG",
                status="active"
            )
            db.add(prod)
            db.flush()
            from app.models.product import ProductPricing
            pricing = ProductPricing(
                store_id=store.id,
                product_id=prod.id,
                selling_price=120.0,
                purchase_price=90.0,
                tax_type="inclusive"
            )
            db.add(pricing)
            db.commit()
            db.refresh(prod)

        # 1. TEST CART CACHING WITH REDIS
        print("\n[TEST 1] Testing cart item addition and Redis persistence...")
        clear_cart(current_user=user)
        payload = CartItemPayload(product_id=str(prod.id), quantity=3.0, unit_price=120.0)
        cart_res = add_or_update_cart_item(payload=payload, db=db, current_user=user)
        assert cart_res.total_items == 1
        assert cart_res.items[0]["quantity"] == 3.0
        assert cart_res.subtotal == 360.0
        print("  -> PASS: Cart item added with subtotal calculation.")

        # 2. TEST CART RETRIEVAL
        print("\n[TEST 2] Testing cart retrieval from Redis...")
        fetched = get_cart(db=db, current_user=user)
        assert fetched.total_items == 1
        assert fetched.items[0]["product_id"] == str(prod.id)
        print("  -> PASS: Cart retrieved accurately from Redis.")

        # 3. TEST CART ITEM REMOVAL
        print("\n[TEST 3] Testing cart item deletion...")
        del_res = remove_cart_item(product_id=str(prod.id), db=db, current_user=user)
        assert del_res.total_items == 0
        print("  -> PASS: Cart item removed cleanly.")

        # 4. TEST WISHLIST
        print("\n[TEST 4] Testing wishlist add, retrieval & delete...")
        add_to_wishlist(product_id=str(prod.id), db=db, current_user=user)
        wlist = get_wishlist(db=db, current_user=user)
        assert wlist["total_items"] >= 1
        remove_from_wishlist(product_id=str(prod.id), current_user=user)
        wlist_after = get_wishlist(db=db, current_user=user)
        assert wlist_after["total_items"] == 0
        print("  -> PASS: Wishlist items synced successfully.")

        # 5. TEST REFRESH TOKEN REDIS REGISTRATION
        print("\n[TEST 5] Testing refresh token instant registration and revocation...")
        token_str = "test_cryptographic_refresh_token_2026"
        CacheService.store_refresh_token(token_str, user.id, ttl_seconds=3600)
        assert CacheService.is_refresh_token_in_redis(token_str) == True
        CacheService.revoke_refresh_token(token_str)
        assert CacheService.is_token_blacklisted(token_str) == True
        print("  -> PASS: Refresh token instant revocation and blacklisting in Redis verified.")

        print("\n" + "=" * 60)
        print("ALL CART, WISHLIST & REDIS CACHING TESTS PASSED!")
        print("=" * 60)
    finally:
        db.close()

if __name__ == "__main__":
    test_cart_and_caching()
