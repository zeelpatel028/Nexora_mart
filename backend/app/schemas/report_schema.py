from typing import List, Dict, Any, Optional
from pydantic import BaseModel

class DashboardSummaryResponse(BaseModel):
    store_name: str
    category_name: str
    total_sales: float = 0.0
    today_sales: float = 0.0
    total_orders: int = 0
    active_products: int = 0
    low_stock_count: int = 0
    expiring_soon_count: int = 0
    total_customers: int = 0
    total_expenses: float = 0.0
    net_profit: float = 0.0
    currency: str = "USD"

class SalesAnalyticsItem(BaseModel):
    date: str
    sales: float
    orders: int

class SalesAnalyticsResponse(BaseModel):
    items: List[SalesAnalyticsItem] = []
    total_revenue: float = 0.0
    total_orders: int = 0

class CategoryPerformanceItem(BaseModel):
    category_name: str
    products_count: int
    units_sold: float
    revenue: float

class CategoryPerformanceResponse(BaseModel):
    categories: List[CategoryPerformanceItem] = []

class InventoryValuationResponse(BaseModel):
    total_products: int
    total_inventory_items: float
    total_cost_valuation: float
    total_retail_valuation: float
    potential_profit: float

