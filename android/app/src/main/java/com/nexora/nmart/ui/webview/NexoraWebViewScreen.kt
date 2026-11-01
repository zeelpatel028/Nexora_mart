package com.nexora.nmart.ui.webview

import android.annotation.SuppressLint
import android.content.Intent
import android.graphics.Bitmap
import android.net.Uri
import android.os.Build
import android.util.Log
import android.view.View
import android.view.ViewGroup
import android.webkit.ConsoleMessage
import android.webkit.RenderProcessGoneDetail
import android.webkit.WebChromeClient
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.compose.BackHandler
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.PhoneAndroid
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.WifiOff
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalLifecycleOwner
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleEventObserver
import com.nexora.nmart.R
import com.nexora.nmart.core.config.AppConfig
import com.nexora.nmart.core.utils.NetworkUtils
import com.nexora.nmart.ui.auth.WaveBackground
import com.nexora.nmart.ui.splash.NexoraLoadingSpinner
import com.nexora.nmart.ui.theme.NexoraDarkNavy
import com.nexora.nmart.ui.theme.NexoraOrange

private const val TAG = "NexoraWebView"

/**
 * Production-ready Android Native Host WebView:
 * - Loads React + Vite frontend (cloud URL or local asset fallback).
 * - Full lifecycle management (pause, resume, destroy, release).
 * - Zero crashes on network failure / offline / renderer death.
 * - Branded loading states and offline retry cards.
 * - Clean back gesture navigation.
 * - Bridges to Native Jetpack Compose screens seamlessly.
 */
@SuppressLint("SetJavaScriptEnabled")
@Composable
fun NexoraWebViewScreen(
    initialUrl: String = AppConfig.getFrontendUrl(),
    onNavigateToNative: () -> Unit = {},
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val lifecycleOwner = LocalLifecycleOwner.current

    var webViewInstance by remember { mutableStateOf<WebView?>(null) }
    var currentUrl by remember { mutableStateOf(initialUrl) }
    var isLoading by remember { mutableStateOf(true) }
    var loadProgress by remember { mutableFloatStateOf(0f) }
    var hasError by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf("") }
    var canGoBack by remember { mutableStateOf(false) }
    var isWebViewSupported by remember { mutableStateOf(true) }

    // Intercept back key to navigate in WebView history
    BackHandler(enabled = canGoBack) {
        webViewInstance?.let { wv ->
            if (wv.canGoBack()) {
                wv.goBack()
            }
        }
    }

    // Lifecycle observer for pause/resume/destroy
    DisposableEffect(lifecycleOwner) {
        val observer = LifecycleEventObserver { _, event ->
            when (event) {
                Lifecycle.Event.ON_PAUSE -> {
                    try {
                        webViewInstance?.onPause()
                        webViewInstance?.pauseTimers()
                    } catch (t: Throwable) {
                        Log.w(TAG, "WebView onPause warning: ${t.message}")
                    }
                }
                Lifecycle.Event.ON_RESUME -> {
                    try {
                        webViewInstance?.onResume()
                        webViewInstance?.resumeTimers()
                    } catch (t: Throwable) {
                        Log.w(TAG, "WebView onResume warning: ${t.message}")
                    }
                }
                Lifecycle.Event.ON_DESTROY -> {
                    try {
                        webViewInstance?.let { wv ->
                            (wv.parent as? ViewGroup)?.removeView(wv)
                            wv.stopLoading()
                            wv.clearHistory()
                            wv.destroy()
                        }
                    } catch (t: Throwable) {
                        Log.w(TAG, "WebView onDestroy warning: ${t.message}")
                    } finally {
                        webViewInstance = null
                    }
                }
                else -> Unit
            }
        }
        lifecycleOwner.lifecycle.addObserver(observer)
        onDispose {
            lifecycleOwner.lifecycle.removeObserver(observer)
        }
    }

    // If device is offline initially, fall back gracefully to bundled offline assets
    LaunchedEffect(Unit) {
        if (!NetworkUtils.isNetworkAvailable(context)) {
            Log.d(TAG, "Device is offline on launch, loading bundled offline assets")
            currentUrl = AppConfig.OFFLINE_ASSET_URL
            webViewInstance?.loadUrl(AppConfig.OFFLINE_ASSET_URL)
        }
    }

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(Color(0xFFFFF9F3))
    ) {
        // 1. Android Native WebView Host (Guarded against MissingWebViewPackageException)
        if (isWebViewSupported) {
            AndroidView(
                modifier = Modifier
                    .fillMaxSize()
                    .statusBarsPadding()
                    .navigationBarsPadding(),
                factory = { ctx ->
                    try {
                        WebView(ctx).apply {
                            layoutParams = ViewGroup.LayoutParams(
                                ViewGroup.LayoutParams.MATCH_PARENT,
                                ViewGroup.LayoutParams.MATCH_PARENT
                            )

                            // Prevent Android Autofill framework crashes when focusing password inputs
                            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                                importantForAutofill = View.IMPORTANT_FOR_AUTOFILL_NO_EXCLUDE_DESCENDANTS
                            }

                            // WebSettings configuration
                            settings.apply {
                                javaScriptEnabled = true
                                domStorageEnabled = true
                                databaseEnabled = true
                                saveFormData = false
                                allowFileAccess = true
                                allowContentAccess = true
                                allowFileAccessFromFileURLs = true
                                allowUniversalAccessFromFileURLs = true
                                useWideViewPort = true
                                loadWithOverviewMode = true
                                builtInZoomControls = false
                                displayZoomControls = false
                                mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
                                cacheMode = if (NetworkUtils.isNetworkAvailable(ctx)) {
                                    WebSettings.LOAD_DEFAULT
                                } else {
                                    WebSettings.LOAD_CACHE_ELSE_NETWORK
                                }
                            }

                            // WebViewClient
                            webViewClient = object : WebViewClient() {
                                override fun shouldOverrideUrlLoading(
                                    view: WebView?,
                                    request: WebResourceRequest?
                                ): Boolean {
                                    val url = request?.url?.toString() ?: return false
                                    return if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("file://")) {
                                        false
                                    } else {
                                        try {
                                            val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
                                            ctx.startActivity(intent)
                                        } catch (e: Exception) {
                                            Log.w(TAG, "Cannot handle external scheme: $url", e)
                                        }
                                        true
                                    }
                                }

                                override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
                                    super.onPageStarted(view, url, favicon)
                                    isLoading = true
                                    hasError = false
                                    canGoBack = view?.canGoBack() == true
                                }

                                override fun onPageFinished(view: WebView?, url: String?) {
                                    super.onPageFinished(view, url)
                                    isLoading = false
                                    canGoBack = view?.canGoBack() == true
                                }

                                override fun onReceivedError(
                                    view: WebView?,
                                    request: WebResourceRequest?,
                                    error: WebResourceError?
                                ) {
                                    super.onReceivedError(view, request, error)
                                    if (request?.isForMainFrame == true) {
                                        hasError = true
                                        errorMessage = error?.description?.toString() ?: "Network error"
                                        isLoading = false
                                    }
                                }

                                @Deprecated("Deprecated in Java")
                                override fun onReceivedError(
                                    view: WebView?,
                                    errorCode: Int,
                                    description: String?,
                                    failingUrl: String?
                                ) {
                                    super.onReceivedError(view, errorCode, description, failingUrl)
                                    hasError = true
                                    errorMessage = description ?: "Connection error ($errorCode)"
                                    isLoading = false
                                }

                                override fun onReceivedHttpError(
                                    view: WebView?,
                                    request: WebResourceRequest?,
                                    errorResponse: WebResourceResponse?
                                ) {
                                    super.onReceivedHttpError(view, request, errorResponse)
                                    if (request?.isForMainFrame == true) {
                                        val statusCode = errorResponse?.statusCode ?: 0
                                        if (statusCode >= 400) {
                                            hasError = true
                                            errorMessage = "Server error ($statusCode)"
                                            isLoading = false
                                        }
                                    }
                                }

                                override fun onRenderProcessGone(
                                    view: WebView?,
                                    detail: RenderProcessGoneDetail?
                                ): Boolean {
                                    Log.w(TAG, "WebView render process terminated")
                                    hasError = true
                                    errorMessage = "WebView render process terminated. Tap retry to reload."
                                    isLoading = false
                                    return true // Returning true prevents the host app process from crashing
                                }
                            }

                            // WebChromeClient
                            webChromeClient = object : WebChromeClient() {
                                override fun onProgressChanged(view: WebView?, newProgress: Int) {
                                    super.onProgressChanged(view, newProgress)
                                    loadProgress = newProgress / 100f
                                    if (newProgress >= 100) {
                                        isLoading = false
                                    }
                                }

                                override fun onConsoleMessage(consoleMessage: ConsoleMessage?): Boolean {
                                    Log.d(TAG, "JS Console [${consoleMessage?.messageLevel()}]: ${consoleMessage?.message()} -- line ${consoleMessage?.lineNumber()}")
                                    return true
                                }
                            }

                            loadUrl(currentUrl)
                            webViewInstance = this
                        }
                    } catch (t: Throwable) {
                        Log.e(TAG, "Failed to instantiate WebView: ${t.message}", t)
                        isWebViewSupported = false
                        hasError = true
                        errorMessage = "WebView service is unavailable on this device. Please use the native screens."
                        View(ctx)
                    }
                },
                update = { wv ->
                    if (wv is WebView) {
                        webViewInstance = wv
                    }
                },
                onRelease = { wv ->
                    try {
                        if (wv is WebView) {
                            (wv.parent as? ViewGroup)?.removeView(wv)
                            wv.stopLoading()
                            wv.clearHistory()
                            wv.destroy()
                        }
                    } catch (t: Throwable) {
                        Log.w(TAG, "WebView onRelease cleanup warning: ${t.message}")
                    }
                }
            )
        }

        // 2. Top Progress Indicator (when loading web page)
        if (isLoading && !hasError) {
            LinearProgressIndicator(
                progress = { loadProgress },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(3.dp)
                    .statusBarsPadding(),
                color = NexoraOrange,
                trackColor = Color(0x33FF6A1A)
            )
        }

        // 3. Top Floating App Bar (Controls & Navigation Switcher)
        Surface(
            modifier = Modifier
                .fillMaxWidth()
                .statusBarsPadding()
                .padding(horizontal = 12.dp, vertical = 6.dp),
            shape = RoundedCornerShape(16.dp),
            color = Color.White.copy(alpha = 0.92f),
            shadowElevation = 4.dp
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 12.dp, vertical = 6.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                // Brand Title
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Image(
                        painter = painterResource(id = R.drawable.logo),
                        contentDescription = "Logo",
                        modifier = Modifier
                            .size(28.dp)
                            .clip(RoundedCornerShape(8.dp))
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "NEXORA",
                        style = TextStyle(
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Bold,
                            color = NexoraDarkNavy
                        )
                    )
                    Spacer(modifier = Modifier.width(3.dp))
                    Text(
                        text = "MART",
                        style = TextStyle(
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Bold,
                            color = NexoraOrange
                        )
                    )
                }

                // Controls: Reload + Switch to Native Screen
                Row(verticalAlignment = Alignment.CenterVertically) {
                    IconButton(
                        onClick = {
                            hasError = false
                            isLoading = true
                            webViewInstance?.reload()
                        },
                        modifier = Modifier.size(34.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Refresh,
                            contentDescription = "Reload",
                            tint = NexoraOrange,
                            modifier = Modifier.size(20.dp)
                        )
                    }

                    Spacer(modifier = Modifier.width(4.dp))

                    // Switch to Native Jetpack Compose View
                    IconButton(
                        onClick = onNavigateToNative,
                        modifier = Modifier.size(34.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.PhoneAndroid,
                            contentDescription = "Native Mode",
                            tint = NexoraDarkNavy,
                            modifier = Modifier.size(20.dp)
                        )
                    }
                }
            }
        }

        // 4. Branded Full-Screen Loading Overlay on Initial Boot
        AnimatedVisibility(
            visible = isLoading && loadProgress < 0.35f && !hasError,
            enter = fadeIn(),
            exit = fadeOut()
        ) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(Color(0xFFFFF9F3)),
                contentAlignment = Alignment.Center
            ) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center
                ) {
                    Image(
                        painter = painterResource(id = R.drawable.logo),
                        contentDescription = "Logo",
                        modifier = Modifier
                            .size(80.dp)
                            .clip(RoundedCornerShape(20.dp))
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                    NexoraLoadingSpinner(sizeDp = 42.dp)
                    Spacer(modifier = Modifier.height(14.dp))
                    Text(
                        text = "Loading Nexora Mart...",
                        style = TextStyle(
                            fontSize = 15.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = NexoraDarkNavy
                        )
                    )
                }
            }
        }

        // 5. Branded Connection Error & Offline Card (Never crashes!)
        if (hasError) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(Color(0xFFFFF9F3))
                    .padding(20.dp),
                contentAlignment = Alignment.Center
            ) {
                WaveBackground(isDark = false, modifier = Modifier.fillMaxSize())

                Surface(
                    modifier = Modifier
                        .fillMaxWidth()
                        .shadow(
                            elevation = 12.dp,
                            shape = RoundedCornerShape(24.dp),
                            ambientColor = Color(0x22FF8C3C),
                            spotColor = Color(0x22FF8C3C)
                        ),
                    shape = RoundedCornerShape(24.dp),
                    color = Color.White,
                    border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFE2E8F0))
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(24.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Box(
                            modifier = Modifier
                                .size(64.dp)
                                .clip(RoundedCornerShape(20.dp))
                                .background(Color(0xFFFFF3E8)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.WifiOff,
                                contentDescription = "Offline",
                                tint = NexoraOrange,
                                modifier = Modifier.size(32.dp)
                            )
                        }

                        Spacer(modifier = Modifier.height(16.dp))

                        Text(
                            text = "Connection Offline",
                            style = TextStyle(
                                fontSize = 20.sp,
                                fontWeight = FontWeight.Bold,
                                color = NexoraDarkNavy
                            )
                        )

                        Spacer(modifier = Modifier.height(6.dp))

                        Text(
                            text = if (errorMessage.isNotBlank()) errorMessage else "Unable to reach Nexora Mart cloud host. Check your internet connection or use the offline mode.",
                            style = TextStyle(
                                fontSize = 13.sp,
                                fontWeight = FontWeight.Normal,
                                color = Color(0xFF6B6F80),
                                textAlign = TextAlign.Center
                            ),
                            textAlign = TextAlign.Center
                        )

                        Spacer(modifier = Modifier.height(20.dp))

                        // Action 1: Retry Connection Button
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(44.dp)
                                .shadow(
                                    elevation = 6.dp,
                                    shape = RoundedCornerShape(22.dp),
                                    ambientColor = NexoraOrange.copy(alpha = 0.45f),
                                    spotColor = NexoraOrange.copy(alpha = 0.45f)
                                )
                                .clip(RoundedCornerShape(22.dp))
                                .background(
                                    Brush.horizontalGradient(
                                        listOf(Color(0xFFFF5F1F), Color(0xFFFF7A1F), Color(0xFFFFB62E))
                                    )
                                )
                                .clickable {
                                    hasError = false
                                    isLoading = true
                                    webViewInstance?.loadUrl(currentUrl)
                                },
                            contentAlignment = Alignment.Center
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.Center
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Refresh,
                                    contentDescription = "Retry",
                                    tint = Color.White,
                                    modifier = Modifier.size(18.dp)
                                )
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(
                                    text = "Retry Connection",
                                    style = TextStyle(
                                        fontSize = 15.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = Color.White
                                    )
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(10.dp))

                        // Action 2: Load Local Bundled Assets (Offline Mode)
                        Surface(
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(42.dp)
                                .clip(RoundedCornerShape(12.dp))
                                .clickable {
                                    hasError = false
                                    isLoading = true
                                    currentUrl = AppConfig.OFFLINE_ASSET_URL
                                    webViewInstance?.loadUrl(AppConfig.OFFLINE_ASSET_URL)
                                },
                            shape = RoundedCornerShape(12.dp),
                            color = Color(0xFFFFF7ED),
                            border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFFFD8B2))
                        ) {
                            Box(contentAlignment = Alignment.Center) {
                                Text(
                                    text = "Load Bundled Offline Version",
                                    style = TextStyle(
                                        fontSize = 13.sp,
                                        fontWeight = FontWeight.SemiBold,
                                        color = NexoraOrange
                                    )
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(8.dp))

                        // Action 3: Switch to Native Compose Screen
                        Surface(
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(42.dp)
                                .clip(RoundedCornerShape(12.dp))
                                .clickable(onClick = onNavigateToNative),
                            shape = RoundedCornerShape(12.dp),
                            color = Color(0xFFF1F5F9),
                            border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFE2E8F0))
                        ) {
                            Box(contentAlignment = Alignment.Center) {
                                Text(
                                    text = "Use Native Android Screens",
                                    style = TextStyle(
                                        fontSize = 13.sp,
                                        fontWeight = FontWeight.SemiBold,
                                        color = NexoraDarkNavy
                                    )
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}
