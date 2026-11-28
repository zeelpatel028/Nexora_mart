package com.nexora.nmart

import android.graphics.Color
import android.os.Build
import android.view.View
import android.view.Window
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsControllerCompat
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class SystemBarModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    override fun getName(): String = "SystemBarModule"

    @ReactMethod
    fun setNavigationBarColor(colorHex: String, lightIcons: Boolean) {
        val activity = currentActivity ?: return
        activity.runOnUiThread {
            try {
                val window = activity.window
                val color = Color.parseColor(colorHex)
                window.navigationBarColor = color
                
                val insetsController = WindowCompat.getInsetsController(window, window.decorView)
                // When lightIcons is true (e.g. orange/dark bg), icons should be white -> appearanceLight = false
                // When lightIcons is false (white bg), icons should be dark -> appearanceLight = true
                insetsController.isAppearanceLightNavigationBars = !lightIcons
            } catch (e: Exception) {
                // Ignore parse errors gracefully
            }
        }
    }

    @ReactMethod
    fun setStatusBarColor(colorHex: String, lightIcons: Boolean) {
        val activity = currentActivity ?: return
        activity.runOnUiThread {
            try {
                val window = activity.window
                val color = Color.parseColor(colorHex)
                window.statusBarColor = color
                
                val insetsController = WindowCompat.getInsetsController(window, window.decorView)
                insetsController.isAppearanceLightStatusBars = !lightIcons
            } catch (e: Exception) {
                // Ignore parse errors gracefully
            }
        }
    }

    @ReactMethod
    fun setBarColors(statusColorHex: String, statusLightIcons: Boolean, navColorHex: String, navLightIcons: Boolean) {
        val activity = currentActivity ?: return
        activity.runOnUiThread {
            try {
                val window = activity.window
                val statusColor = Color.parseColor(statusColorHex)
                val navColor = Color.parseColor(navColorHex)
                
                window.statusBarColor = statusColor
                window.navigationBarColor = navColor
                
                val insetsController = WindowCompat.getInsetsController(window, window.decorView)
                insetsController.isAppearanceLightStatusBars = !statusLightIcons
                insetsController.isAppearanceLightNavigationBars = !navLightIcons
            } catch (e: Exception) {
                // Ignore parse errors gracefully
            }
        }
    }
}

