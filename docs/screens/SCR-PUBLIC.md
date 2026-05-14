# SCR-PUBLIC — Public Challenge View

## Description
Read-only public view of a challenge. Available when the challenge creator
has enabled the public toggle. Shows competition progress without exposing
actual weight numbers.

## Route
`/public/:challengeId` (no auth required)

## Elements
- Challenge name + status (active / complete)
- Leaderboard: rankings + total placement points + display names
- Progress bars (% toward goal, no actual lb numbers)
- Trend chart shapes (relative movement, no Y-axis numbers)
- Week-by-week placement history
- Showdown week indicators (if enabled)
- Winner banner (if challenge is complete)

## Privacy
- **Shown:** display names, rankings, points, relative progress, chart shapes
- **Hidden:** actual weights, BMI, goal numbers, weigh-in values

## Navigation
- No app navigation (standalone page)
- "Join BigDogs" CTA for unauthenticated visitors → SCR-SIGNUP

## Components Used
- [CMP-STANDING-ROW](../components/CMP-STANDING-ROW.md) (points-only variant)
- [CMP-PROGRESS-BAR](../components/CMP-PROGRESS-BAR.md)
- [CMP-PLACEMENT-BADGE](../components/CMP-PLACEMENT-BADGE.md)
- [CMP-SHOWDOWN-BANNER](../components/CMP-SHOWDOWN-BANNER.md)

## Use Cases
- UC-17 View Public Challenge (new)
