package com.nexora.nmart.ui.dashboard

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.nexora.nmart.data.model.DashboardStats
import com.nexora.nmart.data.model.UserResponse
import com.nexora.nmart.data.repository.AuthRepository
import com.nexora.nmart.network.ApiClient
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import java.text.NumberFormat
import java.util.Locale

class DashboardViewModel(
    private val repository: AuthRepository,
    private val apiClient: ApiClient? = null
) : ViewModel() {

    val currentUser: StateFlow<UserResponse?> = repository.currentUser

    private val _isRefreshing = MutableStateFlow(false)
    val isRefreshing: StateFlow<Boolean> = _isRefreshing.asStateFlow()

    private val _stats = MutableStateFlow(DashboardStats())
    val stats: StateFlow<DashboardStats> = _stats.asStateFlow()

    fun refreshProfile() {
        viewModelScope.launch {
            try {
                _isRefreshing.value = true
                repository.fetchProfile()
                fetchLiveStats()
            } catch (_: Throwable) {
                // Ignore background network failure on profile refresh
            } finally {
                _isRefreshing.value = false
            }
        }
    }

    private suspend fun fetchLiveStats() {
        try {
            val client = apiClient ?: return
            val response = client.service.getDashboardSummary()
            if (response.isSuccessful) {
                val data = response.body() ?: return
                val currencyFormat = NumberFormat.getCurrencyInstance(Locale.US)
                _stats.value = DashboardStats(
                    totalOrders = NumberFormat.getNumberInstance(Locale.US).format(data.totalOrders),
                    grossRevenue = currencyFormat.format(data.totalSales),
                    activeProducts = data.activeProducts.toString(),
                    systemHealth = "99.98%",
                    isRedisActive = true,
                    storeName = data.storeName,
                    categoryName = data.categoryName,
                    lowStockCount = data.lowStockCount
                )
            }
        } catch (_: Throwable) {
            // Keep default stats on network error
        }
    }

    fun logout(onLoggedOut: () -> Unit) {
        viewModelScope.launch {
            try {
                repository.logout()
            } catch (_: Throwable) {
            } finally {
                onLoggedOut()
            }
        }
    }
}
