package com.dakshina_widgets.torch

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.widget.RemoteViews
import com.dakshina_widgets.R

class TorchWidgetProvider : AppWidgetProvider() {

    companion object {
        const val ACTION_TOGGLE_TORCH = "com.dakshina_widgets.ACTION_TOGGLE_TORCH"

        fun updateAllWidgets(context: Context, isTorchOn: Boolean) {
            val appWidgetManager = AppWidgetManager.getInstance(context) ?: return
            val componentName = ComponentName(context, TorchWidgetProvider::class.java)
            val widgetIds = appWidgetManager.getAppWidgetIds(componentName) ?: return

            for (widgetId in widgetIds) {
                val views = buildRemoteViews(context, isTorchOn)
                appWidgetManager.updateAppWidget(widgetId, views)
            }
        }

        private fun buildRemoteViews(context: Context, isTorchOn: Boolean): RemoteViews {
            val views = RemoteViews(context.packageName, R.layout.widget_torch_layout)

            val intent = Intent(context, TorchWidgetProvider::class.java).apply {
                action = ACTION_TOGGLE_TORCH
            }
            val pendingIntent = PendingIntent.getBroadcast(
                context,
                0,
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )

            views.setOnClickPendingIntent(R.id.widget_torch_container, pendingIntent)

            if (isTorchOn) {
                views.setImageViewResource(R.id.widget_torch_icon, R.drawable.ic_torch_on)
                views.setInt(
                    R.id.widget_torch_container,
                    "setBackgroundResource",
                    R.drawable.bg_torch_widget_on
                )
            } else {
                views.setImageViewResource(R.id.widget_torch_icon, R.drawable.ic_torch_off)
                views.setInt(
                    R.id.widget_torch_container,
                    "setBackgroundResource",
                    R.drawable.bg_torch_widget_off
                )
            }

            return views
        }
    }

    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        TorchManager.init(context)
        val isTorchOn = TorchManager.isTorchActive()
        for (widgetId in appWidgetIds) {
            val views = buildRemoteViews(context, isTorchOn)
            appWidgetManager.updateAppWidget(widgetId, views)
        }
    }

    override fun onReceive(context: Context, intent: Intent) {
        super.onReceive(context, intent)
        if (intent.action == ACTION_TOGGLE_TORCH) {
            TorchManager.toggle(context)
        }
    }
}
