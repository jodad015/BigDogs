# SCR-DASHBOARD — Dashboard

## Description
Main app screen after login. Content adapts based on user state: solo
tracking, challenge active, or spin-up in progress.

## Route
`/` (protected — home)

## Modes

### Solo Mode
- Weigh-in prompt (if not done today)
- Warning banner if weigh-in missed yesterday
- Current trend weight + weekly change
- Mini trend chart (14 days)
- Weight history (recent entries)
- Progress toward personal target (if set)
- CTAs: "Create a Challenge" / "Join a Challenge"

### Challenge — Spin-Up
- "Spin-Up Week: Day X of 7"
- Weigh-in prompt
- Running average so far
- Other participants' check-in status

### Challenge — Active
- Weigh-in prompt
- Warning banner if weigh-in missed yesterday
- Current trend + weekly change
- This week's pace vs target (visual)
- Standings snapshot (4 rows, ranked by total points)
- Showdown banner (if showdown week and showdowns enabled)
- Who has weighed in today

### Challenge — Complete
- Final standings
- Winner announcement
- Challenge summary stats

## Components Used
- [CMP-TREND-CHART](../components/CMP-TREND-CHART.md)
- [CMP-STANDING-ROW](../components/CMP-STANDING-ROW.md)
- [CMP-STAT-CARD](../components/CMP-STAT-CARD.md)
- [CMP-SHOWDOWN-BANNER](../components/CMP-SHOWDOWN-BANNER.md)
- [CMP-WEIGH-IN-STATUS](../components/CMP-WEIGH-IN-STATUS.md)
- [CMP-PROGRESS-BAR](../components/CMP-PROGRESS-BAR.md)

## Use Cases
- [UC-16 View Dashboard](../use-cases/UC-16-view-dashboard.md)
