package com.dakshina_widgets.torch

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.modules.core.DeviceEventManagerModule

class TorchModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private val torchListener: (Boolean) -> Unit = { enabled ->
        sendEvent("onTorchStateChanged", enabled)
    }

    init {
        TorchManager.init(reactContext)
        TorchManager.addListener(torchListener)
    }

    override fun getName(): String = "TorchModule"

    @ReactMethod
    fun isTorchOn(promise: Promise) {
        promise.resolve(TorchManager.isTorchActive())
    }

    @ReactMethod
    fun hasFlash(promise: Promise) {
        promise.resolve(TorchManager.hasFlashUnit())
    }

    @ReactMethod
    fun toggleTorch(promise: Promise) {
        val success = TorchManager.toggle(reactContext)
        promise.resolve(success)
    }

    @ReactMethod
    fun setTorch(enabled: Boolean, promise: Promise) {
        val success = TorchManager.setTorch(reactContext, enabled)
        promise.resolve(success)
    }

    @ReactMethod
    fun addListener(eventName: String) {
        // Required for React Native built-in NativeEventEmitter
    }

    @ReactMethod
    fun removeListeners(count: Double) {
        // Required for React Native built-in NativeEventEmitter
    }

    private fun sendEvent(eventName: String, params: Any?) {
        if (reactContext.hasActiveReactInstance()) {
            reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit(eventName, params)
        }
    }

    override fun invalidate() {
        super.invalidate()
        TorchManager.removeListener(torchListener)
    }
}
