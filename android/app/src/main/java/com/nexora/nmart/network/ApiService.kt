package com.nexora.nmart.network

import com.nexora.nmart.core.constants.ApiEndpoints
import com.nexora.nmart.data.model.ApiMessageResponse
import com.nexora.nmart.data.model.ForgotPasswordRequest
import com.nexora.nmart.data.model.LoginRequest
import com.nexora.nmart.data.model.RegisterRequest
import com.nexora.nmart.data.model.TokenResponse
import com.nexora.nmart.data.model.UserResponse
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST

/**
 * Retrofit interface representing all existing NMART FastAPI backend REST endpoints.
 */
interface ApiService {

    /**
     * Authenticate merchant and obtain JWT token.
     * FastAPI: POST /api/auth/login
     */
    @POST(ApiEndpoints.LOGIN)
    suspend fun login(@Body request: LoginRequest): Response<TokenResponse>

    /**
     * Register new merchant account and obtain JWT token.
     * FastAPI: POST /api/auth/register
     */
    @POST(ApiEndpoints.REGISTER)
    suspend fun register(@Body request: RegisterRequest): Response<TokenResponse>

    /**
     * Fetch authenticated merchant profile using Bearer JWT.
     * FastAPI: GET /api/auth/me
     */
    @GET(ApiEndpoints.ME)
    suspend fun getProfile(): Response<UserResponse>

    /**
     * Request password reset instructions.
     * FastAPI: POST /api/auth/forgot-password
     */
    @POST(ApiEndpoints.FORGOT_PASSWORD)
    suspend fun forgotPassword(@Body request: ForgotPasswordRequest): Response<ApiMessageResponse>

    /**
     * Revoke active JWT token and clear server session cache.
     * FastAPI: POST /api/auth/logout
     */
    @POST(ApiEndpoints.LOGOUT)
    suspend fun logout(): Response<ApiMessageResponse>

    /**
     * Verify server health and Redis status.
     * FastAPI: GET /health
     */
    @GET(ApiEndpoints.HEALTH)
    suspend fun healthCheck(): Response<Map<String, Any>>

    /**
     * Fetch store dashboard summary & live KPIs.
     * FastAPI: GET /api/reports/dashboard-summary
     */
    @GET(ApiEndpoints.DASHBOARD_SUMMARY)
    suspend fun getDashboardSummary(): Response<com.nexora.nmart.data.model.DashboardSummaryResponse>

    /**
     * Fetch authenticated merchant's store details.
     * FastAPI: GET /api/stores/my-store
     */
    @GET(ApiEndpoints.MY_STORE)
    suspend fun getMyStore(): Response<com.nexora.nmart.data.model.StoreDto>

    /**
     * List all available store categories.
     * FastAPI: GET /api/categories/
     */
    @GET(ApiEndpoints.CATEGORIES)
    suspend fun getCategories(): Response<List<com.nexora.nmart.data.model.CategoryDto>>

    /**
     * List products in store.
     * FastAPI: GET /api/products/
     */
    @GET(ApiEndpoints.PRODUCTS)
    suspend fun getProducts(): Response<List<com.nexora.nmart.data.model.ProductDto>>
}
