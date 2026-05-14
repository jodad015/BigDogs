# CMP-PARTICIPANT-AVATAR — Participant Avatar

## Description
Participant display with initials-based avatar and status indicator.

## Props
| Prop        | Type   | Description                          |
|-------------|--------|--------------------------------------|
| displayName | string | Participant name (initials derived)  |
| status      | string | active / maintenance / complete      |
| size        | string | "sm" / "md" / "lg"                  |

## Display
- Circle with initials (first letter of display name)
- Status dot: green (active), blue (maintenance), gray (complete)
- Background color derived from name (consistent per user)

## Used On
SCR-PARTICIPANT, SCR-LEADERBOARD
