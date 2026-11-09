package com.nexora.nmart

import android.app.Application
import com.facebook.react.ReactApplication
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.shell.MainReactPackage
import com.facebook.soloader.SoLoader
import com.swmansion.rnscreens.RNScreensPackage
import com.th3rdwave.safeareacontext.SafeAreaContextPackage
import com.horcrux.svg.SvgPackage
import com.reactnativecommunity.asyncstorage.AsyncStoragePackage

class MainApplication : Application(), ReactApplication {

    private val mReactNativeHost: ReactNativeHost = object : ReactNativeHost(this) {
        override fun getUseDeveloperSupport(): Boolean = false

        override fun getPackages(): List<ReactPackage> {
            return listOf(
                MainReactPackage(),
                RNScreensPackage(),
                SafeAreaContextPackage(),
                SvgPackage(),
                AsyncStoragePackage()
            )
        }

        override fun getJSMainModuleName(): String = "index"
        override fun getBundleAssetName(): String = "index.android.bundle"
    }

    override val reactNativeHost: ReactNativeHost
        get() = mReactNativeHost

    override fun onCreate() {
        super.onCreate()
        SoLoader.init(this, false)
    }
}
