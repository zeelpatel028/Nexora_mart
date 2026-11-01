package com.nexora.nmart.data.local

import android.content.Context
import android.content.SharedPreferences
import android.util.Log
import com.google.gson.Gson
import com.nexora.nmart.core.constants.AppConstants
import com.nexora.nmart.data.model.UserResponse
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

/**
 * Manages active user session and in-memory reactive state.
 * Fully guarded against crashes and null pointers.
 */
class UserSessionManager(
    context: Context,
    private val tokenManager: TokenManager
) {
    private val prefs: SharedPreferences = try {
        context.getSharedPreferences("nmart_user_session", Context.MODE_PRIVATE)
    } catch (t: Throwable) {
        Log.e("UserSessionManager", "Failed to access shared preferences: ${t.message}")
        context.getSharedPreferences("nmart_user_session_fallback", Context.MODE_PRIVATE)
    }
    private val gson = Gson()

    private val _currentUser = MutableStateFlow<UserResponse?>(loadSavedUser())
    val currentUser: StateFlow<UserResponse?> = _currentUser.asStateFlow()

    private val _isAuthenticated = MutableStateFlow(tokenManager.hasToken() && _currentUser.value != null)
    val isAuthenticated: StateFlow<Boolean> = _isAuthenticated.asStateFlow()

    private fun loadSavedUser(): UserResponse? {
        return try {
            val userJson = prefs.getString(AppConstants.PREFS_KEY_USER, null) ?: return null
            gson.fromJson(userJson, UserResponse::class.java)
        } catch (t: Throwable) {
            Log.e("UserSessionManager", "Error loading saved user: ${t.message}")
            null
        }
    }

    fun saveUser(user: UserResponse) {
        try {
            prefs.edit().putString(AppConstants.PREFS_KEY_USER, gson.toJson(user)).apply()
            _currentUser.value = user
            _isAuthenticated.value = tokenManager.hasToken()
        } catch (t: Throwable) {
            Log.e("UserSessionManager", "Error saving user: ${t.message}")
        }
    }

    fun clearSession() {
        try {
            tokenManager.clearToken()
            prefs.edit().remove(AppConstants.PREFS_KEY_USER).apply()
            _currentUser.value = null
            _isAuthenticated.value = false
        } catch (t: Throwable) {
            Log.e("UserSessionManager", "Error clearing session: ${t.message}")
        }
    }
}
