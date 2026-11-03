from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from ..database.connection import get_db
from ..middleware.auth_middleware import get_current_user
from ..models.user import User
from ..schemas.report_schema import (
    DashboardSummaryResponse,
    SalesAnalyticsResponse,
    CategoryPerformanceResponse,
    InventoryValuationResponse,
    AnalyticsOverviewResponse
)
from ..services.report_service import ReportService
from ..services.store_service import StoreService

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.get("/dashboard-summary", response_model=DashboardSummaryResponse)
def get_dashboard_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns store overview, sales metrics, inventory counts, profit estimates.
    Isolates data to the current authenticated merchant's store.
    """
    store = StoreService.get_user_store(db, current_user)
    return ReportService.get_dashboard_summary(db, store)

@router.get("/sales-analytics", response_model=SalesAnalyticsResponse)
def get_sales_analytics(
    days: int = Query(14, ge=1, le=90),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns daily sales trends and totals for the specified period.
    """
    store = StoreService.get_user_store(db, current_user)
    return ReportService.get_sales_analytics(db, store, days=days)

@router.get("/category-performance", response_model=CategoryPerformanceResponse)
def get_category_performance(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns sales volume and revenue broken down by product categories.
    """
    store = StoreService.get_user_store(db, current_user)
    return ReportService.get_category_performance(db, store)

@router.get("/inventory-valuation", response_model=InventoryValuationResponse)
def get_inventory_valuation(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns total inventory cost, retail valuation, and potential profit margins.
    """
    store = StoreService.get_user_store(db, current_user)
    return ReportService.get_inventory_valuation(db, store)

@router.get("/analytics-overview", response_model=AnalyticsOverviewResponse)
def get_analytics_overview(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns high-fidelity live dashboard analytics overview:
    KPI stat cards, weekly combo chart metrics, category sales distribution,
    recent activities, and low stock inventory alerts.
    """
    store = StoreService.get_user_store(db, current_user)
    return ReportService.get_analytics_overview(db, store, user=current_user)


