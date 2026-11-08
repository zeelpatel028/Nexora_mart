from typing import List, Optional
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

# --- NEXORA MART ANALYTICS DASHBOARD SPECIFICATION ---

class AnalyticsStatCard(BaseModel):
    id: str
    title: str
    value: str
    trend: Optional[str] = None
    is_positive: bool = True
    subtitle: Optional[str] = None
    color_scheme: str  # 'orange', 'red', 'blue', 'green'

class SalesChartPoint(BaseModel):
    day: str
    sales: float
    orders: int

class CategorySalesSegment(BaseModel):
    name: str
    percentage: int
    color: str
    sales: Optional[float] = None

class RecentActivity(BaseModel):
    id: str
    title: str
    description: str
    timestamp: str
    icon: str

class LowStockProduct(BaseModel):
    id: int
    name: str
    stock: str
    status: str
    status_color: str  # 'danger' (red) or 'warning' (orange/amber)
    category: Optional[str] = None

class AnalyticsOverviewResponse(BaseModel):
    store_name: str
    greeting: str
    date_display: str
    stats: List[AnalyticsStatCard]
    sales_overview: List[SalesChartPoint]
    category_sales: List[CategorySalesSegment]
    category_total_sales: str
    recent_activities: List[RecentActivity]
    low_stock_products: List[LowStockProduct]
