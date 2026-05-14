# CMP-STANDING-ROW — Leaderboard Row

## Description
A single row in the leaderboard showing a participant's overall standing.

## Props
| Prop          | Type    | Description                     |
|---------------|---------|---------------------------------|
| rank          | number  | Current rank (1-4)              |
| displayName   | string  | Participant name                |
| totalPoints   | number  | Cumulative placement points     |
| progressPct   | number  | % toward total loss goal        |
| status        | string  | active / maintenance / complete |
| isCurrentUser | boolean | Highlight if this is the viewer |

## Display
- Rank number or badge
- Avatar + name
- Total points (bold)
- Progress bar
- Status indicator

## Used On
SCR-DASHBOARD, SCR-LEADERBOARD
