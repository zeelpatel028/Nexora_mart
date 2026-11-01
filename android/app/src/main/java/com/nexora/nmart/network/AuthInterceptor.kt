package com.nexora.nmart.network

import com.nexora.nmart.data.local.TokenManager
import okhttp3.Interceptor
import okhttp3.Response

/**
 * OkHttp Interceptor that injects Bearer JWT authentication tokens into outgoing requests
 * and intercepts HTTP 401 Unauthorized responses to invalidate expired sessions.
 * Never logs sensitive tokens.
 */
class AuthInterceptor(
    private val tokenManager: TokenManager,
    private val onUnauthorized: (() -> Unit)? = null
) : Interceptor {

    override fun intercept(chain: Interceptor.Chain): Response {
        val originalRequest = chain.request()
        val requestBuilder = originalRequest.newBuilder()
            .addHeader("Accept", "application/json")

        // Inject Bearer token if present and not already specified
        val token = tokenManager.getToken()
        if (!token.isNullOrBlank() && originalRequest.header("Authorization") == null) {
            requestBuilder.addHeader("Authorization", "Bearer $token")
        }

        val response = chain.proceed(requestBuilder.build())

        // Handle expired session or revoked token
        if (response.code == 401) {
            tokenManager.clearToken()
            onUnauthorized?.invoke()
        }

        return response
    }
}
