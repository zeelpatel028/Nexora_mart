import datetime
from typing import List, Optional, Dict, Any, Tuple
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from ..models.product import Product, ProductAttribute, ProductAttributeValue
from ..models.inventory import ProductStock, StockAdjustment
from ..models.store import Store, ShopCategory
from ..models.user import User
from ..schemas.product_schema import ProductCreate, ProductUpdate
from ..category_rules.rule_registry import CategoryRuleRegistry
from ..store_types.registry import StoreTypeRegistry

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
            query = query.filter(
                or_(
                    Product.shop_category_id == category_id,
                    Product.product_category_id == category_id
                )
            )

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
        fields = db.query(ProductAttribute).filter(
            or_(
                ProductAttribute.shop_category_id == category_id,
                ProductAttribute.shop_category_id == None
            )
        ).all()
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
                    attributes[f.field_name] = str(val) if not isinstance(val, (int, float, bool, dict, list)) else val
                else:
                    errors.append(f"Field '{f.field_label}' is required for this category.")

        if errors:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="; ".join(errors)
            )

    @staticmethod
    def _save_attribute_values(db: Session, store_id: int, product_id: int, attributes: Dict[str, Any]):
        """Persist key-value attributes into product_attribute_values linking to product_attributes."""
        for field_name, val in attributes.items():
            if val is None or val == "":
                continue
            # Find or auto-create attribute definition
            attr_def = db.query(ProductAttribute).filter(ProductAttribute.field_name == field_name).first()
            if not attr_def:
                attr_def = ProductAttribute(
                    field_name=field_name,
                    field_label=field_name.replace("_", " ").title(),
                    field_type="text",
                    is_required=False
                )
                db.add(attr_def)
                db.flush()

            pav = ProductAttributeValue(
                store_id=store_id,
                product_id=product_id,
                attribute_id=attr_def.id,
                attribute_value=str(val)
            )
            db.add(pav)

    @staticmethod
    def create_product(db: Session, store: Store, current_user: User, request: ProductCreate) -> Product:
        category_id = request.category_id or store.shop_category_id
        category = db.query(ShopCategory).filter(ShopCategory.id == category_id).first()
        if not category:
            category = db.query(ShopCategory).first()
            category_id = category.id if category else 1

        attributes = request.attributes or {}

        # Validate Store Type specific rules
        store_strategy = StoreTypeRegistry.get_strategy_for_store(store)
        is_valid, err_msg = store_strategy.validate_product_data(
            request.model_dump(),
            attributes,
            is_create=True
        )
        if not is_valid:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=err_msg
            )

        # Validate category rules
        if category:
            ProductService.validate_category_fields(db, category.id, attributes, request)
            rule = CategoryRuleRegistry.get_rule_for_category(category.code)
            validation_res = rule.validate_product_data(request.model_dump(), attributes)
            if not validation_res.is_valid:
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail="; ".join(validation_res.errors)
                )

        sku = request.sku
        if not sku:
            cat_code = category.code.upper()[:3] if category else "GEN"
            sku = f"SKU-{cat_code}-{store.id}-{int(db.query(Product).filter(Product.store_id == store.id).count()) + 1:04d}"

        new_product = Product(
            store_id=store.id,
            shop_category_id=category_id,
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
            has_variants=bool(request.variants or request.has_variants)
        )
        db.add(new_product)
        db.flush()

        # Save dynamic attribute values
        ProductService._save_attribute_values(db, store.id, new_product.id, attributes)

        # Initial stock in product_stock
        initial_stock = float(request.initial_stock or 0.0)
        batch_num = attributes.get("batch_number")
        expiry_date_raw = attributes.get("expiry_date")
        exp_dt = None
        if expiry_date_raw:
            try:
                if isinstance(expiry_date_raw, str):
                    exp_dt = datetime.datetime.strptime(expiry_date_raw[:10], "%Y-%m-%d")
            except Exception:
                pass

        stock_rec = ProductStock(
            store_id=store.id,
            product_id=new_product.id,
            quantity=initial_stock,
            reorder_level=request.min_stock_level or 5.0,
            batch_number=batch_num,
            expiry_date=exp_dt
        )
        db.add(stock_rec)

        if initial_stock > 0:
            adj = StockAdjustment(
                store_id=store.id,
                product_id=new_product.id,
                adjustment_type="ADD",
                quantity=initial_stock,
                previous_quantity=0.0,
                new_quantity=initial_stock,
                reason="Initial stock entry on product creation",
                adjusted_by=current_user.id
            )
            db.add(adj)

        db.commit()
        db.refresh(new_product)
        return new_product

    @staticmethod
    def update_product(db: Session, store: Store, product_id: int, request: ProductUpdate) -> Product:
        product = ProductService.get_product(db, store.id, product_id)

        if request.category_id and request.category_id != product.shop_category_id:
            category = db.query(ShopCategory).filter(ShopCategory.id == request.category_id).first()
            if not category:
                raise HTTPException(status_code=400, detail="Invalid category ID")
            product.shop_category_id = request.category_id

        if request.name is not None and request.name.strip():
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

        if request.attributes is not None:
            # Delete old and insert updated
            db.query(ProductAttributeValue).filter(ProductAttributeValue.product_id == product.id).delete()
            ProductService._save_attribute_values(db, store.id, product.id, request.attributes)

        db.commit()
        db.refresh(product)
        return product

    @staticmethod
    def delete_product(db: Session, store_id: int, product_id: int) -> dict:
        product = ProductService.get_product(db, store_id, product_id)
        product.is_active = False
        db.commit()
        return {"message": "Product deactivated successfully."}
