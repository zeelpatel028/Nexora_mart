from typing import List, Optional, Dict, Any, Tuple
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from ..models.product import Product, ProductAttribute, ProductVariant
from ..models.inventory import Inventory, StockMovement
from ..models.category import Category, CategoryField
from ..models.store import Store
from ..models.user import User
from ..schemas.product_schema import ProductCreate, ProductUpdate
from ..category_rules.rule_registry import CategoryRuleRegistry

class ProductService:
    @staticmethod
    def list_products(
        db: Session,
        store_id: int,
        category_id: Optional[int] = None,
        search: Optional[str] = None,
        is_active: Optional[bool] = None,
        page: int = 1,
        limit: int = 50
    ) -> Tuple[List[Product], int]:
        query = db.query(Product).filter(Product.store_id == store_id)

        if category_id:
            query = query.filter(Product.category_id == category_id)

        if is_active is not None:
            query = query.filter(Product.is_active == is_active)

        if search:
            search_pattern = f"%{search.strip()}%"
            query = query.filter(
                or_(
                    Product.name.ilike(search_pattern),
                    Product.sku.ilike(search_pattern),
                    Product.barcode.ilike(search_pattern),
                    Product.description.ilike(search_pattern)
                )
            )

        total = query.count()
        p_val = getattr(page, 'default', page)
        l_val = getattr(limit, 'default', limit)
        p_int = int(p_val) if isinstance(p_val, (int, float, str)) else 1
        l_int = int(l_val) if isinstance(l_val, (int, float, str)) else 50
        offset = (max(p_int, 1) - 1) * l_int
        products = query.order_by(Product.id.desc()).offset(offset).limit(l_int).all()
        return products, total

    @staticmethod
    def get_product(db: Session, store_id: int, product_id: int) -> Product:
        product = db.query(Product).filter(
            Product.id == product_id,
            Product.store_id == store_id
        ).first()
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product with ID {product_id} not found in this store."
            )
        return product

    @staticmethod
    def validate_category_fields(db: Session, category_id: int, attributes: Dict[str, Any], request_data: Optional[Any] = None):
        """
        Dynamically validates that required fields configured for the category are provided.
        Checks both the attributes dictionary and top-level request model attributes (e.g. unit, mrp, barcode).
        """
        fields = db.query(CategoryField).filter(CategoryField.category_id == category_id).all()
        errors = []
        for f in fields:
            if f.is_required and not f.is_variant_field:
                val = attributes.get(f.field_name)
                if (val is None or (isinstance(val, str) and not val.strip())) and request_data:
                    if hasattr(request_data, f.field_name):
                        val = getattr(request_data, f.field_name)
                    elif isinstance(request_data, dict) and f.field_name in request_data:
                        val = request_data[f.field_name]
                if val is not None and (not isinstance(val, str) or val.strip()):
                    # Sync into attributes for uniform queryability
                    attributes[f.field_name] = str(val) if not isinstance(val, (int, float, bool, dict, list)) else val
                else:
                    errors.append(f"Field '{f.field_label}' is required for this category.")

        if errors:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="; ".join(errors)
            )

    @staticmethod
    def create_product(db: Session, store: Store, current_user: User, request: ProductCreate) -> Product:
        category_id = request.category_id or store.category_id
        category = db.query(Category).filter(Category.id == category_id).first()
        if not category:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Category with ID {category_id} does not exist."
            )

        attributes = request.attributes or {}

        # 1. Validate Category Fields (Dynamic configuration)
        ProductService.validate_category_fields(db, category_id, attributes, request)

        # 2. Validate Category Business Rules (e.g. Medical expiry/batch, Clothing sizes, Electronics warranty)
        rule = CategoryRuleRegistry.get_rule_for_category(category.code)
        validation_res = rule.validate_product_data(request.model_dump(), attributes)
        if not validation_res.is_valid:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="; ".join(validation_res.errors)
            )

        # Auto-generate SKU if not provided
        sku = request.sku
        if not sku:
            sku = f"SKU-{category.code.upper()[:3]}-{store.id}-{int(db.query(Product).filter(Product.store_id == store.id).count()) + 1:04d}"

        new_product = Product(
            store_id=store.id,
            category_id=category_id,
            name=request.name.strip(),
            sku=sku,
            barcode=request.barcode,
            description=request.description,
            image_url=request.image_url,
            purchase_price=request.purchase_price or 0.0,
            selling_price=request.selling_price,
            mrp=request.mrp,
            unit=request.unit or "piece",
            min_stock_level=request.min_stock_level or 5,
            is_active=request.is_active,
            has_variants=bool(request.variants or request.has_variants),
            attributes=attributes
        )
        db.add(new_product)
        db.flush()

        # Save individual searchable product attributes
        for k, v in attributes.items():
            if v is not None:
                attr = ProductAttribute(
                    product_id=new_product.id,
                    field_name=k,
                    field_value=str(v)
                )
                db.add(attr)

        # Handle Variants if provided
        initial_stock = request.initial_stock or 0.0
        if request.variants:
            total_variant_stock = 0.0
            for idx, v_data in enumerate(request.variants):
                v_sku = v_data.sku or f"{sku}-V{idx+1}"
                v_price = v_data.selling_price if v_data.selling_price > 0 else (request.selling_price + v_data.additional_price)
                var_name = v_data.name
                if not var_name or var_name == "Standard Variant":
                    attr_summary = ", ".join(f"{k}: {v}" for k, v in (v_data.attributes or {}).items())
                    var_name = f"{new_product.name} ({attr_summary})" if attr_summary else f"{new_product.name} - V{idx+1}"
                variant = ProductVariant(
                    product_id=new_product.id,
                    store_id=store.id,
                    name=var_name,
                    sku=v_sku,
                    barcode=v_data.barcode,
                    additional_price=v_data.additional_price,
                    selling_price=v_price,
                    attributes=v_data.attributes or {},
                    stock_quantity=v_data.stock_quantity or 0.0,
                    is_active=True
                )
                db.add(variant)
                db.flush()

                # Add variant inventory record
                v_inv = Inventory(
                    store_id=store.id,
                    product_id=new_product.id,
                    variant_id=variant.id,
                    quantity=v_data.stock_quantity or 0.0,
                    reorder_level=request.min_stock_level or 5.0
                )
                db.add(v_inv)
                total_variant_stock += (v_data.stock_quantity or 0.0)

            # Base inventory holds total
            base_inv = Inventory(
                store_id=store.id,
                product_id=new_product.id,
                variant_id=None,
                quantity=total_variant_stock,
                reorder_level=request.min_stock_level or 5.0
            )
            db.add(base_inv)

            if total_variant_stock > 0:
                movement = StockMovement(
                    store_id=store.id,
                    product_id=new_product.id,
                    movement_type="IN",
                    quantity=total_variant_stock,
                    unit_price=request.purchase_price or 0.0,
                    notes="Initial variant stock entry on product creation",
                    performed_by=current_user.id
                )
                db.add(movement)
        else:
            # Standalone Product Inventory
            batch_num = attributes.get("batch_number")
            expiry_date_raw = attributes.get("expiry_date")
            exp_dt = None
            if expiry_date_raw:
                try:
                    import datetime
                    if isinstance(expiry_date_raw, str):
                        exp_dt = datetime.datetime.strptime(expiry_date_raw[:10], "%Y-%m-%d")
                except Exception:
                    pass

            base_inv = Inventory(
                store_id=store.id,
                product_id=new_product.id,
                variant_id=None,
                quantity=initial_stock,
                reorder_level=request.min_stock_level or 5.0,
                batch_number=batch_num,
                expiry_date=exp_dt
            )
            db.add(base_inv)

            if initial_stock > 0:
                movement = StockMovement(
                    store_id=store.id,
                    product_id=new_product.id,
                    movement_type="IN",
                    quantity=initial_stock,
                    unit_price=request.purchase_price or 0.0,
                    notes="Initial stock entry on product creation",
                    performed_by=current_user.id
                )
                db.add(movement)

        db.commit()
        db.refresh(new_product)
        return new_product

    @staticmethod
    def update_product(db: Session, store: Store, product_id: int, request: ProductUpdate) -> Product:
        product = ProductService.get_product(db, store.id, product_id)

        target_category_id = request.category_id or product.category_id
        if request.category_id and request.category_id != product.category_id:
            category = db.query(Category).filter(Category.id == request.category_id).first()
            if not category:
                raise HTTPException(status_code=400, detail="Invalid category ID")
            product.category_id = request.category_id

        if request.name is not None:
            product.name = request.name.strip()
        if request.sku is not None:
            product.sku = request.sku
        if request.barcode is not None:
            product.barcode = request.barcode
        if request.description is not None:
            product.description = request.description
        if request.image_url is not None:
            product.image_url = request.image_url
        if request.purchase_price is not None:
            product.purchase_price = request.purchase_price
        if request.selling_price is not None:
            product.selling_price = request.selling_price
        if request.mrp is not None:
            product.mrp = request.mrp
        if request.unit is not None:
            product.unit = request.unit
        if request.min_stock_level is not None:
            product.min_stock_level = request.min_stock_level
        if request.is_active is not None:
            product.is_active = request.is_active

        # Update dynamic attributes
        if request.attributes is not None:
            # Merge with existing attributes so we do not lose category-specific information
            merged_attributes = dict(product.attributes or {})
            merged_attributes.update(request.attributes)
            product.attributes = merged_attributes

            # Resync ProductAttribute rows
            db.query(ProductAttribute).filter(ProductAttribute.product_id == product.id).delete()
            for k, v in merged_attributes.items():
                if v is not None:
                    db.add(ProductAttribute(product_id=product.id, field_name=k, field_value=str(v)))

        db.commit()
        db.refresh(product)
        return product

    @staticmethod
    def delete_product(db: Session, store_id: int, product_id: int) -> dict:
        product = ProductService.get_product(db, store_id, product_id)
        # Soft delete
        product.is_active = False
        db.commit()
        return {"message": "Product deactivated successfully."}
