# SCR-WEEKLY — Weekly Results

## Description
Score breakdown for a specific challenge week. Shows all participants'
scores and placements.

## Route
`/challenge/:id/week/:weekNumber` (protected, participants only)

## Elements
- Week header: "Week 3 — May 2 – May 9" + Showdown badge
- Participant score cards (ranked by placement):
  - Placement badge
  - Display name
  - Weekly loss
  - Performance factor indicator
  - Weekly score
  - Points earned
- Week navigation: ← Previous | Next →

## Components Used
- [CMP-SCORE-CARD](../components/CMP-SCORE-CARD.md)
- [CMP-PLACEMENT-BADGE](../components/CMP-PLACEMENT-BADGE.md)
- [CMP-WEEK-SELECTOR](../components/CMP-WEEK-SELECTOR.md)
- [CMP-SHOWDOWN-BANNER](../components/CMP-SHOWDOWN-BANNER.md)

## Use Cases
- [UC-10 View Weekly Results](../use-cases/UC-10-view-weekly-results.md)
