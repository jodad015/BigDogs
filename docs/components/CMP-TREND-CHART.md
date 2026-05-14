# CMP-TREND-CHART — Weight Trend Chart

## Description
Line chart showing daily weight recordings and 7-day trend line over time.
Optionally shows a target weight reference line.

## Props
| Prop        | Type       | Description                           |
|-------------|------------|---------------------------------------|
| weighIns    | WeighIn[]  | Array of {date, weight, trend_weight} |
| targetWeight| number?    | Optional target reference line        |
| dateRange   | string     | "2w" / "1m" / "all"                  |
| compact     | boolean    | Mini version for dashboard (no axes)  |

## Behavior
- Dots for daily weights, smooth curve for trend
- Target weight shown as dashed horizontal line
- Responsive: full width, aspect ratio maintained
- Compact mode: smaller, no axis labels (for dashboard embed)
- Handles gaps in data gracefully

## Chart Library
TBD — candidates: Recharts, Chart.js, or Nivo

## Used On
SCR-DASHBOARD (compact), SCR-TREND, SCR-PARTICIPANT, SCR-SPINUP
