package com.nexora.nmart.ui.navigation

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

/**
 * Adaptive navigation wrapper that automatically adjusts between
 * Bottom Navigation (Phone), Navigation Rail (Tablet), and Navigation Drawer (Large Tablet / Desktop).
 */
@Composable
fun AdaptiveNavigation(
    currentRoute: String,
    onNavigateToRoute: (String) -> Unit,
    modifier: Modifier = Modifier,
    merchantName: String? = null,
    storeType: String? = null,
    content: @Composable () -> Unit
) {
    BoxWithConstraints(modifier = modifier.fillMaxSize()) {
        val screenWidth = maxWidth

        when {
            // Compact Phone: Bottom Navigation Bar
            screenWidth < 600.dp -> {
                Scaffold(
                    bottomBar = {
                        MobileNavigationBar(
                            currentRoute = currentRoute,
                            onNavigateToRoute = onNavigateToRoute
                        )
                    }
                ) { innerPadding ->
                    Box(modifier = Modifier.padding(innerPadding)) {
                        content()
                    }
                }
            }

            // Medium Tablet: Side Navigation Rail
            screenWidth in 600.dp..840.dp -> {
                Row(modifier = Modifier.fillMaxSize()) {
                    TabletNavigationRail(
                        currentRoute = currentRoute,
                        onNavigateToRoute = onNavigateToRoute
                    )
                    Box(modifier = Modifier.weight(1f)) {
                        content()
                    }
                }
            }

            // Expanded / Large Tablet / Foldable: Side Navigation Drawer
            else -> {
                Row(modifier = Modifier.fillMaxSize()) {
                    TabletNavigationDrawer(
                        currentRoute = currentRoute,
                        onNavigateToRoute = onNavigateToRoute,
                        merchantName = merchantName,
                        storeType = storeType
                    )
                    Box(modifier = Modifier.weight(1f)) {
                        content()
                    }
                }
            }
        }
    }
}
