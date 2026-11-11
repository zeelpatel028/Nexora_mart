from typing import List
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from ..models.brand import Brand
from ..schemas.brand_schema import BrandCreate, BrandUpdate

class BrandService:
    @staticmethod
    def get_brands(db: Session, store_id: int) -> List[Brand]:
        return db.query(Brand).filter(
            Brand.store_id == store_id,
            Brand.is_active == True
        ).order_by(Brand.name.asc()).all()

    @staticmethod
    def get_brand(db: Session, store_id: int, brand_id: int) -> Brand:
        brand = db.query(Brand).filter(Brand.id == brand_id).first()
        if not brand:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Brand not found.")
        if brand.store_id != store_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to requested brand.")
        return brand

    @staticmethod
    def create_brand(db: Session, store_id: int, request: BrandCreate) -> Brand:
        existing = db.query(Brand).filter(
            Brand.store_id == store_id,
            Brand.name == request.name.strip()
        ).first()
        if existing:
            if not existing.is_active:
                existing.is_active = True
                db.commit()
                db.refresh(existing)
                return existing
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Brand already exists in your store.")

        brand = Brand(
            store_id=store_id,
            name=request.name.strip(),
            code=request.code.strip() if request.code else None,
            description=request.description,
            logo_url=request.logo_url,
            is_active=request.is_active
        )
        db.add(brand)
        db.commit()
        db.refresh(brand)
        return brand

    @staticmethod
    def update_brand(db: Session, store_id: int, brand_id: int, request: BrandUpdate) -> Brand:
        brand = BrandService.get_brand(db, store_id, brand_id)
        if request.name is not None:
            brand.name = request.name.strip()
        if request.code is not None:
            brand.code = request.code.strip()
        if request.description is not None:
            brand.description = request.description
        if request.logo_url is not None:
            brand.logo_url = request.logo_url
        if request.is_active is not None:
            brand.is_active = request.is_active
        db.commit()
        db.refresh(brand)
        return brand

    @staticmethod
    def delete_brand(db: Session, store_id: int, brand_id: int):
        brand = BrandService.get_brand(db, store_id, brand_id)
        brand.is_active = False
        db.commit()
        return {"status": "success", "message": f"Brand '{brand.name}' deactivated."}

