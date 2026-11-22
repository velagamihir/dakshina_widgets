package com.dakshina_widgets.battery

import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.Path
import android.graphics.RectF

object SmileyFaceRenderer {

    fun render(percentage: Int, isCharging: Boolean, size: Int = 512): Bitmap {
        val bitmap = Bitmap.createBitmap(size, size, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(bitmap)

        val clampedPct = percentage.coerceIn(0, 100)
        val cx = size / 2f
        val cy = size / 2f
        val radius = size * 0.44f

        // Status color: Vibrant Green -> Warm Amber -> Alert Red
        val primaryColor = when {
            isCharging -> Color.parseColor("#00E676")
            clampedPct >= 60 -> Color.parseColor("#00E676")
            clampedPct >= 20 -> Color.parseColor("#FFD600")
            else -> Color.parseColor("#FF5252")
        }

        val bgColor = Color.parseColor("#141416")
        val ringTrackColor = Color.parseColor("#26262B")

        // 1. Background Disc
        val bgPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            style = Paint.Style.FILL
            color = bgColor
        }
        canvas.drawCircle(cx, cy, radius, bgPaint)

        // 2. Battery Level Ring (Outer progress arc)
        val ringStrokeWidth = size * 0.045f
        val ringRect = RectF(
            cx - radius + ringStrokeWidth / 2f,
            cy - radius + ringStrokeWidth / 2f,
            cx + radius - ringStrokeWidth / 2f,
            cy + radius - ringStrokeWidth / 2f
        )

        // Track
        val trackPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            style = Paint.Style.STROKE
            strokeWidth = ringStrokeWidth
            color = ringTrackColor
        }
        canvas.drawArc(ringRect, 0f, 360f, false, trackPaint)

        // Progress sweep
        val progressPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            style = Paint.Style.STROKE
            strokeWidth = ringStrokeWidth
            color = primaryColor
            strokeCap = Paint.Cap.ROUND
        }
        val sweepAngle = (clampedPct / 100f) * 360f
        canvas.drawArc(ringRect, -90f, sweepAngle, false, progressPaint)

        // 3. Eyes
        val eyePaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            color = Color.WHITE
            style = Paint.Style.FILL
        }

        val eyeY = cy - size * 0.08f
        val eyeOffsetX = size * 0.14f
        val eyeRadius = size * 0.04f

        if (isCharging) {
            // Happy upward arcs ^ ^
            val chargeEyePaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
                color = primaryColor
                style = Paint.Style.STROKE
                strokeWidth = size * 0.022f
                strokeCap = Paint.Cap.ROUND
            }
            val leftEyeRect = RectF(
                cx - eyeOffsetX - eyeRadius * 1.5f,
                eyeY - eyeRadius,
                cx - eyeOffsetX + eyeRadius * 1.5f,
                eyeY + eyeRadius
            )
            canvas.drawArc(leftEyeRect, 180f, 180f, false, chargeEyePaint)

            val rightEyeRect = RectF(
                cx + eyeOffsetX - eyeRadius * 1.5f,
                eyeY - eyeRadius,
                cx + eyeOffsetX + eyeRadius * 1.5f,
                eyeY + eyeRadius
            )
            canvas.drawArc(rightEyeRect, 180f, 180f, false, chargeEyePaint)
        } else if (clampedPct <= 15) {
            // Dead / exhausted eyes: x x
            val xEyePaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
                color = primaryColor
                style = Paint.Style.STROKE
                strokeWidth = size * 0.022f
                strokeCap = Paint.Cap.ROUND
            }
            val d = eyeRadius * 0.9f
            // Left X
            val lx = cx - eyeOffsetX
            canvas.drawLine(lx - d, eyeY - d, lx + d, eyeY + d, xEyePaint)
            canvas.drawLine(lx - d, eyeY + d, lx + d, eyeY - d, xEyePaint)
            // Right X
            val rx = cx + eyeOffsetX
            canvas.drawLine(rx - d, eyeY - d, rx + d, eyeY + d, xEyePaint)
            canvas.drawLine(rx - d, eyeY + d, rx + d, eyeY - d, xEyePaint)
        } else {
            // Normal expressive circular eyes
            canvas.drawCircle(cx - eyeOffsetX, eyeY, eyeRadius, eyePaint)
            canvas.drawCircle(cx + eyeOffsetX, eyeY, eyeRadius, eyePaint)
        }

        // 4. Mouth (Bézier curve morphing from smile to neutral to frown)
        val mouthPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            color = primaryColor
            style = Paint.Style.STROKE
            strokeWidth = size * 0.028f
            strokeCap = Paint.Cap.ROUND
        }

        val mouthBaseY = cy + size * 0.10f
        val mouthWidth = size * 0.28f
        val startX = cx - mouthWidth / 2f
        val endX = cx + mouthWidth / 2f
        // Ratio: +1.0 (at 100% max smile) -> 0.0 (at 50% flat line) -> -1.0 (at 0% deep frown)
        val ratio = (clampedPct - 50) / 50f
        val maxCurveDepth = size * 0.12f
        val controlY = mouthBaseY + (ratio * maxCurveDepth)

        val mouthPath = Path().apply {
            moveTo(startX, mouthBaseY)
            quadTo(cx, controlY, endX, mouthBaseY)
        }
        canvas.drawPath(mouthPath, mouthPaint)

        // 5. Battery Percentage Text below mouth
        val textPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            color = Color.WHITE
            textSize = size * 0.09f
            textAlign = Paint.Align.CENTER
            isFakeBoldText = true
        }
        val label = if (isCharging) "$clampedPct% ⚡" else "$clampedPct%"
        val textY = cy + size * 0.31f
        canvas.drawText(label, cx, textY, textPaint)

        return bitmap
    }
}
