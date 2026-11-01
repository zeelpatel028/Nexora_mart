package com.nexora.nmart.di

import android.annotation.SuppressLint
import android.content.Context
import android.util.Log
import com.nexora.nmart.core.config.AppConfig
import com.nexora.nmart.data.local.TokenManager
import com.nexora.nmart.data.local.UserSessionManager
import com.nexora.nmart.data.repository.AuthRepository
import com.nexora.nmart.network.ApiClient

/**
 * Service locator pattern providing dependency injection for the application
 * without requiring heavy runtime reflection or code generators.
 * Fully thread-safe, null-safe, and crash-resilient.
 */
@SuppressLint("StaticFieldLeak")
object ServiceLocator {
    private const val TAG = "ServiceLocator"

    @Volatile
    private var applicationContext: Context? = null

    @Volatile
    private var _tokenManager: TokenManager? = null
    val tokenManager: TokenManager
        get() = _tokenManager ?: synchronized(this) {
            _tokenManager ?: TokenManager(requireContext()).also { _tokenManager = it }
        }

    @Volatile
    private var _userSessionManager: UserSessionManager? = null
    val userSessionManager: UserSessionManager
        get() = _userSessionManager ?: synchronized(this) {
            _userSessionManager ?: UserSessionManager(requireContext(), tokenManager).also { _userSessionManager = it }
        }

    @Volatile
    private var _apiClient: ApiClient? = null
    val apiClient: ApiClient
        get() = _apiClient ?: synchronized(this) {
            _apiClient ?: ApiClient(tokenManager) {
                userSessionManager.clearSession()
            }.also { _apiClient = it }
        }

    @Volatile
    private var _authRepository: AuthRepository? = null
    val authRepository: AuthRepository
        get() = _authRepository ?: synchronized(this) {
            _authRepository ?: AuthRepository(apiClient, tokenManager, userSessionManager).also { _authRepository = it }
        }

    fun initialize(context: Context) {
        val appContext = context.applicationContext ?: context
        applicationContext = appContext
        try {
            AppConfig.initialize(appContext)
        } catch (t: Throwable) {
            Log.w(TAG, "AppConfig initialization error: ${t.message}", t)
        }
    }

    fun isInitialized(): Boolean = applicationContext != null

    private fun requireContext(): Context {
        applicationContext?.let { return it }
        
        Log.w(TAG, "ServiceLocator accessed before initialize(); attempting emergency resolution")
        try {
            val activityThreadClass = Class.forName("android.app.ActivityThread")
            val currentApplicationMethod = activityThreadClass.getMethod("currentApplication")
            val app = currentApplicationMethod.invoke(null) as? Context
            if (app != null) {
                initialize(app)
                return app
            }
        } catch (t: Throwable) {
            Log.e(TAG, "Emergency context lookup failed: ${t.message}", t)
        }
        throw IllegalStateException("ServiceLocator has not been initialized with an Application Context.")
    }
}
