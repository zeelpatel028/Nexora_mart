package com.nexora.nmart.data.repository

import com.nexora.nmart.data.local.TokenManager
import com.nexora.nmart.data.local.UserSessionManager
import com.nexora.nmart.data.model.ApiMessageResponse
import com.nexora.nmart.data.model.ForgotPasswordRequest
import com.nexora.nmart.data.model.LoginRequest
import com.nexora.nmart.data.model.RegisterRequest
import com.nexora.nmart.data.model.TokenResponse
import com.nexora.nmart.data.model.UserResponse
import com.nexora.nmart.network.ApiClient
import com.nexora.nmart.network.NetworkResult
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

/**
 * Repository mediating authentication operations between FastAPI network client and local session store.
 */
class AuthRepository(
    private val apiClient: ApiClient,
    private val tokenManager: TokenManager,
    private val sessionManager: UserSessionManager
) {
    val currentUser = sessionManager.currentUser
    val isAuthenticated = sessionManager.isAuthenticated

    /**
     * Authenticates merchant via FastAPI POST /api/auth/login.
     * Persists token securely in EncryptedSharedPreferences and caches user profile.
     */
    suspend fun login(request: LoginRequest): NetworkResult<TokenResponse> = withContext(Dispatchers.IO) {
        try {
            val response = apiClient.getApiService().login(request)
            if (response.isSuccessful && response.body() != null) {
                val tokenResponse = response.body()!!
                tokenManager.saveToken(tokenResponse.token)
                sessionManager.saveUser(tokenResponse.user)
                NetworkResult.Success(tokenResponse)
            } else {
                NetworkResult.parseError(response)
            }
        } catch (e: Exception) {
            NetworkResult.Error("Unable to reach NMART server: ${e.localizedMessage ?: "Connection error"}")
        }
    }

    /**
     * Registers new merchant account via FastAPI POST /api/auth/register.
     */
    suspend fun register(request: RegisterRequest): NetworkResult<TokenResponse> = withContext(Dispatchers.IO) {
        try {
            val response = apiClient.getApiService().register(request)
            if (response.isSuccessful && response.body() != null) {
                val tokenResponse = response.body()!!
                tokenManager.saveToken(tokenResponse.token)
                sessionManager.saveUser(tokenResponse.user)
                NetworkResult.Success(tokenResponse)
            } else {
                NetworkResult.parseError(response)
            }
        } catch (e: Exception) {
            NetworkResult.Error("Unable to register account: ${e.localizedMessage ?: "Connection error"}")
        }
    }

    /**
     * Refreshes user profile via FastAPI GET /api/auth/me using Bearer JWT token.
     */
    suspend fun fetchProfile(): NetworkResult<UserResponse> = withContext(Dispatchers.IO) {
        try {
            val response = apiClient.getApiService().getProfile()
            if (response.isSuccessful && response.body() != null) {
                val user = response.body()!!
                sessionManager.saveUser(user)
                NetworkResult.Success(user)
            } else {
                NetworkResult.parseError(response)
            }
        } catch (e: Exception) {
            NetworkResult.Error("Failed to fetch profile: ${e.localizedMessage ?: "Connection error"}")
        }
    }

    /**
     * Requests password reset instructions via FastAPI POST /api/auth/forgot-password.
     */
    suspend fun forgotPassword(email: String): NetworkResult<ApiMessageResponse> = withContext(Dispatchers.IO) {
        try {
            val response = apiClient.getApiService().forgotPassword(ForgotPasswordRequest(email))
            if (response.isSuccessful && response.body() != null) {
                NetworkResult.Success(response.body()!!)
            } else {
                NetworkResult.parseError(response)
            }
        } catch (e: Exception) {
            NetworkResult.Error("Failed to submit request: ${e.localizedMessage ?: "Connection error"}")
        }
    }

    /**
     * Terminates merchant session, calls FastAPI POST /api/auth/logout to invalidate Redis token cache,
     * and wipes local encrypted storage.
     */
    suspend fun logout(): NetworkResult<Boolean> = withContext(Dispatchers.IO) {
        try {
            if (tokenManager.hasToken()) {
                apiClient.getApiService().logout()
            }
        } catch (_: Exception) {
            // Ignore network errors during logout; local session must still be wiped
        } finally {
            sessionManager.clearSession()
        }
        NetworkResult.Success(true)
    }

    /**
     * Checks server health via FastAPI GET /health.
     */
    suspend fun checkHealth(): NetworkResult<Map<String, Any>> = withContext(Dispatchers.IO) {
        try {
            val response = apiClient.getApiService().healthCheck()
            if (response.isSuccessful && response.body() != null) {
                NetworkResult.Success(response.body()!!)
            } else {
                NetworkResult.parseError(response)
            }
        } catch (e: Exception) {
            NetworkResult.Error("Server unreachable: ${e.localizedMessage ?: "Offline"}")
        }
    }
}
