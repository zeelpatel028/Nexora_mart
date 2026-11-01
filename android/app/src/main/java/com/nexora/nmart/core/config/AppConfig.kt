package com.nexora.nmart.core.config

import android.content.Context
import android.content.SharedPreferences
import android.util.Log
import com.nexora.nmart.core.utils.NetworkUtils

/**
 * Centralized application configuration.
 * Supports dynamic switching between Cloud Production, Android Emulator (10.0.2.2),
 * local physical device Wi-Fi LAN IP, and local bundled offline assets.
 */
object AppConfig {
    private const val TAG = "AppConfig"
    private const val PREFS_NAME = "nmart_config_prefs"
    private const val KEY_BASE_URL = "key_custom_base_url"
    private const val KEY_FRONTEND_URL = "key_custom_frontend_url"
    private const val KEY_ENVIRONMENT = "key_environment"

    // Production FastAPI endpoint (Cloud)
    const val PRODUCTION_BASE_URL = "https://api.nmart.com/api/"

    // Standard Android Emulator loopback pointing to host machine FastAPI port 8000
    const val EMULATOR_BASE_URL = "http://10.0.2.2:8000/api/"

    // Genymotion Emulator loopback
    const val GENYMOTION_BASE_URL = "http://10.0.3.2:8000/api/"

    // Frontend URLs
    const val PRODUCTION_FRONTEND_URL = "https://nmart.vercel.app"
    const val EMULATOR_FRONTEND_URL = "http://10.0.2.2:5173"
    const val GENYMOTION_FRONTEND_URL = "http://10.0.3.2:5173"
    const val OFFLINE_ASSET_URL = "file:///android_asset/dist/index.html"

    // Network timeouts in seconds
    const val CONNECT_TIMEOUT_SECONDS = 30L
    const val READ_TIMEOUT_SECONDS = 30L
    const val WRITE_TIMEOUT_SECONDS = 30L

    enum class Environment(
        val displayName: String,
        val defaultApiUrl: String,
        val defaultFrontendUrl: String
    ) {
        PRODUCTION("Production Cloud", PRODUCTION_BASE_URL, PRODUCTION_FRONTEND_URL),
        EMULATOR("Android Emulator (10.0.2.2)", EMULATOR_BASE_URL, EMULATOR_FRONTEND_URL),
        GENYMOTION("Genymotion (10.0.3.2)", GENYMOTION_BASE_URL, GENYMOTION_FRONTEND_URL),
        CUSTOM("Custom IP / Cloud URL", "", "");

        val defaultUrl: String get() = defaultApiUrl
    }

    @Volatile
    private var prefs: SharedPreferences? = null

    fun initialize(context: Context) {
        try {
            prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        } catch (t: Throwable) {
            Log.w(TAG, "SharedPreferences unavailable in AppConfig: ${t.message}")
        }
    }

    fun getBaseUrl(): String {
        try {
            val customUrl = prefs?.getString(KEY_BASE_URL, null)
            if (!customUrl.isNullOrBlank()) {
                val trimmed = customUrl.trim()
                return if (trimmed.endsWith("/")) trimmed else "$trimmed/"
            }
            val env = getEnvironment()
            if (env.defaultApiUrl.isNotBlank()) {
                return env.defaultApiUrl
            }
        } catch (t: Throwable) {
            Log.w(TAG, "Error getting base URL: ${t.message}")
        }
        return PRODUCTION_BASE_URL
    }

    fun setBaseUrl(url: String) {
        val trimmed = url.trim()
        val sanitized = if (trimmed.endsWith("/")) trimmed else "$trimmed/"
        prefs?.edit()?.putString(KEY_BASE_URL, sanitized)?.apply()
    }

    /**
     * Resolves the frontend URL to load in WebView.
     * If device is offline, falls back gracefully to bundled offline assets.
     */
    fun getFrontendUrl(context: Context? = null): String {
        // If offline and context provided, use local bundled asset
        if (context != null && !NetworkUtils.isNetworkAvailable(context)) {
            return OFFLINE_ASSET_URL
        }

        try {
            val customUrl = prefs?.getString(KEY_FRONTEND_URL, null)
            if (!customUrl.isNullOrBlank()) {
                return customUrl.trim()
            }

            val env = getEnvironment()
            if (env.defaultFrontendUrl.isNotBlank()) {
                return env.defaultFrontendUrl
            }
        } catch (t: Throwable) {
            Log.w(TAG, "Error getting frontend URL: ${t.message}")
        }

        return PRODUCTION_FRONTEND_URL
    }

    fun setFrontendUrl(url: String) {
        prefs?.edit()?.putString(KEY_FRONTEND_URL, url.trim())?.apply()
    }

    fun getEnvironment(): Environment {
        val name = prefs?.getString(KEY_ENVIRONMENT, Environment.PRODUCTION.name)
        return try {
            Environment.valueOf(name ?: Environment.PRODUCTION.name)
        } catch (_: Throwable) {
            Environment.PRODUCTION
        }
    }

    fun setEnvironment(env: Environment, customApiUrl: String? = null, customFrontendUrl: String? = null) {
        prefs?.edit()?.apply {
            putString(KEY_ENVIRONMENT, env.name)
            if (env == Environment.CUSTOM) {
                if (!customApiUrl.isNullOrBlank()) {
                    val trimmed = customApiUrl.trim()
                    putString(KEY_BASE_URL, if (trimmed.endsWith("/")) trimmed else "$trimmed/")
                }
                if (!customFrontendUrl.isNullOrBlank()) {
                    putString(KEY_FRONTEND_URL, customFrontendUrl.trim())
                }
            } else {
                putString(KEY_BASE_URL, env.defaultApiUrl)
                putString(KEY_FRONTEND_URL, env.defaultFrontendUrl)
            }
            apply()
        }
    }
}
