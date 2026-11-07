"""
Category model backward-compatibility module.
Exposes ShopCategory as Category, and ProductAttribute as CategoryField.
"""
from .store import ShopCategory
from .product import ProductCategory, ProductAttribute

Category = ShopCategory
CategoryField = ProductAttribute

__all__ = ["Category", "CategoryField", "ShopCategory", "ProductCategory", "ProductAttribute"]
