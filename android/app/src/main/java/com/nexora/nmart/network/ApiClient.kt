package com.nexora.nmart.network

import android.util.Log
import com.nexora.nmart.core.config.AppConfig
import com.nexora.nmart.data.local.TokenManager
import okhttp3.HttpUrl.Companion.toHttpUrlOrNull
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

private const val TAG = "ApiClient"

/**
 * Centralized networking client configuring OkHttp, Retrofit, and dynamic endpoint resolution.
 * Completely guarded against invalid URLs and connection initialization crashes.
 */
class ApiClient(
    private val tokenManager: TokenManager,
    private val onUnauthorized: (() -> Unit)? = null
) {
    private var currentBaseUrl: String = AppConfig.getBaseUrl()
    private var retrofitInstance: Retrofit? = null
    private var apiServiceInstance: ApiService? = null

    private val okHttpClient: OkHttpClient by lazy {
        val loggingInterceptor = HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BASIC
            redactHeader("Authorization")
        }

        OkHttpClient.Builder()
            .connectTimeout(AppConfig.CONNECT_TIMEOUT_SECONDS, TimeUnit.SECONDS)
            .readTimeout(AppConfig.READ_TIMEOUT_SECONDS, TimeUnit.SECONDS)
            .writeTimeout(AppConfig.WRITE_TIMEOUT_SECONDS, TimeUnit.SECONDS)
            .addInterceptor(AuthInterceptor(tokenManager, onUnauthorized))
            .addInterceptor(loggingInterceptor)
            .retryOnConnectionFailure(true)
            .build()
    }

    private fun buildRetrofit(baseUrl: String): Retrofit {
        val sanitizedUrl = try {
            val parsed = baseUrl.toHttpUrlOrNull()
            if (parsed != null) baseUrl else AppConfig.PRODUCTION_BASE_URL
        } catch (t: Throwable) {
            Log.w("ApiClient", "Invalid base URL '$baseUrl', defaulting to production", t)
            AppConfig.PRODUCTION_BASE_URL
        }

        return Retrofit.Builder()
            .baseUrl(sanitizedUrl)
            .client(okHttpClient)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
    }

    /**
     * Obtains the ApiService instance, rebuilding Retrofit if the user changed the base URL in settings.
     */
    @Synchronized
    fun getApiService(): ApiService {
        val latestBaseUrl = AppConfig.getBaseUrl()
        if (apiServiceInstance == null || latestBaseUrl != currentBaseUrl) {
            currentBaseUrl = latestBaseUrl
            retrofitInstance = buildRetrofit(latestBaseUrl)
            apiServiceInstance = retrofitInstance!!.create(ApiService::class.java)
        }
        return apiServiceInstance!!
    }

    /**
     * Force recreates the Retrofit client (e.g. after environment switch in SettingsScreen).
     */
    @Synchronized
    fun refreshClient() {
        currentBaseUrl = AppConfig.getBaseUrl()
        retrofitInstance = buildRetrofit(currentBaseUrl)
        apiServiceInstance = retrofitInstance!!.create(ApiService::class.java)
    }
}
