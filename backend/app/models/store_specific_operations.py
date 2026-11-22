import uuid
import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from ..database.connection import Base


# =========================================================================
# HELPER MIXINS & BUILDERS FOR STORE-WISE OPERATIONS
# =========================================================================

def create_store_inventory_table(table_name):
    """Factory creating store-specific inventory table."""
    return type(
        f"{table_name.title().replace('_', '')}",
        (Base,),
        {
            "__tablename__": table_name,
            "__table_args__": {"extend_existing": True},
            "id": Column(Integer, primary_key=True, index=True, autoincrement=True),
            "store_id": Column(Integer, ForeignKey("stores.id", ondelete="CASCADE"), nullable=False, index=True),
            "product_id": Column(String(50), nullable=False, index=True),
            "current_stock": Column(Float, default=0.0, nullable=False),
            "reorder_level": Column(Float, default=5.0, nullable=False),
            "unit": Column(String(50), default="Piece"),
            "last_updated": Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), onupdate=lambda: datetime.datetime.now(datetime.timezone.utc)),
        }
    )

def create_store_po_tables(po_table_name, item_table_name):
    """Factory creating store-specific purchase order and item tables."""
    po_cls_name = f"{po_table_name.title().replace('_', '')}"
    item_cls_name = f"{item_table_name.title().replace('_', '')}"

    POClass = type(
        po_cls_name,
        (Base,),
        {
            "__tablename__": po_table_name,
            "__table_args__": {"extend_existing": True},
            "id": Column(Integer, primary_key=True, index=True, autoincrement=True),
            "store_id": Column(Integer, ForeignKey("stores.id", ondelete="CASCADE"), nullable=False, index=True),
            "supplier_id": Column(Integer, ForeignKey("suppliers.id", ondelete="SET NULL"), nullable=True, index=True),
            "order_number": Column(String(100), nullable=False, index=True),
            "order_date": Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), index=True),
            "expected_delivery_date": Column(DateTime, nullable=True),
            "total_amount": Column(Float, default=0.0, nullable=False),
            "paid_amount": Column(Float, default=0.0, nullable=False),
            "order_status": Column(String(50), default="Pending", index=True),  # Pending, Ordered, Partially Received, Received, Cancelled
            "payment_status": Column(String(50), default="Pending", index=True), # Pending, Partially Paid, Paid
            "notes": Column(Text, nullable=True),
            "created_at": Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc)),
        }
    )

    ItemClass = type(
        item_cls_name,
        (Base,),
        {
            "__tablename__": item_table_name,
            "__table_args__": {"extend_existing": True},
            "id": Column(Integer, primary_key=True, index=True, autoincrement=True),
            "store_id": Column(Integer, ForeignKey("stores.id", ondelete="CASCADE"), nullable=False, index=True),
            "order_id": Column(Integer, ForeignKey(f"{po_table_name}.id", ondelete="CASCADE"), nullable=False, index=True),
            "product_id": Column(String(50), nullable=False, index=True),
            "product_name": Column(String(200), nullable=False),
            "quantity": Column(Float, nullable=False),
            "received_quantity": Column(Float, default=0.0, nullable=False),
            "unit": Column(String(50), default="Piece"),
            "purchase_price": Column(Float, nullable=False),
            "gst_rate": Column(Float, default=0.0),
            "total_amount": Column(Float, nullable=False),
            "batch_number": Column(String(100), nullable=True),
            "expiry_date": Column(DateTime, nullable=True),
        }
    )
    return POClass, ItemClass

def create_store_invoice_tables(inv_table_name, item_table_name):
    """Factory creating store-specific invoice and item tables."""
    inv_cls_name = f"{inv_table_name.title().replace('_', '')}"
    item_cls_name = f"{item_table_name.title().replace('_', '')}"

    InvClass = type(
        inv_cls_name,
        (Base,),
        {
            "__tablename__": inv_table_name,
            "__table_args__": {"extend_existing": True},
            "id": Column(Integer, primary_key=True, index=True, autoincrement=True),
            "store_id": Column(Integer, ForeignKey("stores.id", ondelete="CASCADE"), nullable=False, index=True),
            "customer_id": Column(Integer, ForeignKey("customers.id", ondelete="SET NULL"), nullable=True, index=True),
            "invoice_number": Column(String(100), nullable=False, index=True),
            "invoice_date": Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), index=True),
            "subtotal": Column(Float, default=0.0, nullable=False),
            "taxable_amount": Column(Float, default=0.0, nullable=False),
            "gst_amount": Column(Float, default=0.0, nullable=False),
            "discount_amount": Column(Float, default=0.0, nullable=False),
            "total_amount": Column(Float, default=0.0, nullable=False, index=True),
            "paid_amount": Column(Float, default=0.0, nullable=False),
            "payment_status": Column(String(50), default="PAID", index=True), # PAID, PARTIAL, UNPAID
            "payment_method": Column(String(50), default="CASH"),
            "customer_type": Column(String(50), default="WALK_IN"), # WALK_IN, KHATA
            "customer_name": Column(String(150), nullable=True),
            "customer_phone": Column(String(50), nullable=True),
            "notes": Column(Text, nullable=True),
            "created_at": Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc)),
        }
    )

    ItemClass = type(
        item_cls_name,
        (Base,),
        {
            "__tablename__": item_table_name,
            "__table_args__": {"extend_existing": True},
            "id": Column(Integer, primary_key=True, index=True, autoincrement=True),
            "store_id": Column(Integer, ForeignKey("stores.id", ondelete="CASCADE"), nullable=False, index=True),
            "invoice_id": Column(Integer, ForeignKey(f"{inv_table_name}.id", ondelete="CASCADE"), nullable=False, index=True),
            "product_id": Column(String(50), nullable=False, index=True),
            "product_name": Column(String(200), nullable=False),
            "quantity": Column(Float, nullable=False),
            "unit": Column(String(50), default="Piece"),
            "selling_price": Column(Float, nullable=False),
            "gst_rate": Column(Float, default=0.0),
            "taxable_amount": Column(Float, default=0.0),
            "gst_amount": Column(Float, default=0.0),
            "total_amount": Column(Float, nullable=False),
        }
    )
    return InvClass, ItemClass


# 1. Grocery
GroceryInventory = create_store_inventory_table("grocery_inventory")
GroceryPurchaseOrder, GroceryPurchaseOrderItem = create_store_po_tables("grocery_purchase_orders_legacy", "grocery_purchase_order_items")
GroceryInvoice, GroceryInvoiceItem = create_store_invoice_tables("grocery_invoices", "grocery_invoice_items")

# 2. Clothing
ClothingInventory = create_store_inventory_table("clothing_inventory")
ClothingPurchaseOrder, ClothingPurchaseOrderItem = create_store_po_tables("clothing_purchase_orders", "clothing_purchase_order_items")
ClothingInvoice, ClothingInvoiceItem = create_store_invoice_tables("clothing_invoices", "clothing_invoice_items")

# 3. Medical
MedicalInventory = create_store_inventory_table("medical_inventory")
MedicalPurchaseOrder, MedicalPurchaseOrderItem = create_store_po_tables("medical_purchase_orders", "medical_purchase_order_items")
MedicalInvoice, MedicalInvoiceItem = create_store_invoice_tables("medical_invoices", "medical_invoice_items")

# 4. Electronics
ElectronicsInventory = create_store_inventory_table("electronics_inventory")
ElectronicsPurchaseOrder, ElectronicsPurchaseOrderItem = create_store_po_tables("electronics_purchase_orders", "electronics_purchase_order_items")
ElectronicsInvoice, ElectronicsInvoiceItem = create_store_invoice_tables("electronics_invoices", "electronics_invoice_items")

# 5. Plastic
PlasticInventory = create_store_inventory_table("plastic_inventory")
PlasticPurchaseOrder, PlasticPurchaseOrderItem = create_store_po_tables("plastic_purchase_orders", "plastic_purchase_order_items")
PlasticInvoice, PlasticInvoiceItem = create_store_invoice_tables("plastic_invoices", "plastic_invoice_items")

# 6. Handloom
HandloomInventory = create_store_inventory_table("handloom_inventory")
HandloomPurchaseOrder, HandloomPurchaseOrderItem = create_store_po_tables("handloom_purchase_orders", "handloom_purchase_order_items")
HandloomInvoice, HandloomInvoiceItem = create_store_invoice_tables("handloom_invoices", "handloom_invoice_items")

# 7. Furniture
FurnitureInventory = create_store_inventory_table("furniture_inventory")
FurniturePurchaseOrder, FurniturePurchaseOrderItem = create_store_po_tables("furniture_purchase_orders", "furniture_purchase_order_items")
FurnitureInvoice, FurnitureInvoiceItem = create_store_invoice_tables("furniture_invoices", "furniture_invoice_items")

# 8. Agro
AgroInventory = create_store_inventory_table("agro_inventory")
AgroPurchaseOrder, AgroPurchaseOrderItem = create_store_po_tables("agro_purchase_orders", "agro_purchase_order_items")
AgroInvoice, AgroInvoiceItem = create_store_invoice_tables("agro_invoices", "agro_invoice_items")
