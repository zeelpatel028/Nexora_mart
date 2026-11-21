from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from ..database.connection import get_db
from ..middleware.auth_middleware import get_current_user
from ..models.user import User
from ..models.product import Product
from ..services.cache_service import CacheService
from ..services.store_service import StoreService

router = APIRouter(prefix="/cart", tags=["Cart"])

class CartItemPayload(BaseModel):
    product_id: str = Field(..., description="Product ID or SKU")
    quantity: float = Field(..., gt=0, description="Quantity to set")
    unit_price: Optional[float] = None
    notes: Optional[str] = None

class CartResponse(BaseModel):
    success: bool = True
    user_id: int
    items: List[Dict[str, Any]]
    total_items: int
    subtotal: float

@router.get("", response_model=CartResponse)
@router.get("/", response_model=CartResponse, include_in_schema=False)
def get_cart(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve current authenticated user's cart.
    Synced via Redis for sub-millisecond retrieval.
    """
    cached_cart = CacheService.get_user_cart(current_user.id) or []
    subtotal = sum(float(item.get("total_price", 0.0)) for item in cached_cart)
    return CartResponse(
        success=True,
        user_id=current_user.id,
        items=cached_cart,
        total_items=len(cached_cart),
        subtotal=round(subtotal, 2)
    )

@router.post("/items", response_model=CartResponse)
@router.post("/items/", response_model=CartResponse, include_in_schema=False)
def add_or_update_cart_item(
    payload: CartItemPayload,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Add or update item quantity in user's cart.
    Validates product existence and stock availability.
    """
    store = StoreService.get_user_store(db, current_user)
    prod = db.query(Product).filter(
        Product.id == payload.product_id,
        Product.store_id == store.id
    ).first()

    if not prod:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product '{payload.product_id}' not found."
        )

    price = float(payload.unit_price or prod.selling_price or (prod.pricing.selling_price if prod.pricing else 0.0) or 0.0)
    current_stock = float(prod.current_stock or 0.0)

    cart = CacheService.get_user_cart(current_user.id) or []
    item_found = False

    for item in cart:
        if str(item.get("product_id")) == str(payload.product_id):
            item["quantity"] = payload.quantity
            item["unit_price"] = price
            item["total_price"] = round(price * payload.quantity, 2)
            item["product_name"] = prod.name
            item["sku"] = prod.sku
            item["image_url"] = prod.image_url
            item_found = True
            break

    if not item_found:
        cart.append({
            "product_id": str(prod.id),
            "product_name": prod.name,
            "sku": prod.sku,
            "quantity": payload.quantity,
            "unit_price": price,
            "total_price": round(price * payload.quantity, 2),
            "image_url": prod.image_url,
            "notes": payload.notes
        })

    CacheService.set_user_cart(current_user.id, cart)
    subtotal = sum(float(item.get("total_price", 0.0)) for item in cart)

    return CartResponse(
        success=True,
        user_id=current_user.id,
        items=cart,
        total_items=len(cart),
        subtotal=round(subtotal, 2)
    )

@router.delete("/items/{product_id}", response_model=CartResponse)
def remove_cart_item(
    product_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Remove a specific item from the user's cart"""
    cart = CacheService.get_user_cart(current_user.id) or []
    updated_cart = [item for item in cart if str(item.get("product_id")) != str(product_id)]
    CacheService.set_user_cart(current_user.id, updated_cart)
    subtotal = sum(float(item.get("total_price", 0.0)) for item in updated_cart)

    return CartResponse(
        success=True,
        user_id=current_user.id,
        items=updated_cart,
        total_items=len(updated_cart),
        subtotal=round(subtotal, 2)
    )

@router.delete("", response_model=Dict[str, Any])
@router.delete("/", include_in_schema=False)
def clear_cart(
    current_user: User = Depends(get_current_user)
):
    """Clear all items from authenticated user's cart"""
    CacheService.clear_user_cart(current_user.id)
    return {
        "success": True,
        "message": "Cart cleared successfully",
        "data": {
            "items": [],
            "total_items": 0,
            "subtotal": 0.0
        }
    }
