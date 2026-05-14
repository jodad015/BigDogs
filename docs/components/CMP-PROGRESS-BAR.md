# CMP-PROGRESS-BAR — Progress Bar

## Description
Visual progress indicator showing how far a participant is toward their
total loss goal.

## Props
| Prop       | Type    | Description                     |
|------------|---------|---------------------------------|
| progressPct| number  | 0–100+ (can exceed 100)         |
| label      | string? | Optional label (e.g., "65%")    |
| showTarget | boolean | Show 100% marker                |

## Behavior
- Fill color changes based on progress:
  - 0–25%: starting color
  - 25–75%: mid color
  - 75–100%: near-goal color
  - 100%+: maintenance color
- Overflow beyond 100% shown subtly (not extending bar)

## Used On
SCR-DASHBOARD, SCR-TREND, SCR-LEADERBOARD, SCR-PARTICIPANT
