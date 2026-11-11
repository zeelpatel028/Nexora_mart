from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from ..models.category import Category
from ..schemas.category_schema import CategoryCreate, CategoryUpdate

class CategoryService:
    @staticmethod
    def get_all_categories(db: Session, store_id: Optional[int] = None, active_only: bool = True) -> List[Category]:
        query = db.query(Category)
        if store_id is not None:
            query = query.filter(Category.store_id == store_id)
        if active_only:
            query = query.filter(Category.is_active == True)
        return query.order_by(Category.name.asc()).all()

    @staticmethod
    def get_category_by_id(db: Session, category_id: int, store_id: Optional[int] = None) -> Category:
        category = db.query(Category).filter(Category.id == category_id).first()
        if not category:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Category with ID {category_id} not found."
            )
        if store_id is not None and category.store_id != store_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to requested category from another store."
            )
        return category

    @staticmethod
    def create_category(db: Session, store_id: int, request: CategoryCreate) -> Category:
        existing = db.query(Category).filter(
            Category.store_id == store_id,
            (Category.name.ilike(request.name)) | (Category.code == request.code.lower())
        ).first()
        if existing:
            if not existing.is_active:
                existing.is_active = True
                db.commit()
                db.refresh(existing)
                return existing
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A category with this name or code already exists in your store."
            )

        new_category = Category(
            store_id=store_id,
            name=request.name.strip(),
            code=request.code.strip().lower(),
            description=request.description,
            icon=request.icon or "storefront",
            is_active=True
        )
        db.add(new_category)
        db.commit()
        db.refresh(new_category)
        return new_category

    @staticmethod
    def update_category(db: Session, store_id: int, category_id: int, request: CategoryUpdate) -> Category:
        category = CategoryService.get_category_by_id(db, category_id, store_id=store_id)
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
    def delete_category(db: Session, store_id: int, category_id: int):
        category = CategoryService.get_category_by_id(db, category_id, store_id=store_id)
        category.is_active = False
        db.commit()
        return {"status": "success", "message": f"Category '{category.name}' deactivated."}
