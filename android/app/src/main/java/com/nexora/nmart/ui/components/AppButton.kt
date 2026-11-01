package com.nexora.nmart.ui.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.nexora.nmart.ui.theme.NavyDark
import com.nexora.nmart.ui.theme.PrimaryBlue
import com.nexora.nmart.ui.theme.RedError
import com.nexora.nmart.ui.theme.Slate200

enum class ButtonVariant {
    PRIMARY,
    SECONDARY,
    OUTLINE,
    DANGER
}

@Composable
fun AppButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    variant: ButtonVariant = ButtonVariant.PRIMARY,
    isLoading: Boolean = false,
    enabled: Boolean = true
) {
    val shape = RoundedCornerShape(12.dp)
    val buttonModifier = modifier
        .fillMaxWidth()
        .height(50.dp)

    if (variant == ButtonVariant.OUTLINE) {
        OutlinedButton(
            onClick = onClick,
            modifier = buttonModifier,
            enabled = enabled && !isLoading,
            shape = shape,
            border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline),
            colors = ButtonDefaults.outlinedButtonColors(
                contentColor = MaterialTheme.colorScheme.onSurface
            )
        ) {
            if (isLoading) {
                CircularProgressIndicator(
                    modifier = Modifier.size(20.dp),
                    strokeWidth = 2.dp,
                    color = MaterialTheme.colorScheme.primary
                )
            } else {
                Text(text = text, style = MaterialTheme.typography.labelLarge)
            }
        }
    } else {
        val (containerColor, contentColor) = when (variant) {
            ButtonVariant.PRIMARY -> Pair(PrimaryBlue, Color.White)
            ButtonVariant.SECONDARY -> Pair(NavyDark, Color.White)
            ButtonVariant.DANGER -> Pair(RedError, Color.White)
            ButtonVariant.OUTLINE -> Pair(Color.Transparent, PrimaryBlue)
        }

        Button(
            onClick = onClick,
            modifier = buttonModifier,
            enabled = enabled && !isLoading,
            shape = shape,
            colors = ButtonDefaults.buttonColors(
                containerColor = containerColor,
                contentColor = contentColor,
                disabledContainerColor = Slate200,
                disabledContentColor = Color.Gray
            )
        ) {
            if (isLoading) {
                CircularProgressIndicator(
                    modifier = Modifier.size(20.dp),
                    strokeWidth = 2.dp,
                    color = contentColor
                )
            } else {
                Text(text = text, style = MaterialTheme.typography.labelLarge)
            }
        }
    }
}
