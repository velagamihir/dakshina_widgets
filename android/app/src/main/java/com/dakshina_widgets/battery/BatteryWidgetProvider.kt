package com.dakshina_widgets.battery

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.util.Log
import android.widget.RemoteViews
import com.dakshina_widgets.R

class BatteryWidgetProvider : AppWidgetProvider() {

    companion object {
        private const val TAG = "BatteryWidgetProvider"
        const val ACTION_REFRESH_BATTERY = "com.dakshina_widgets.ACTION_REFRESH_BATTERY"

        fun updateAllWidgets(context: Context, state: BatteryState? = null) {
            val appWidgetManager = AppWidgetManager.getInstance(context) ?: return
            val componentName = ComponentName(context, BatteryWidgetProvider::class.java)
            val widgetIds = appWidgetManager.getAppWidgetIds(componentName) ?: return

            val batteryState = state ?: BatteryManager.getBatteryState(context)
            for (widgetId in widgetIds) {
                val views = buildRemoteViews(context, batteryState)
                appWidgetManager.updateAppWidget(widgetId, views)
            }
        }

        private fun buildRemoteViews(context: Context, state: BatteryState): RemoteViews {
            val views = RemoteViews(context.packageName, R.layout.widget_battery_layout)

            // Render high quality dynamic smiley face bitmap
            val bitmap = SmileyFaceRenderer.render(state.percentage, state.isCharging, 512)
            views.setImageViewBitmap(R.id.widget_battery_image, bitmap)

            // Tapping triggers refresh broadcast (which also launches battery settings)
            val intent = Intent(context, BatteryWidgetProvider::class.java).apply {
                action = ACTION_REFRESH_BATTERY
            }
            val pendingIntent = PendingIntent.getBroadcast(
                context,
                0,
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            views.setOnClickPendingIntent(R.id.widget_battery_container, pendingIntent)

            return views
        }
    }

    override fun onEnabled(context: Context) {
        super.onEnabled(context)
        BatteryManager.init(context)
    }

    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        BatteryManager.init(context)
        val state = BatteryManager.getBatteryState(context)
        for (widgetId in appWidgetIds) {
            val views = buildRemoteViews(context, state)
            appWidgetManager.updateAppWidget(widgetId, views)
        }
    }

    override fun onReceive(context: Context, intent: Intent) {
        super.onReceive(context, intent)
        val action = intent.action
        when (action) {
            Intent.ACTION_POWER_DISCONNECTED -> {
                val state = BatteryManager.getBatteryState(context).copy(isCharging = false)
                updateAllWidgets(context, state)
            }
            Intent.ACTION_POWER_CONNECTED -> {
                val state = BatteryManager.getBatteryState(context).copy(isCharging = true)
                updateAllWidgets(context, state)
            }
            Intent.ACTION_BATTERY_CHANGED,
            Intent.ACTION_BATTERY_LOW,
            Intent.ACTION_BATTERY_OKAY -> {
                val state = BatteryManager.getBatteryState(context)
                updateAllWidgets(context, state)
            }
            ACTION_REFRESH_BATTERY -> {
                val state = BatteryManager.getBatteryState(context)
                updateAllWidgets(context, state)
                try {
                    val settingsIntent = Intent(Intent.ACTION_POWER_USAGE_SUMMARY).apply {
                        flags = Intent.FLAG_ACTIVITY_NEW_TASK
                    }
                    context.startActivity(settingsIntent)
                } catch (e: Exception) {
                    Log.w(TAG, "Unable to launch battery settings", e)
                }
            }
        }
    }
}
