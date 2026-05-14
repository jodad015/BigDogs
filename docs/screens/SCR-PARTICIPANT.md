# SCR-PARTICIPANT — Participant Detail

## Description
View another participant's challenge progress. Respects privacy settings.

## Route
`/challenge/:id/participant/:participantId` (protected, co-participants only)

## Elements
- Display name + avatar
- Status badge (active / maintenance / complete)
- Progress bar toward goal
- Weekly score history (list of score cards)
- Trend chart (if weight transparency enabled — GAP-10)
- Stats: total points, best week, current streak

## Components Used
- [CMP-TREND-CHART](../components/CMP-TREND-CHART.md)
- [CMP-SCORE-CARD](../components/CMP-SCORE-CARD.md)
- [CMP-PROGRESS-BAR](../components/CMP-PROGRESS-BAR.md)
- [CMP-PLACEMENT-BADGE](../components/CMP-PLACEMENT-BADGE.md)
- [CMP-PARTICIPANT-AVATAR](../components/CMP-PARTICIPANT-AVATAR.md)

## Use Cases
- [UC-15 View Participant](../use-cases/UC-15-view-participant.md)
