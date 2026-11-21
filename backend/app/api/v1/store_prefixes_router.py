from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from ...api.dependencies import get_db, get_current_user, get_current_store
from ...models.user import User
from ...models.store import Store
from ...schemas.store_prefix_schema import StorePrefixResponse, StorePrefixUpdate
from ...services.prefix_service import PrefixService

router = APIRouter(prefix="/store-prefixes", tags=["Store Prefixes"])

@router.get("", response_model=StorePrefixResponse)
def get_store_prefixes(
    db: Session = Depends(get_db),
    store: Store = Depends(get_current_store),
    user: User = Depends(get_current_user)
):
    """Retrieve the configured document prefixes for the authenticated user's store."""
    prefixes = PrefixService.get_or_create_prefixes(db, store.id)
    return prefixes

@router.put("", response_model=StorePrefixResponse)
def update_store_prefixes(
    data: StorePrefixUpdate,
    db: Session = Depends(get_db),
    store: Store = Depends(get_current_store),
    user: User = Depends(get_current_user)
):
    """Update custom prefixes (e.g. INV, DC, SUP, ORD, PRD) for the store."""
    updated = PrefixService.update_prefixes(db, store.id, data.dict(exclude_unset=True))
    return updated

@router.get("/preview/{entity_type}")
def preview_next_id(
    entity_type: str,
    db: Session = Depends(get_db),
    store: Store = Depends(get_current_store),
    user: User = Depends(get_current_user)
):
    """Preview next generated sequence ID without incrementing sequence."""
    prefixes = PrefixService.get_or_create_prefixes(db, store.id)
    prefix_map = {
        "invoice": prefixes.invoice_prefix,
        "product": prefixes.product_prefix,
        "supplier": prefixes.supplier_prefix,
        "order": prefixes.order_prefix,
        "customer": prefixes.debit_customer_prefix,
        "employee": prefixes.employee_prefix,
        "return": prefixes.return_prefix,
        "refund": prefixes.refund_prefix,
        "expense": prefixes.expense_prefix,
    }
    chosen = prefix_map.get(entity_type.lower(), "DOC")
    from ...models.store import DocumentSequence
    seq = db.query(DocumentSequence).filter(
        DocumentSequence.store_id == store.id,
        DocumentSequence.document_type == entity_type.upper()
    ).first()
    next_num = (seq.last_number + 1) if seq else 1
    return {
        "entity_type": entity_type,
        "prefix": chosen,
        "next_id": f"TM_{chosen}_{str(next_num).zfill(4)}"
    }
