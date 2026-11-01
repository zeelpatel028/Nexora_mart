package com.nexora.nmart.data.model

import com.google.gson.annotations.SerializedName

/**
 * Merchant metrics for Dashboard screen mirroring web client stats.
 */
data class DashboardStats(
    val totalOrders: String = "0",
    val grossRevenue: String = "$0.00",
    val activeProducts: String = "0",
    val systemHealth: String = "100%",
    val isRedisActive: Boolean = true,
    val storeName: String = "My Store",
    val categoryName: String = "Retail Store",
    val lowStockCount: Int = 0
)

data class DashboardSummaryResponse(
    @SerializedName("store_name") val storeName: String = "",
    @SerializedName("category_name") val categoryName: String = "",
    @SerializedName("total_sales") val totalSales: Double = 0.0,
    @SerializedName("today_sales") val todaySales: Double = 0.0,
    @SerializedName("total_orders") val totalOrders: Int = 0,
    @SerializedName("active_products") val activeProducts: Int = 0,
    @SerializedName("low_stock_count") val lowStockCount: Int = 0,
    @SerializedName("expiring_soon_count") val expiringSoonCount: Int = 0,
    @SerializedName("total_customers") val totalCustomers: Int = 0,
    @SerializedName("total_expenses") val totalExpenses: Double = 0.0,
    @SerializedName("net_profit") val netProfit: Double = 0.0,
    @SerializedName("currency") val currency: String = "USD"
)

data class CategoryDto(
    @SerializedName("id") val id: Int,
    @SerializedName("name") val name: String,
    @SerializedName("code") val code: String,
    @SerializedName("icon") val icon: String? = null,
    @SerializedName("description") val description: String? = null
)

data class StoreDto(
    @SerializedName("id") val id: Int,
    @SerializedName("name") val name: String,
    @SerializedName("category_id") val categoryId: Int,
    @SerializedName("currency") val currency: String = "USD"
)

data class ProductDto(
    @SerializedName("id") val id: Int,
    @SerializedName("name") val name: String,
    @SerializedName("sku") val sku: String,
    @SerializedName("selling_price") val sellingPrice: Double,
    @SerializedName("unit") val unit: String,
    @SerializedName("category_name") val categoryName: String? = null,
    @SerializedName("current_stock") val currentStock: Double = 0.0
)
