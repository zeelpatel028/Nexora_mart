package com.nexora.nmart

import android.os.Build
import android.os.Bundle
import android.util.Log
import android.view.View
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import com.nexora.nmart.di.ServiceLocator
import com.nexora.nmart.navigation.AppNavigation
import com.nexora.nmart.ui.theme.NMARTTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Safeguard against OS AutofillManager crashes when focusing password fields
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                window.decorView.importantForAutofill = View.IMPORTANT_FOR_AUTOFILL_NO_EXCLUDE_DESCENDANTS
            }
        } catch (t: Throwable) {
            Log.w("MainActivity", "Autofill safeguard warning: ${t.message}")
        }

        // Safeguard dependency injection initialization
        try {
            if (!ServiceLocator.isInitialized()) {
                ServiceLocator.initialize(applicationContext)
            }
        } catch (t: Throwable) {
            Log.e("MainActivity", "ServiceLocator check warning: ${t.message}", t)
        }

        try {
            enableEdgeToEdge()
        } catch (t: Throwable) {
            Log.w("MainActivity", "EdgeToEdge warning: ${t.message}", t)
        }

        setContent {
            NMARTTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    AppNavigation()
                }
            }
        }
    }
}
