from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from ..database.connection import get_db
from ..middleware.auth_middleware import get_current_user
from ..models.user import User
from ..schemas.product_schema import (
    ProductCreate,
    ProductUpdate,
    ProductResponse,
    ProductDetailResponse
)
from ..services.product_service import ProductService
from ..services.store_service import StoreService

router = APIRouter(prefix="/products", tags=["Products"])

@router.get("", response_model=List[ProductResponse], include_in_schema=False)
@router.get("/", response_model=List[ProductResponse])
def list_products(
    category_id: Optional[int] = None,
    search: Optional[str] = None,
    is_active: Optional[bool] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List products in current merchant's store with dynamic attribute filters and pagination"""
    store = StoreService.get_user_store(db, current_user)
    products, _ = ProductService.list_products(
        db=db,
        store_id=store.id,
        category_id=category_id,
        search=search,
        is_active=is_active,
        page=page,
        limit=limit
    )

    response_items = []
    for p in products:
        current_stock = p.inventory.quantity if p.inventory else 0.0
        response_items.append(
            ProductResponse(
                id=p.id,
                store_id=p.store_id,
                category_id=p.category_id,
                category_name=p.category.name if p.category else None,
                name=p.name,
                sku=p.sku,
                barcode=p.barcode,
                description=p.description,
                image_url=p.image_url,
                purchase_price=p.purchase_price,
                selling_price=p.selling_price,
                mrp=p.mrp,
                unit=p.unit,
                min_stock_level=p.min_stock_level,
                is_active=p.is_active,
                has_variants=p.has_variants,
                attributes=p.attributes or {},
                current_stock=current_stock
            )
        )
    return response_items

@router.post("", response_model=ProductDetailResponse, status_code=status.HTTP_201_CREATED, include_in_schema=False)
@router.post("/", response_model=ProductDetailResponse, status_code=status.HTTP_201_CREATED)
def create_product(
    request: ProductCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new product with category-specific dynamic fields and optional variants"""
    store = StoreService.get_user_store(db, current_user)
    product = ProductService.create_product(db, store, current_user, request)
    current_stock = product.inventory.quantity if product.inventory else 0.0

    return ProductDetailResponse(
        id=product.id,
        store_id=product.store_id,
        category_id=product.category_id,
        category_name=product.category.name if product.category else None,
        category_code=product.category.code if product.category else None,
        name=product.name,
        sku=product.sku,
        barcode=product.barcode,
        description=product.description,
        image_url=product.image_url,
        purchase_price=product.purchase_price,
        selling_price=product.selling_price,
        mrp=product.mrp,
        unit=product.unit,
        min_stock_level=product.min_stock_level,
        is_active=product.is_active,
        has_variants=product.has_variants,
        attributes=product.attributes or {},
        current_stock=current_stock,
        variants=[v for v in product.variants]
    )

@router.get("/{id}", response_model=ProductDetailResponse)
def get_product(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve full product details with attributes, inventory, and variants"""
    store = StoreService.get_user_store(db, current_user)
    product = ProductService.get_product(db, store.id, id)
    current_stock = product.inventory.quantity if product.inventory else 0.0

    return ProductDetailResponse(
        id=product.id,
        store_id=product.store_id,
        category_id=product.category_id,
        category_name=product.category.name if product.category else None,
        category_code=product.category.code if product.category else None,
        name=product.name,
        sku=product.sku,
        barcode=product.barcode,
        description=product.description,
        image_url=product.image_url,
        purchase_price=product.purchase_price,
        selling_price=product.selling_price,
        mrp=product.mrp,
        unit=product.unit,
        min_stock_level=product.min_stock_level,
        is_active=product.is_active,
        has_variants=product.has_variants,
        attributes=product.attributes or {},
        current_stock=current_stock,
        variants=[v for v in product.variants]
    )

@router.put("/{id}", response_model=ProductDetailResponse)
@router.patch("/{id}", response_model=ProductDetailResponse)
def update_product(
    id: int,
    request: ProductUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update product details and dynamic attributes without losing category fields"""
    store = StoreService.get_user_store(db, current_user)
    product = ProductService.update_product(db, store, id, request)
    current_stock = product.inventory.quantity if product.inventory else 0.0

    return ProductDetailResponse(
        id=product.id,
        store_id=product.store_id,
        category_id=product.category_id,
        category_name=product.category.name if product.category else None,
        category_code=product.category.code if product.category else None,
        name=product.name,
        sku=product.sku,
        barcode=product.barcode,
        description=product.description,
        image_url=product.image_url,
        purchase_price=product.purchase_price,
        selling_price=product.selling_price,
        mrp=product.mrp,
        unit=product.unit,
        min_stock_level=product.min_stock_level,
        is_active=product.is_active,
        has_variants=product.has_variants,
        attributes=product.attributes or {},
        current_stock=current_stock,
        variants=[v for v in product.variants]
    )

@router.delete("/{id}")
def delete_product(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Deactivate product in store"""
    store = StoreService.get_user_store(db, current_user)
    return ProductService.delete_product(db, store.id, id)

