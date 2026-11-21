import logging
from sqlalchemy.orm import Session
from sqlalchemy import select
from ..models.store import Store, DocumentSequence
from ..models.store_prefix import StorePrefix

logger = logging.getLogger("nmart.prefix_service")


class PrefixService:
    """
    Manages custom store document prefixes and generates atomic, transaction-safe,
    non-duplicating sequence IDs such as TM_INV_0001, TM_PRD_0001, TM_SUP_0001.
    """

    DEFAULT_PREFIXES = {
        "invoice_prefix": "INV",
        "debit_customer_prefix": "DC",
        "walk_in_customer_prefix": "WC",
        "supplier_prefix": "SUP",
        "order_prefix": "ORD",
        "product_prefix": "PRD",
        "employee_prefix": "EMP",
        "return_prefix": "RET",
        "refund_prefix": "REF",
        "expense_prefix": "EXP",
    }

    @classmethod
    def get_or_create_prefixes(cls, db: Session, store_id: int) -> StorePrefix:
        """Fetch store prefixes or initialize default ones if not present."""
        prefix_record = db.query(StorePrefix).filter(StorePrefix.store_id == store_id).first()
        if not prefix_record:
            prefix_record = StorePrefix(
                store_id=store_id,
                invoice_prefix="INV",
                debit_customer_prefix="DC",
                walk_in_customer_prefix="WC",
                supplier_prefix="SUP",
                order_prefix="ORD",
                product_prefix="PRD",
                employee_prefix="EMP",
                return_prefix="RET",
                refund_prefix="REF",
                expense_prefix="EXP",
            )
            db.add(prefix_record)
            db.commit()
            db.refresh(prefix_record)
        return prefix_record

    @classmethod
    def update_prefixes(cls, db: Session, store_id: int, update_data: dict) -> StorePrefix:
        """Update configurable prefixes for the store."""
        prefix_record = cls.get_or_create_prefixes(db, store_id)
        for key, value in update_data.items():
            if value and hasattr(prefix_record, key):
                setattr(prefix_record, key, value.strip().upper())
        db.commit()
        db.refresh(prefix_record)
        return prefix_record

    @classmethod
    def generate_id(cls, db: Session, store_id: int, entity_type: str) -> str:
        """
        Generate a strictly sequential, unique ID on the backend:
        Format: TM_{PREFIX}_{0001}
        Entity Types: 'invoice', 'product', 'supplier', 'order', 'customer', 'employee', 'return', 'refund', 'expense'
        """
        prefixes = cls.get_or_create_prefixes(db, store_id)
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
        chosen_prefix = prefix_map.get(entity_type.lower(), "DOC")

        # Get or create sequence record in DocumentSequence with row locking
        seq = db.query(DocumentSequence).filter(
            DocumentSequence.store_id == store_id,
            DocumentSequence.document_type == entity_type.upper()
        ).with_for_update().first()

        if not seq:
            seq = DocumentSequence(
                store_id=store_id,
                document_type=entity_type.upper(),
                prefix=chosen_prefix,
                next_number=2,
                padding=4
            )
            db.add(seq)
            current_num = 1
        else:
            current_num = seq.next_number
            seq.next_number += 1

        db.flush()

        formatted_number = str(current_num).zfill(4)
        return f"TM_{chosen_prefix}_{formatted_number}"
