package com.dakshina_widgets.torch

import android.content.Context
import android.hardware.camera2.CameraCharacteristics
import android.hardware.camera2.CameraManager
import android.os.Handler
import android.os.Looper
import android.util.Log

object TorchManager {
    private const val TAG = "TorchManager"
    private var isTorchOn: Boolean = false
    private var cameraIdWithFlash: String? = null
    private var isInitialized = false
    private val listeners = mutableListOf<(Boolean) -> Unit>()
    private val mainHandler = Handler(Looper.getMainLooper())

    @Synchronized
    fun init(context: Context) {
        if (isInitialized) return
        val appContext = context.applicationContext
        val cameraManager = appContext.getSystemService(Context.CAMERA_SERVICE) as? CameraManager
        if (cameraManager == null) {
            Log.e(TAG, "CameraManager service not available")
            return
        }

        try {
            for (id in cameraManager.cameraIdList) {
                val characteristics = cameraManager.getCameraCharacteristics(id)
                val hasFlash = characteristics.get(CameraCharacteristics.FLASH_INFO_AVAILABLE) == true
                val facing = characteristics.get(CameraCharacteristics.LENS_FACING)
                if (hasFlash && facing == CameraCharacteristics.LENS_FACING_BACK) {
                    cameraIdWithFlash = id
                    break
                }
            }

            if (cameraIdWithFlash == null) {
                for (id in cameraManager.cameraIdList) {
                    val characteristics = cameraManager.getCameraCharacteristics(id)
                    if (characteristics.get(CameraCharacteristics.FLASH_INFO_AVAILABLE) == true) {
                        cameraIdWithFlash = id
                        break
                    }
                }
            }

            cameraManager.registerTorchCallback(object : CameraManager.TorchCallback() {
                override fun onTorchModeChanged(cameraId: String, enabled: Boolean) {
                    if (cameraId == cameraIdWithFlash) {
                        isTorchOn = enabled
                        mainHandler.post {
                            notifyListeners(enabled)
                            TorchWidgetProvider.updateAllWidgets(appContext, enabled)
                        }
                    }
                }

                override fun onTorchModeUnavailable(cameraId: String) {
                    if (cameraId == cameraIdWithFlash) {
                        isTorchOn = false
                        mainHandler.post {
                            notifyListeners(false)
                            TorchWidgetProvider.updateAllWidgets(appContext, false)
                        }
                    }
                }
            }, mainHandler)

            isInitialized = true
        } catch (e: Exception) {
            Log.e(TAG, "Error initializing TorchManager", e)
        }
    }

    fun toggle(context: Context): Boolean {
        init(context)
        return setTorch(context, !isTorchOn)
    }

    fun setTorch(context: Context, enabled: Boolean): Boolean {
        init(context)
        val targetCameraId = cameraIdWithFlash ?: return false
        val cameraManager = context.applicationContext.getSystemService(Context.CAMERA_SERVICE) as? CameraManager ?: return false
        return try {
            cameraManager.setTorchMode(targetCameraId, enabled)
            isTorchOn = enabled
            TorchWidgetProvider.updateAllWidgets(context.applicationContext, enabled)
            notifyListeners(enabled)
            true
        } catch (e: Exception) {
            Log.e(TAG, "Failed to set torch mode: $enabled", e)
            false
        }
    }

    fun isTorchActive(): Boolean = isTorchOn

    fun hasFlashUnit(): Boolean = cameraIdWithFlash != null

    @Synchronized
    fun addListener(listener: (Boolean) -> Unit) {
        if (!listeners.contains(listener)) {
            listeners.add(listener)
        }
    }

    @Synchronized
    fun removeListener(listener: (Boolean) -> Unit) {
        listeners.remove(listener)
    }

    @Synchronized
    private fun notifyListeners(state: Boolean) {
        listeners.forEach { it(state) }
    }
}
