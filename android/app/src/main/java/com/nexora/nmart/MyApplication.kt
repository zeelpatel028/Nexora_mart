package com.nexora.nmart

import android.app.Application
import android.util.Log
import com.nexora.nmart.di.ServiceLocator

class MyApplication : Application() {
    override fun onCreate() {
        super.onCreate()

        // 1. Initialize ServiceLocator immediately
        try {
            ServiceLocator.initialize(this)
        } catch (t: Throwable) {
            Log.e("NexoraMart", "ServiceLocator initialization error: ${t.message}", t)
        }

        // 2. Global uncaught exception handler intercepts known OS Autofill / IME bugs without terminating the app
        val defaultHandler = Thread.getDefaultUncaughtExceptionHandler()
        Thread.setDefaultUncaughtExceptionHandler { thread, throwable ->
            val stackTrace = Log.getStackTraceString(throwable)
            val isKnownOsInputBug = stackTrace.contains("android.view.autofill") ||
                    stackTrace.contains("IAutoFillManager") ||
                    stackTrace.contains("AutofillId") ||
                    stackTrace.contains("inputmethod") ||
                    stackTrace.contains("InputMethodManager")

            if (isKnownOsInputBug) {
                Log.e("NexoraMart", "Intercepted and suppressed OS Autofill/IME crash on thread ${thread.name}: ${throwable.message}", throwable)
                return@setDefaultUncaughtExceptionHandler
            }

            Log.e("NexoraMart", "FATAL EXCEPTION on thread ${thread.name}: ${throwable.message}", throwable)
            defaultHandler?.uncaughtException(thread, throwable)
        }
    }
}
