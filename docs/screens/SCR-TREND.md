# SCR-TREND — Weight Trend

## Description
Full weight trend chart with daily weights, trend line, and stats.
Available to all users (solo and challenge).

## Route
`/trend` (protected)

## Elements
- Line chart: daily weights (dots) + trend line (smooth curve)
- Target weight reference line (from challenge goal or personal target)
- Date range selector (last 2 weeks / month / all time)
- Stats panel:
  - Current trend weight
  - This week's change
  - Total change from start
  - Days tracked
  - Streak (consecutive days with weigh-in)

## Components Used
- [CMP-TREND-CHART](../components/CMP-TREND-CHART.md)
- [CMP-STAT-CARD](../components/CMP-STAT-CARD.md)

## Use Cases
- [UC-8 View Weight Trend](../use-cases/UC-8-view-weight-trend.md)
