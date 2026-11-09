from typing import List
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

router = APIRouter(prefix="/stores", tags=["Stores"])

def _format_store_response(store: Store) -> dict:
    addr = store.addresses[0] if store.addresses else None
    biz = store.business_details
    cfg = store.configuration
    cat = store.shop_category
    st = store.store_type_rel
    store_type_dict = {
        "id": st.id,
        "code": st.code,
        "name": st.name,
        "description": st.description,
        "icon": st.icon,
        "is_active": st.is_active
    } if st else (
        {
            "id": cat.id if cat else 1,
            "code": cat.code.lower() if cat else "grocery",
            "name": cat.name if cat else (store.store_type or "Grocery Store"),
            "description": cat.description if cat else "",
            "icon": cat.icon if cat else "",
            "is_active": True
        } if cat else None
    )
    return {
        "id": store.id,
        "name": store.name,
        "code": store.code,
        "category_id": store.shop_category_id,
        "store_type_id": store.store_type_id,
        "owner_id": store.user_id,
        "phone": store.owner_details.contact_phone if store.owner_details else None,
        "email": store.owner_details.contact_email if store.owner_details else None,
        "address": f"{addr.address_line1}, {addr.city}" if addr else None,
        "city": addr.city if addr else None,
        "tax_number": biz.gstin if biz else None,
        "currency": store.currency,
        "currency_symbol": store.currency_symbol,
        "is_active": store.is_active,
        "store_type": store_type_dict,
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
@router.get("/current", response_model=StoreResponse)
def get_my_store(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get active store details for authenticated merchant"""
    store = StoreService.get_user_store(db, current_user)
    return _format_store_response(store)

@router.patch("/current", response_model=StoreResponse)
def update_current_store(
    request: StoreUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update permitted fields for authenticated user's current store"""
    store = StoreService.get_user_store(db, current_user)
    updated = StoreService.update_store(db, store.id, request, current_user)
    return _format_store_response(updated)

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

@router.get("/account-details")
def get_store_account_details(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve comprehensive store account details for the Account Detail Page"""
    store = StoreService.get_user_store(db, current_user)
    addr = store.addresses[0] if store.addresses else None
    biz = store.business_details
    cfg = store.configuration
    owner = store.owner_details
    cat = store.shop_category

    reg_date = store.registration_date or store.created_at.strftime("%d-%m-%Y") if store.created_at else "07-11-2026"

    # Fetch document sequences for prefixes
    seqs = {s.document_type: s.prefix for s in store.sequences} if store.sequences else {}

    return {
        "basic_store_info": {
            "store_id": getattr(store, "store_code", None) or f"STR{store.id:03d}",
            "store_name": store.name,
            "store_code": store.code or f"NXM{store.id:03d}",
            "store_type": getattr(store, "store_type", None) or (cat.name if cat else "Supermarket"),
            "store_category": getattr(store, "store_category", None) or "Retail",
            "store_description": getattr(store, "description", None) or "Grocery & General Store",
            "store_logo": store.logo_url or "logo.png",
            "store_image": getattr(store, "image_url", None) or "store.jpg",
            "store_status": getattr(store, "store_status", None) or ("Active" if store.is_active else "Inactive"),
            "registration_date": reg_date
        },
        "store_owner_details": {
            "owner_id": getattr(owner, "owner_id", None) or f"OWN{current_user.id:03d}",
            "owner_name": owner.owner_name if owner else current_user.full_name,
            "owner_email": owner.contact_email if owner and owner.contact_email else current_user.email,
            "owner_phone": owner.contact_phone if owner and owner.contact_phone else current_user.phone,
            "alternate_phone": getattr(owner, "alternate_phone", None) or "",
            "owner_address": getattr(owner, "owner_address", None) or (addr.city if addr else "Ahmedabad"),
            "owner_profile_image": getattr(owner, "owner_profile_image", None) or "owner.png"
        },
        "store_address_details": {
            "address_line1": addr.address_line1 if addr else "",
            "landmark": getattr(addr, "landmark", None) or "",
            "city": addr.city if addr else "Ahmedabad",
            "state": addr.state if addr else "Gujarat",
            "district": getattr(addr, "district", None) or (addr.city if addr else "Ahmedabad"),
            "country": addr.country if addr else "India",
            "pincode": addr.postal_code if addr else "380001"
        },
        "business_details": {
            "gst_number": biz.gstin if biz else "",
            "pan_number": getattr(biz, "pan_number", None) or (owner.pan_number if owner else ""),
            "business_registration_number": getattr(biz, "trade_license_no", None) or "",
            "business_email": getattr(biz, "business_email", None) or (owner.contact_email if owner else current_user.email),
            "business_phone": getattr(biz, "business_phone", None) or (owner.contact_phone if owner else current_user.phone)
        },
        "store_configuration": {
            "store_opening_time": getattr(cfg, "store_opening_time", None) or "09:00 AM",
            "store_closing_time": getattr(cfg, "store_closing_time", None) or "10:00 PM",
            "working_days": getattr(cfg, "working_days", None) or "Monday - Saturday",
            "currency": cfg.currency if hasattr(cfg, "currency") and cfg.currency else "INR (₹)",
            "default_tax_rate": getattr(cfg, "tax_rate", 5.0) or 5.0,
            "invoice_prefix": seqs.get("INVOICE", getattr(cfg, "invoice_prefix", "INV")),
            "invoice_starting_number": getattr(cfg, "invoice_starting_number", 1) or 1,
            "low_stock_alert": getattr(cfg, "low_stock_threshold", 5) or 5,
            "return_period": getattr(cfg, "return_period", None) or "7 Days",
            "store_language": getattr(cfg, "store_language", None) or "English"
        },
        "system_information": {
            "created_at": store.created_at.strftime("%d-%m-%Y %H:%M:%S") if store.created_at else "07-11-2026 10:00:00",
            "updated_at": store.updated_at.strftime("%d-%m-%Y %H:%M:%S") if store.updated_at else "07-11-2026 23:38:00",
            "created_by": getattr(store, "created_by", None) or f"{current_user.full_name} (OWN{current_user.id:03d})",
            "updated_by": getattr(store, "updated_by", None) or "Owner",
            "last_login": current_user.last_login.strftime("%d-%m-%Y %H:%M:%S") if getattr(current_user, "last_login", None) else "07-11-2026 23:30:00",
            "account_status": "Active & Verified" if current_user.is_active else "Inactive"
        },
        "store_prefixes": {
            "invoice": seqs.get("INVOICE", "INV"),
            "debit_customer": seqs.get("DEBIT_CUSTOMER", "DBC"),
            "walkin_customer": seqs.get("WALKIN_CUSTOMER", "WIC"),
            "supplier": seqs.get("SUPPLIER", "SUP"),
            "order": seqs.get("ORDER", "ORD"),
            "multi_store_code": f"STR{store.id:03d}",
            "multi_store_example": f"INV-STR{store.id:03d}-000001"
        }
    }

@router.put("/account-details")
def update_store_account_details(
    payload: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Save & update full store account details from the Account Detail Page"""
    store = StoreService.get_user_store(db, current_user)
    basic = payload.get("basic_store_info", {})
    owner_info = payload.get("store_owner_details", {})
    address_info = payload.get("store_address_details", {})
    biz_info = payload.get("business_details", {})
    config_info = payload.get("store_configuration", {})
    prefix_info = payload.get("store_prefixes", {})

    if basic.get("store_name"):
        store.name = basic["store_name"]
    if basic.get("store_code"):
        store.code = basic["store_code"]
    if basic.get("store_type"):
        store.store_type = basic["store_type"]
    if basic.get("store_description"):
        store.description = basic["store_description"]
    if basic.get("store_status"):
        store.store_status = basic["store_status"]

    # Owner
    if store.owner_details:
        if owner_info.get("owner_name"):
            store.owner_details.owner_name = owner_info["owner_name"]
        if owner_info.get("owner_phone"):
            store.owner_details.contact_phone = owner_info["owner_phone"]
        if owner_info.get("alternate_phone"):
            store.owner_details.alternate_phone = owner_info["alternate_phone"]
        if owner_info.get("owner_email"):
            store.owner_details.contact_email = owner_info["owner_email"]
        if owner_info.get("owner_address"):
            store.owner_details.owner_address = owner_info["owner_address"]

    # Address
    if store.addresses:
        addr = store.addresses[0]
        if address_info.get("address_line1"):
            addr.address_line1 = address_info["address_line1"]
        if address_info.get("landmark"):
            addr.landmark = address_info["landmark"]
        if address_info.get("city"):
            addr.city = address_info["city"]
        if address_info.get("state"):
            addr.state = address_info["state"]
        if address_info.get("district"):
            addr.district = address_info["district"]
        if address_info.get("country"):
            addr.country = address_info["country"]
        if address_info.get("pincode"):
            addr.postal_code = address_info["pincode"]

    # Business
    if store.business_details:
        biz = store.business_details
        if biz_info.get("gst_number"):
            biz.gstin = biz_info["gst_number"]
        if biz_info.get("pan_number"):
            biz.pan_number = biz_info["pan_number"]
        if biz_info.get("business_registration_number"):
            biz.trade_license_no = biz_info["business_registration_number"]
        if biz_info.get("business_email"):
            biz.business_email = biz_info["business_email"]
        if biz_info.get("business_phone"):
            biz.business_phone = biz_info["business_phone"]

    # Config
    if store.configuration:
        cfg = store.configuration
        if config_info.get("store_opening_time"):
            cfg.store_opening_time = config_info["store_opening_time"]
        if config_info.get("store_closing_time"):
            cfg.store_closing_time = config_info["store_closing_time"]
        if config_info.get("working_days"):
            cfg.working_days = config_info["working_days"]
        if config_info.get("default_tax_rate") is not None:
            cfg.tax_rate = float(config_info["default_tax_rate"])
        if config_info.get("invoice_prefix"):
            cfg.invoice_prefix = config_info["invoice_prefix"]
        if config_info.get("invoice_starting_number"):
            cfg.invoice_starting_number = int(config_info["invoice_starting_number"])
        if config_info.get("low_stock_alert"):
            cfg.low_stock_threshold = int(config_info["low_stock_alert"])
        if config_info.get("return_period"):
            cfg.return_period = config_info["return_period"]
        if config_info.get("store_language"):
            cfg.store_language = config_info["store_language"]

    # Prefixes (Document Sequences)
    if prefix_info:
        for doc_type, pfx in [
            ("INVOICE", prefix_info.get("invoice")),
            ("DEBIT_CUSTOMER", prefix_info.get("debit_customer")),
            ("WALKIN_CUSTOMER", prefix_info.get("walkin_customer")),
            ("SUPPLIER", prefix_info.get("supplier")),
            ("ORDER", prefix_info.get("order")),
        ]:
            if pfx:
                seq = db.query(DocumentSequence).filter(
                    DocumentSequence.store_id == store.id,
                    DocumentSequence.document_type == doc_type
                ).first()
                if seq:
                    seq.prefix = pfx
                else:
                    new_seq = DocumentSequence(
                        store_id=store.id,
                        document_type=doc_type,
                        prefix=pfx,
                        next_number=1,
                        padding=6,
                        multi_store_code=f"STR{store.id:03d}",
                        sample_example=f"{pfx}-STR{store.id:03d}-000001"
                    )
                    db.add(new_seq)

    db.commit()
    return {"success": True, "message": "Store account details updated successfully."}
