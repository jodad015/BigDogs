# SCR-LEADERBOARD — Leaderboard

## Description
Overall challenge standings showing total placement points and progress
for each participant.

## Route
`/challenge/:id/leaderboard` (protected, participants only)

## Elements
- Participant rows (ranked by total points):
  - Rank indicator
  - Avatar + display name
  - Total placement points
  - Progress bar (% toward goal)
  - Status badge (active / maintenance)
- Challenge info bar: week X of Y, next showdown date

## Components Used
- [CMP-STANDING-ROW](../components/CMP-STANDING-ROW.md)
- [CMP-PLACEMENT-BADGE](../components/CMP-PLACEMENT-BADGE.md)
- [CMP-PROGRESS-BAR](../components/CMP-PROGRESS-BAR.md)

## Use Cases
- [UC-11 View Leaderboard](../use-cases/UC-11-view-leaderboard.md)
