package com.dakshina_widgets.battery

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.os.BatteryManager as AndroidBatteryManager
import android.os.Handler
import android.os.Looper
import android.util.Log
import androidx.core.content.ContextCompat

data class BatteryState(val percentage: Int, val isCharging: Boolean)

object BatteryManager {
    private const val TAG = "BatteryManager"
    private var isInitialized = false
    private var lastState = BatteryState(100, false)
    private val listeners = mutableListOf<(BatteryState) -> Unit>()
    private val mainHandler = Handler(Looper.getMainLooper())

    private val batteryReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context, intent: Intent) {
            val state = when (intent.action) {
                Intent.ACTION_POWER_CONNECTED -> {
                    val current = getBatteryState(context)
                    current.copy(isCharging = true)
                }
                Intent.ACTION_POWER_DISCONNECTED -> {
                    val current = getBatteryState(context)
                    current.copy(isCharging = false)
                }
                Intent.ACTION_BATTERY_CHANGED -> {
                    extractBatteryState(intent)
                }
                else -> {
                    getBatteryState(context)
                }
            }
            lastState = state
            mainHandler.post {
                notifyListeners(state)
                BatteryWidgetProvider.updateAllWidgets(context.applicationContext, state)
            }
        }
    }

    @Synchronized
    fun init(context: Context) {
        if (isInitialized) return
        val appContext = context.applicationContext
        try {
            val filter = IntentFilter().apply {
                addAction(Intent.ACTION_BATTERY_CHANGED)
                addAction(Intent.ACTION_POWER_CONNECTED)
                addAction(Intent.ACTION_POWER_DISCONNECTED)
                addAction(Intent.ACTION_BATTERY_LOW)
                addAction(Intent.ACTION_BATTERY_OKAY)
            }

            val stickyIntent = ContextCompat.registerReceiver(
                appContext,
                batteryReceiver,
                filter,
                ContextCompat.RECEIVER_EXPORTED
            )

            if (stickyIntent != null) {
                lastState = extractBatteryState(stickyIntent)
            } else {
                lastState = getBatteryState(appContext)
            }
            isInitialized = true
            Log.d(TAG, "BatteryManager initialized successfully: $lastState")
        } catch (e: Exception) {
            Log.e(TAG, "Error initializing BatteryManager", e)
        }
    }

    fun getBatteryState(context: Context): BatteryState {
        init(context)
        val appContext = context.applicationContext
        try {
            val intent = appContext.registerReceiver(null, IntentFilter(Intent.ACTION_BATTERY_CHANGED))
            if (intent != null) {
                lastState = extractBatteryState(intent)
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error reading battery state sticky intent", e)
        }
        return lastState
    }

    fun addListener(listener: (BatteryState) -> Unit) {
        synchronized(listeners) {
            listeners.add(listener)
        }
    }

    fun removeListener(listener: (BatteryState) -> Unit) {
        synchronized(listeners) {
            listeners.remove(listener)
        }
    }

    private fun notifyListeners(state: BatteryState) {
        synchronized(listeners) {
            for (listener in listeners) {
                listener(state)
            }
        }
    }

    fun extractBatteryState(intent: Intent): BatteryState {
        val level = intent.getIntExtra(AndroidBatteryManager.EXTRA_LEVEL, -1)
        val scale = intent.getIntExtra(AndroidBatteryManager.EXTRA_SCALE, -1)
        val status = intent.getIntExtra(AndroidBatteryManager.EXTRA_STATUS, -1)
        val plugged = intent.getIntExtra(AndroidBatteryManager.EXTRA_PLUGGED, 0)

        val isPlugged = plugged == AndroidBatteryManager.BATTERY_PLUGGED_AC ||
                plugged == AndroidBatteryManager.BATTERY_PLUGGED_USB ||
                plugged == AndroidBatteryManager.BATTERY_PLUGGED_WIRELESS

        val isCharging = status == AndroidBatteryManager.BATTERY_STATUS_CHARGING ||
                status == AndroidBatteryManager.BATTERY_STATUS_FULL ||
                (isPlugged && status != AndroidBatteryManager.BATTERY_STATUS_DISCHARGING)

        val percentage = if (level >= 0 && scale > 0) {
            ((level.toFloat() / scale.toFloat()) * 100).toInt().coerceIn(0, 100)
        } else {
            lastState.percentage
        }
        return BatteryState(percentage, isCharging)
    }
}
