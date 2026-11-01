from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from ..models.category import Category, CategoryField
from ..schemas.category_schema import CategoryCreate, CategoryUpdate, CategoryFieldCreate, CategoryFieldUpdate

class CategoryService:
    @staticmethod
    def get_all_categories(db: Session, active_only: bool = True) -> List[Category]:
        query = db.query(Category)
        if active_only:
            query = query.filter(Category.is_active == True)
        return query.order_by(Category.name).all()

    @staticmethod
    def get_category_by_id(db: Session, category_id: int) -> Category:
        category = db.query(Category).filter(Category.id == category_id).first()
        if not category:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Category with ID {category_id} not found."
            )
        return category

    @staticmethod
    def get_category_fields(db: Session, category_id: int) -> List[CategoryField]:
        CategoryService.get_category_by_id(db, category_id)
        return db.query(CategoryField).filter(
            CategoryField.category_id == category_id
        ).order_by(CategoryField.display_order).all()

    @staticmethod
    def create_category(db: Session, request: CategoryCreate) -> Category:
        # Check uniqueness of name and code
        existing = db.query(Category).filter(
            (Category.name.ilike(request.name)) | (Category.code == request.code.lower())
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A category with this name or code already exists."
            )

        new_category = Category(
            name=request.name.strip(),
            code=request.code.strip().lower(),
            description=request.description,
            icon=request.icon or "storefront",
            is_system=False,
            is_active=True
        )
        db.add(new_category)
        db.flush()

        if request.fields:
            for idx, f in enumerate(request.fields):
                field_obj = CategoryField(
                    category_id=new_category.id,
                    field_name=f.field_name.strip().lower().replace(" ", "_"),
                    field_label=f.field_label.strip(),
                    field_type=f.field_type.strip().lower(),
                    is_required=f.is_required,
                    options=f.options,
                    default_value=f.default_value,
                    placeholder=f.placeholder,
                    help_text=f.help_text,
                    display_order=f.display_order or (idx + 1),
                    is_variant_field=f.is_variant_field
                )
                db.add(field_obj)

        db.commit()
        db.refresh(new_category)
        return new_category

    @staticmethod
    def update_category(db: Session, category_id: int, request: CategoryUpdate) -> Category:
        category = CategoryService.get_category_by_id(db, category_id)
        if request.name is not None:
            category.name = request.name.strip()
        if request.description is not None:
            category.description = request.description
        if request.icon is not None:
            category.icon = request.icon
        if request.is_active is not None:
            category.is_active = request.is_active

        db.commit()
        db.refresh(category)
        return category

    @staticmethod
    def delete_category(db: Session, category_id: int) -> dict:
        category = CategoryService.get_category_by_id(db, category_id)
        if category.is_system:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Default system store categories cannot be deleted."
            )
        # Check if stores or products are using this category
        if category.stores or category.products:
            # Soft delete
            category.is_active = False
            db.commit()
            return {"message": "Category has linked stores/products; marked as inactive instead."}

        db.delete(category)
        db.commit()
        return {"message": "Category deleted successfully."}

    @staticmethod
    def add_category_field(db: Session, category_id: int, request: CategoryFieldCreate) -> CategoryField:
        category = CategoryService.get_category_by_id(db, category_id)
        fname = request.field_name.strip().lower().replace(" ", "_")
        existing = db.query(CategoryField).filter(
            CategoryField.category_id == category.id,
            CategoryField.field_name == fname
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Field '{fname}' already exists in this category."
            )

        new_field = CategoryField(
            category_id=category.id,
            field_name=fname,
            field_label=request.field_label.strip(),
            field_type=request.field_type.strip().lower(),
            is_required=request.is_required,
            options=request.options,
            default_value=request.default_value,
            placeholder=request.placeholder,
            help_text=request.help_text,
            display_order=request.display_order,
            is_variant_field=request.is_variant_field
        )
        db.add(new_field)
        db.commit()
        db.refresh(new_field)
        return new_field

    @staticmethod
    def update_category_field(db: Session, field_id: int, request: CategoryFieldUpdate) -> CategoryField:
        field = db.query(CategoryField).filter(CategoryField.id == field_id).first()
        if not field:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Category field {field_id} not found."
            )
        if request.field_label is not None:
            field.field_label = request.field_label
        if request.field_type is not None:
            field.field_type = request.field_type
        if request.is_required is not None:
            field.is_required = request.is_required
        if request.options is not None:
            field.options = request.options
        if request.default_value is not None:
            field.default_value = request.default_value
        if request.placeholder is not None:
            field.placeholder = request.placeholder
        if request.display_order is not None:
            field.display_order = request.display_order
        if request.is_variant_field is not None:
            field.is_variant_field = request.is_variant_field

        db.commit()
        db.refresh(field)
        return field

    @staticmethod
    def delete_category_field(db: Session, field_id: int) -> dict:
        field = db.query(CategoryField).filter(CategoryField.id == field_id).first()
        if not field:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Category field {field_id} not found."
            )
        db.delete(field)
        db.commit()
        return {"message": "Category field deleted successfully."}

