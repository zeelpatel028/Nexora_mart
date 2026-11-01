package com.nexora.nmart.navigation

import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.nexora.nmart.di.ServiceLocator
import com.nexora.nmart.ui.auth.AuthViewModel
import com.nexora.nmart.ui.auth.LoginScreen
import com.nexora.nmart.ui.auth.SignupScreen
import com.nexora.nmart.ui.dashboard.DashboardScreen
import com.nexora.nmart.ui.dashboard.DashboardViewModel
import com.nexora.nmart.ui.navigation.AdaptiveNavigation
import com.nexora.nmart.ui.profile.ProfileScreen
import com.nexora.nmart.ui.profile.ProfileViewModel
import com.nexora.nmart.ui.settings.SettingsScreen
import com.nexora.nmart.ui.splash.SplashScreen
import com.nexora.nmart.ui.webview.NexoraWebViewScreen

/**
 * Top-level application navigation graph handling WebView frontend loading,
 * authentication flows, and adaptive layouts.
 */
@Composable
fun AppNavigation(
    modifier: Modifier = Modifier,
    navController: NavHostController = rememberNavController()
) {
    val isAuthenticated by ServiceLocator.userSessionManager.isAuthenticated.collectAsState()
    val currentUser by ServiceLocator.userSessionManager.currentUser.collectAsState()

    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route ?: Screen.Splash.route

    val authViewModel = remember { AuthViewModel(ServiceLocator.authRepository) }
    val dashboardViewModel = remember { DashboardViewModel(ServiceLocator.authRepository, ServiceLocator.apiClient) }
    val profileViewModel = remember { ProfileViewModel(ServiceLocator.authRepository) }

    NavHost(
        navController = navController,
        startDestination = Screen.Splash.route,
        modifier = modifier
    ) {
        // 1. Splash / Onboarding Screen
        composable(Screen.Splash.route) {
            SplashScreen(
                onSplashComplete = {
                    navController.navigate(Screen.WebView.route) {
                        popUpTo(Screen.Splash.route) { inclusive = true }
                    }
                }
            )
        }

        // 2. Android Native Host WebView (Loads React + Vite Frontend)
        composable(Screen.WebView.route) {
            NexoraWebViewScreen(
                onNavigateToNative = {
                    val target = if (isAuthenticated) Screen.Dashboard.route else Screen.Login.route
                    navController.navigate(target)
                }
            )
        }

        // 3. Public Native Login Screen
        composable(Screen.Login.route) {
            LoginScreen(
                viewModel = authViewModel,
                onNavigateToSignup = { navController.navigate(Screen.Signup.route) },
                onLoginSuccess = {
                    navController.navigate(Screen.Dashboard.route) {
                        popUpTo(Screen.Login.route) { inclusive = true }
                    }
                }
            )
        }

        // 4. Public Native Signup Screen
        composable(Screen.Signup.route) {
            SignupScreen(
                viewModel = authViewModel,
                onNavigateToLogin = { navController.popBackStack() },
                onSignupSuccess = {
                    navController.navigate(Screen.Dashboard.route) {
                        popUpTo(Screen.Signup.route) { inclusive = true }
                    }
                }
            )
        }

        // 5. Protected Merchant Dashboard Screen (with adaptive navigation)
        composable(Screen.Dashboard.route) {
            AdaptiveNavigation(
                currentRoute = Screen.Dashboard.route,
                onNavigateToRoute = { route ->
                    if (route != Screen.Dashboard.route) {
                        navController.navigate(route) {
                            popUpTo(Screen.Dashboard.route) { saveState = true }
                            launchSingleTop = true
                            restoreState = true
                        }
                    }
                },
                merchantName = currentUser?.displayName,
                storeType = currentUser?.storeType
            ) {
                DashboardScreen(
                    viewModel = dashboardViewModel,
                    onLogout = {
                        navController.navigate(Screen.Login.route) {
                            popUpTo(0) { inclusive = true }
                        }
                    }
                )
            }
        }

        // 6. Protected Merchant Profile Screen (with adaptive navigation)
        composable(Screen.Profile.route) {
            AdaptiveNavigation(
                currentRoute = Screen.Profile.route,
                onNavigateToRoute = { route ->
                    navController.navigate(route) {
                        popUpTo(Screen.Dashboard.route) { saveState = true }
                        launchSingleTop = true
                        restoreState = true
                    }
                },
                merchantName = currentUser?.displayName,
                storeType = currentUser?.storeType
            ) {
                ProfileScreen(
                    viewModel = profileViewModel,
                    onLogout = {
                        navController.navigate(Screen.Login.route) {
                            popUpTo(0) { inclusive = true }
                        }
                    }
                )
            }
        }

        // 7. Settings Screen (with adaptive navigation)
        composable(Screen.Settings.route) {
            AdaptiveNavigation(
                currentRoute = Screen.Settings.route,
                onNavigateToRoute = { route ->
                    navController.navigate(route) {
                        popUpTo(Screen.Dashboard.route) { saveState = true }
                        launchSingleTop = true
                        restoreState = true
                    }
                },
                merchantName = currentUser?.displayName,
                storeType = currentUser?.storeType
            ) {
                SettingsScreen()
            }
        }
    }
}
