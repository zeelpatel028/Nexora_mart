from typing import Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from ..database.connection import get_db
from ..middleware.auth_middleware import get_current_user
from ..models.user import User
from ..models.store import Store, StoreOwnerDetails, StoreAddress, StoreBusinessDetails, StoreConfiguration
from ..services.store_service import StoreService
from ..services.report_service import ReportService
from ..schemas.report_schema import SalesAnalyticsResponse

router = APIRouter(tags=["Account & Store Analytics"])

class AccountUpdateRequest(BaseModel):
    first_name: Optional[str] = None
    surname: Optional[str] = None
    phone: Optional[str] = None
    store_name: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    tax_number: Optional[str] = None

@router.get("/account")
@router.get("/account/", include_in_schema=False)
def get_account_information(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Read full account profile, store owner details, and operational configurations.
    Strictly scoped to current authenticated merchant.
    """
    store = StoreService.get_user_store(db, current_user)
    owner = store.owner_details
    addr = store.addresses[0] if store.addresses else None
    biz = store.business_details
    cfg = store.configuration
    st = store.store_type_rel

    return {
        "user": {
            "id": current_user.id,
            "name": current_user.full_name,
            "first_name": current_user.first_name,
            "surname": current_user.surname,
            "email": current_user.email,
            "phone": current_user.phone,
            "role": current_user.role,
            "is_active": current_user.is_active,
            "last_login": current_user.last_login
        },
        "store": {
            "id": store.id,
            "name": store.name,
            "code": store.code or store.store_code,
            "currency": store.currency,
            "currency_symbol": store.currency_symbol,
            "is_active": store.is_active,
            "store_type": {
                "id": st.id if st else (store.shop_category_id or 1),
                "code": st.code if st else "grocery",
                "name": st.name if st else (store.store_type or "Grocery Store")
            }
        },
        "owner_details": {
            "owner_name": owner.owner_name if owner else current_user.full_name,
            "contact_phone": owner.contact_phone if owner else current_user.phone,
            "contact_email": owner.contact_email if owner else current_user.email,
            "alternate_phone": owner.alternate_phone if owner else None,
            "owner_address": owner.owner_address if owner else None
        } if owner else None,
        "address": {
            "address_line1": addr.address_line1 if addr else None,
            "city": addr.city if addr else None,
            "state": addr.state if addr else None,
            "country": addr.country if addr else "India",
            "postal_code": addr.postal_code if addr else None
        } if addr else None,
        "business_details": {
            "legal_name": biz.legal_name if biz else store.name,
            "gstin": biz.gstin if biz else None,
            "pan_number": biz.pan_number if biz else None,
            "tax_type": biz.tax_type if biz else "GST"
        } if biz else None,
        "configuration": {
            "invoice_prefix": cfg.invoice_prefix if cfg else "INV",
            "low_stock_threshold": cfg.low_stock_threshold if cfg else 5,
            "tax_rate": cfg.tax_rate if cfg else 0.0,
            "currency": cfg.currency if cfg else "INR (₹)"
        } if cfg else None
    }

@router.patch("/account")
@router.put("/account")
def update_account_information(
    request: AccountUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update permitted account and store details.
    """
    store = StoreService.get_user_store(db, current_user)

    if request.first_name:
        current_user.first_name = request.first_name.strip()
    if request.surname:
        current_user.surname = request.surname.strip()
    if request.phone:
        current_user.phone = request.phone.strip()

    if request.store_name:
        store.name = request.store_name.strip()

    if request.address or request.city:
        if not store.addresses:
            addr = StoreAddress(store_id=store.id, address_line1=request.address or "Main Market", city=request.city or "Ahmedabad")
            db.add(addr)
        else:
            if request.address:
                store.addresses[0].address_line1 = request.address.strip()
            if request.city:
                store.addresses[0].city = request.city.strip()

    if request.tax_number:
        if not store.business_details:
            biz = StoreBusinessDetails(store_id=store.id, gstin=request.tax_number.strip())
            db.add(biz)
        else:
            store.business_details.gstin = request.tax_number.strip()

    db.commit()
    return get_account_information(db=db, current_user=current_user)

@router.get("/analytics/sales", response_model=SalesAnalyticsResponse)
def get_store_sales_analytics(
    days: int = Query(14, ge=1, le=90),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Store-scoped sales analytics as specified in Section 10"""
    store = StoreService.get_user_store(db, current_user)
    return ReportService.get_sales_analytics(db, store, days=days)

