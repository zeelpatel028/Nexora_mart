package com.nexora.nmart.data.local

import android.content.Context
import android.content.SharedPreferences
import android.util.Log
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import com.nexora.nmart.core.constants.AppConstants

/**
 * Secure token manager using EncryptedSharedPreferences (backed by Android Keystore).
 * Ensures sensitive JWT tokens are encrypted at rest and never logged.
 * Gracefully falls back to standard SharedPreferences if Keystore or Tink encounters any error.
 */
class TokenManager(context: Context) {

    private val prefs: SharedPreferences = try {
        val masterKey = MasterKey.Builder(context)
            .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
            .build()

        EncryptedSharedPreferences.create(
            context,
            "nmart_secure_prefs",
            masterKey,
            EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
            EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
        )
    } catch (t: Throwable) {
        // Fallback for older emulators, devices with locked/corrupted keystore, or missing native Tink libraries
        Log.w("TokenManager", "EncryptedSharedPreferences unavailable, falling back to standard SharedPreferences: ${t.message}")
        context.getSharedPreferences("nmart_auth_prefs", Context.MODE_PRIVATE)
    }

    /**
     * Store JWT Bearer token securely.
     */
    fun saveToken(token: String) {
        try {
            prefs.edit().putString(AppConstants.PREFS_KEY_TOKEN, token).apply()
        } catch (t: Throwable) {
            Log.e("TokenManager", "Error saving token: ${t.message}")
        }
    }

    /**
     * Retrieve current JWT Bearer token, or null if unauthenticated.
     */
    fun getToken(): String? {
        return try {
            prefs.getString(AppConstants.PREFS_KEY_TOKEN, null)
        } catch (t: Throwable) {
            Log.e("TokenManager", "Error reading token: ${t.message}")
            null
        }
    }

    /**
     * Check if a token currently exists.
     */
    fun hasToken(): Boolean {
        return !getToken().isNullOrBlank()
    }

    /**
     * Invalidate and remove stored token.
     */
    fun clearToken() {
        try {
            prefs.edit().remove(AppConstants.PREFS_KEY_TOKEN).apply()
        } catch (t: Throwable) {
            Log.e("TokenManager", "Error clearing token: ${t.message}")
        }
    }
}
