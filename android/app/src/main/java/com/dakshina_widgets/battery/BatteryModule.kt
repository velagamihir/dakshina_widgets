package com.dakshina_widgets.battery

import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.graphics.Bitmap
import android.os.Build
import android.util.Base64
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.modules.core.DeviceEventManagerModule
import java.io.ByteArrayOutputStream

class BatteryModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private val batteryListener: (BatteryState) -> Unit = { state ->
        val params = Arguments.createMap().apply {
            putInt("percentage", state.percentage)
            putBoolean("isCharging", state.isCharging)
        }
        sendEvent("onBatteryStateChanged", params)
    }

    init {
        BatteryManager.init(reactContext)
        BatteryManager.addListener(batteryListener)
    }

    override fun getName(): String = "BatteryModule"

    @ReactMethod
    fun getBatteryState(promise: Promise) {
        val state = BatteryManager.getBatteryState(reactContext)
        val map = Arguments.createMap().apply {
            putInt("percentage", state.percentage)
            putBoolean("isCharging", state.isCharging)
        }
        promise.resolve(map)
    }

    @ReactMethod
    fun getSmileyBase64(percentage: Int, isCharging: Boolean, promise: Promise) {
        try {
            val bitmap = SmileyFaceRenderer.render(percentage, isCharging, 300)
            val stream = ByteArrayOutputStream()
            bitmap.compress(Bitmap.CompressFormat.PNG, 100, stream)
            val byteArray = stream.toByteArray()
            val base64 = Base64.encodeToString(byteArray, Base64.NO_WRAP)
            promise.resolve("data:image/png;base64,$base64")
        } catch (e: Exception) {
            promise.reject("RENDER_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun isPinningSupported(promise: Promise) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val appWidgetManager = reactContext.getSystemService(AppWidgetManager::class.java)
            promise.resolve(appWidgetManager?.isRequestPinAppWidgetSupported ?: false)
        } else {
            promise.resolve(false)
        }
    }

    @ReactMethod
    fun pinBatteryWidget(promise: Promise) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val appWidgetManager = reactContext.getSystemService(AppWidgetManager::class.java)
            if (appWidgetManager != null && appWidgetManager.isRequestPinAppWidgetSupported) {
                try {
                    val provider = ComponentName(reactContext, BatteryWidgetProvider::class.java)
                    val success = appWidgetManager.requestPinAppWidget(provider, null, null)
                    promise.resolve(success)
                    return
                } catch (e: Exception) {
                    promise.reject("PIN_FAILED", e.message, e)
                    return
                }
            }
        }
        promise.resolve(false)
    }

    @ReactMethod
    fun addListener(eventName: String) {}

    @ReactMethod
    fun removeListeners(count: Double) {}

    private fun sendEvent(eventName: String, params: Any?) {
        if (reactContext.hasActiveReactInstance()) {
            reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit(eventName, params)
        }
    }

    override fun invalidate() {
        super.invalidate()
        BatteryManager.removeListener(batteryListener)
    }
}
