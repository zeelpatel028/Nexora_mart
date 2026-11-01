package com.nexora.nmart.navigation

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Dashboard
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.outlined.Dashboard
import androidx.compose.material.icons.outlined.Person
import androidx.compose.material.icons.outlined.Settings
import androidx.compose.ui.graphics.vector.ImageVector

/**
 * Route definitions for Jetpack Compose Navigation.
 */
sealed class Screen(val route: String) {
    object Splash : Screen("splash")
    object WebView : Screen("webview")
    object Login : Screen("login")
    object Signup : Screen("signup")
    object Dashboard : Screen("dashboard")
    object Profile : Screen("profile")
    object Settings : Screen("settings")
}

/**
 * Top-level destination descriptor used by Adaptive Navigation components
 * (Bottom Bar, Navigation Rail, Navigation Drawer).
 */
data class NavigationItem(
    val route: String,
    val title: String,
    val selectedIcon: ImageVector,
    val unselectedIcon: ImageVector
)

object NavigationDestinations {
    val items = listOf(
        NavigationItem(
            route = Screen.Dashboard.route,
            title = "Dashboard",
            selectedIcon = Icons.Filled.Dashboard,
            unselectedIcon = Icons.Outlined.Dashboard
        ),
        NavigationItem(
            route = Screen.Profile.route,
            title = "Profile",
            selectedIcon = Icons.Filled.Person,
            unselectedIcon = Icons.Outlined.Person
        ),
        NavigationItem(
            route = Screen.Settings.route,
            title = "Settings",
            selectedIcon = Icons.Filled.Settings,
            unselectedIcon = Icons.Outlined.Settings
        )
    )
}
