# UC-11 — View Leaderboard

## Actor
Participant in an active or completed challenge

## Description
View the overall challenge standings: total placement points, progress
toward goal, and current trend for each participant.

## Journey

```mermaid
sequenceDiagram
    actor P as Participant
    participant L as Leaderboard Screen
    participant EF as Edge Function
    participant DB as Database

    P->>L: Navigate to Leaderboard
    L->>EF: getLeaderboard(challenge_id)
    EF->>DB: Aggregate placement_points by participant
    EF->>DB: Get current trend weight + progress for each
    EF-->>L: Leaderboard data
    L-->>P: Display standings
```

## Display Elements
- For each participant (ranked by total points):
  - Rank
  - Display name + avatar
  - Total placement points
  - Progress bar (% toward goal)
  - Current trend weight (if privacy allows — see GAP-10)
  - Status badge (active / maintenance)
- Challenge info: weeks remaining, next showdown date

## References
- Screen: [SCR-LEADERBOARD](../screens/SCR-LEADERBOARD.md)
- Components: [CMP-STANDING-ROW](../components/CMP-STANDING-ROW.md), [CMP-PROGRESS-BAR](../components/CMP-PROGRESS-BAR.md)
