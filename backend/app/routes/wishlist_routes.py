from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database.connection import get_db
from ..middleware.auth_middleware import get_current_user
from ..models.user import User
from ..models.product import Product
from ..services.cache_service import CacheService
from ..services.store_service import StoreService

router = APIRouter(prefix="/wishlist", tags=["Wishlist"])

@router.get("")
@router.get("/", include_in_schema=False)
def get_wishlist(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve full details of products in user's wishlist"""
    store = StoreService.get_user_store(db, current_user)
    product_ids = CacheService.get_user_wishlist(current_user.id) or []
    
    if not product_ids:
        return {
            "success": True,
            "message": "Wishlist is empty",
            "data": [],
            "total_items": 0
        }

    products = db.query(Product).filter(
        Product.id.in_(product_ids),
        Product.store_id == store.id
    ).all()

    items = []
    for p in products:
        items.append({
            "id": p.id,
            "product_name": p.name,
            "sku": p.sku,
            "selling_price": float(p.selling_price or (p.pricing.selling_price if p.pricing else 0.0) or 0.0),
            "current_stock": float(p.current_stock or 0.0),
            "image_url": p.image_url,
            "category_name": p.category.name if p.category else None
        })

    return {
        "success": True,
        "message": f"Retrieved {len(items)} wishlist items",
        "data": items,
        "total_items": len(items)
    }

@router.post("/{product_id}")
def add_to_wishlist(
    product_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Add a product to user's favorites/wishlist"""
    store = StoreService.get_user_store(db, current_user)
    prod = db.query(Product).filter(Product.id == product_id, Product.store_id == store.id).first()
    if not prod:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    wlist = CacheService.get_user_wishlist(current_user.id) or []
    if product_id not in wlist:
        wlist.append(product_id)
        CacheService.set_user_wishlist(current_user.id, wlist)

    return {
        "success": True,
        "message": f"Added '{prod.name}' to wishlist",
        "data": {"product_id": product_id, "total_items": len(wlist)}
    }

@router.delete("/{product_id}")
def remove_from_wishlist(
    product_id: str,
    current_user: User = Depends(get_current_user)
):
    """Remove a product from user's favorites/wishlist"""
    wlist = CacheService.get_user_wishlist(current_user.id) or []
    updated_wlist = [pid for pid in wlist if str(pid) != str(product_id)]
    CacheService.set_user_wishlist(current_user.id, updated_wlist)

    return {
        "success": True,
        "message": "Product removed from wishlist",
        "data": {"product_id": product_id, "total_items": len(updated_wlist)}
    }
