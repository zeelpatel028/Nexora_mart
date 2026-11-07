from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database.connection import get_db
from ..middleware.auth_middleware import get_current_user
from ..models.user import User
from ..models.store import (
    Store,
    ShopCategory,
    StoreOwnerDetails,
    StoreAddress,
    StoreBusinessDetails,
    StoreConfiguration,
    DocumentSequence,
)
from ..schemas.store_schema import StoreResponse, StoreUpdate, StoreCreate
from ..services.store_service import StoreService
from ..services.category_service import CategoryService

router = APIRouter(prefix="/stores", tags=["Stores"])

def _format_store_response(store: Store) -> dict:
    addr = store.addresses[0] if store.addresses else None
    biz = store.business_details
    cfg = store.configuration
    cat = store.shop_category
    return {
        "id": store.id,
        "name": store.name,
        "code": store.code,
        "category_id": store.shop_category_id,
        "owner_id": store.user_id,
        "phone": store.owner_details.contact_phone if store.owner_details else None,
        "email": store.owner_details.contact_email if store.owner_details else None,
        "address": f"{addr.address_line1}, {addr.city}" if addr else None,
        "city": addr.city if addr else None,
        "tax_number": biz.gstin if biz else None,
        "currency": store.currency,
        "currency_symbol": store.currency_symbol,
        "is_active": store.is_active,
        "category": {
            "id": cat.id,
            "name": cat.name,
            "code": cat.code,
            "description": cat.description,
            "icon": cat.icon,
            "is_system": getattr(cat, "is_system", True),
            "is_active": getattr(cat, "is_active", True)
        } if cat else None,
        "configuration": {
            "enable_barcode_scanner": cfg.enable_barcode_scanner if cfg else True,
            "low_stock_threshold": cfg.low_stock_threshold if cfg else 5,
            "tax_rate": cfg.tax_rate if cfg else 0.0,
            "invoice_prefix": cfg.invoice_prefix if cfg else "INV"
        } if cfg else None
    }

@router.get("", response_model=List[StoreResponse], include_in_schema=False)
@router.get("/", response_model=List[StoreResponse])
def list_user_stores(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all retail stores managed or owned by authenticated merchant"""
    stores = StoreService.get_user_stores(db, current_user)
    return [_format_store_response(s) for s in stores]

@router.get("/my-store", response_model=StoreResponse)
def get_my_store(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get active store details for authenticated merchant"""
    store = StoreService.get_user_store(db, current_user)
    return _format_store_response(store)

@router.post("", response_model=StoreResponse, status_code=status.HTTP_201_CREATED, include_in_schema=False)
@router.post("/", response_model=StoreResponse, status_code=status.HTTP_201_CREATED)
def create_new_store(
    request: StoreCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new retail store under the authenticated merchant account"""
    cat = db.query(ShopCategory).filter(ShopCategory.id == request.category_id).first()
    if not cat:
        raise HTTPException(status_code=400, detail="Invalid shop category.")

    import random
    code_suffix = f"{random.randint(100, 999)}"
    new_store = Store(
        user_id=current_user.id,
        shop_category_id=cat.id,
        name=request.name.strip(),
        code=f"STR-{cat.code[:3].upper()}-{code_suffix}",
        currency=request.currency or "INR",
        currency_symbol="₹" if (request.currency or "INR") == "INR" else "$",
        is_active=True
    )
    db.add(new_store)
    db.commit()
    db.refresh(new_store)

    # Auto-provision owner details
    owner = StoreOwnerDetails(
        store_id=new_store.id,
        owner_name=current_user.full_name,
        contact_phone=request.phone or current_user.phone,
        contact_email=request.email or current_user.email
    )
    db.add(owner)

    # Auto-provision address
    addr = StoreAddress(
        store_id=new_store.id,
        address_line1=request.address or "Commercial Complex",
        city=request.city or "Mumbai",
        state="Maharashtra",
        country="India",
        postal_code="400001",
        is_primary=True
    )
    db.add(addr)

    # Auto-provision business details
    biz = StoreBusinessDetails(
        store_id=new_store.id,
        legal_name=new_store.name,
        business_type=cat.name,
        gstin=request.tax_number,
        tax_type="GST"
    )
    db.add(biz)

    # Auto-provision configuration
    cfg = StoreConfiguration(
        store_id=new_store.id,
        enable_barcode_scanner=True,
        low_stock_threshold=5,
        tax_rate=0.0,
        invoice_prefix="INV",
        allow_negative_stock=False,
        dark_mode_default=False
    )
    db.add(cfg)

    # Auto-provision document sequences
    for doc_type, prefix in [('INVOICE', 'INV'), ('ORDER', 'ORD'), ('PURCHASE', 'PUR'), ('RETURN', 'RET'), ('REFUND', 'REF')]:
        seq = DocumentSequence(
            store_id=new_store.id,
            document_type=doc_type,
            prefix=prefix,
            next_number=1001,
            padding=4
        )
        db.add(seq)

    db.commit()
    db.refresh(new_store)
    return _format_store_response(new_store)

@router.post("/switch/{store_id}", response_model=StoreResponse)
def switch_active_store(
    store_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Switch active merchant store"""
    store = db.query(Store).filter(
        Store.id == store_id,
        Store.user_id == current_user.id,
        Store.is_active == True
    ).first()
    if not store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Store not found or you do not have permission to access it."
        )
    return _format_store_response(store)

@router.put("/my-store", response_model=StoreResponse)
def update_my_store(
    request: StoreUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update active store profile, name, category, or address"""
    store = StoreService.get_user_store(db, current_user)
    if request.name is not None and request.name.strip():
        store.name = request.name.strip()
    if request.category_id is not None:
        cat = db.query(ShopCategory).filter(ShopCategory.id == request.category_id).first()
        if cat:
            store.shop_category_id = cat.id
            current_user.store_type = cat.name
    if request.currency is not None:
        store.currency = request.currency.upper()
        store.currency_symbol = "₹" if store.currency == "INR" else "$"

    if request.phone is not None and store.owner_details:
        store.owner_details.contact_phone = request.phone
    if request.email is not None and store.owner_details:
        store.owner_details.contact_email = request.email

    if request.address is not None or request.city is not None:
        if store.addresses:
            if request.address:
                store.addresses[0].address_line1 = request.address
            if request.city:
                store.addresses[0].city = request.city
        else:
            addr = StoreAddress(
                store_id=store.id,
                address_line1=request.address or "Main Road",
                city=request.city or "City",
                country="India",
                is_primary=True
            )
            db.add(addr)

    if request.tax_number is not None:
        if store.business_details:
            store.business_details.gstin = request.tax_number
        else:
            biz = StoreBusinessDetails(
                store_id=store.id,
                gstin=request.tax_number,
                tax_type="GST"
            )
            db.add(biz)

    db.commit()
    db.refresh(store)
    return _format_store_response(store)
