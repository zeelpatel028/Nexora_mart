package com.nexora.nmart.core.constants

/**
 * REST API Endpoints matching FastAPI router prefix /api
 */
object ApiEndpoints {
    const val LOGIN = "auth/login"
    const val REGISTER = "auth/register"
    const val ME = "auth/me"
    const val FORGOT_PASSWORD = "auth/forgot-password"
    const val LOGOUT = "auth/logout"
    const val HEALTH = "/health"

    // Multi-Category Store System Endpoints
    const val MY_STORE = "stores/my-store"
    const val CATEGORIES = "categories/"
    const val PRODUCTS = "products/"
    const val INVENTORY = "inventory/"
    const val SALES = "sales/"
    const val PURCHASES = "purchases/"
    const val DASHBOARD_SUMMARY = "reports/dashboard-summary"
}
