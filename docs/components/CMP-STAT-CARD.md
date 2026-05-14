# CMP-STAT-CARD — Stat Card

## Description
Generic card for displaying a single statistic with label and value.

## Props
| Prop  | Type   | Description                           |
|-------|--------|---------------------------------------|
| label | string | Stat name (e.g., "Trend Weight")      |
| value | string | Formatted value (e.g., "183.2 lb")    |
| delta | string?| Change indicator (e.g., "−1.1 lb")    |
| trend | string?| "up" / "down" / "flat" for color/icon |

## Behavior
- Delta shown with arrow icon and color (green for down, red for up in
  weight context)
- Compact layout for grid display

## Used On
SCR-DASHBOARD, SCR-TREND
