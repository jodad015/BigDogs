# CMP-WEIGHT-INPUT — Weight Input

## Description
Large numeric input for entering body weight. Designed for quick,
one-handed entry on mobile.

## Props
| Prop        | Type     | Description                       |
|-------------|----------|-----------------------------------|
| value       | number   | Current weight value              |
| onChange    | function | Callback when value changes       |
| placeholder | string   | Hint text (e.g., yesterday's weight) |
| unit        | string   | "lb" (default)                    |

## Behavior
- Uses `inputmode="decimal"` for mobile numeric keyboard
- Large font size for readability
- Accepts one decimal place (e.g., 185.4)
- Auto-focuses on mount

## Used On
SCR-WEIGH-IN, SCR-SPINUP
