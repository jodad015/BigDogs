# CMP-NAV-BAR — Bottom Navigation Bar

## Description
Fixed bottom navigation bar for primary app destinations. Mobile-friendly
thumb-zone placement.

## Tabs
| Tab         | Icon   | Route              |
|-------------|--------|--------------------|
| Dashboard   | Home   | `/`                |
| Weigh In    | Scale  | `/weigh-in`        |
| Leaderboard | Trophy | `/challenge/:id/leaderboard` |
| Profile     | User   | `/profile`         |

## Behavior
- Active tab highlighted
- Leaderboard tab only visible when in an active challenge
- Badge indicator on Weigh In tab if not weighed in today

## Used On
SCR-DASHBOARD, SCR-WEIGH-IN, SCR-TREND, SCR-WEEKLY, SCR-LEADERBOARD, SCR-SPINUP, SCR-PARTICIPANT, SCR-PROFILE
