# ENT-CHALLENGE — Challenge

## Description

A weight loss challenge instance. Created by one user who invites others to
join via an invite code or shareable link.

## Fields

| Field              | Type         | Nullable | Description                                    |
|--------------------|-------------|----------|------------------------------------------------|
| id                 | uuid (PK)    | No       | Challenge identifier                           |
| created_by         | uuid (FK)    | No       | User who created the challenge                 |
| name               | text         | No       | Challenge name (e.g., "BigDogs Summer 2026")   |
| invite_code        | text         | No       | Unique code for joining (e.g., "BIGDOGS-A3F9") |
| duration_weeks     | integer      | No       | Challenge length (10, 12, 14, or 16)           |
| max_participants   | integer      | No       | Max players (default 4)                        |
| showdowns_enabled  | boolean      | No       | Whether showdown weeks are active (default true)|
| is_public          | boolean      | No       | Whether a public view is available (default false)|
| timezone           | text         | No       | IANA timezone (e.g., "America/Chicago")        |
| spinup_start_date  | date         | No       | First day of spin-up week (start_date - 7)     |
| start_date         | date         | No       | First scored day (chosen at creation)          |
| status             | text         | No       | setup / spinup / active / complete             |
| created_at         | timestamptz  | No       | Creation timestamp                             |

## Status Lifecycle

```
setup → spinup → active → complete
```

- **setup** — Created, participants joining and completing onboarding.
  Transitions to `spinup` when the spinup_start_date arrives.
- **spinup** — 7-day baseline period. All participants weigh in daily.
  Transitions to `active` on start_date.
- **active** — Weekly scoring underway. Transitions to `complete` after the
  final week.
- **complete** — Challenge ended. Winner determined. Read-only.

## Invite Code

- Generated at creation time (e.g., `BIGDOGS-A3F9`)
- Used to join via direct entry or shareable link (`/join/{invite_code}`)
- Remains active while status is `setup`
- Deactivated once challenge moves to `spinup`

## Showdown Weeks

When `showdowns_enabled = true`:
- The last Friday of each calendar month during the challenge is a showdown
  (placement points doubled).
- The **final week is always a showdown** regardless of calendar position.
- When `showdowns_enabled = false`: all weeks use standard 4/3/2/1 scoring.

Showdown weeks are derived from `start_date` + calendar — not stored.

## Public View

When `is_public = true`, a read-only public URL is available showing:
- Leaderboard (rankings, placement points)
- Progress charts (trend shapes, progress bars)
- **No actual weight numbers** — protects participant privacy while letting
  them share the competition

## Notes

- `max_participants` defaults to 4 per the ruleset but is stored as a field
  for flexibility.
- `start_date` and `spinup_start_date` are set at creation time. The
  creation flow communicates that spin-up begins 7 days before the start date.
- All participants are equal once the challenge begins — no admin role.

## RLS Policies

- Creator can update challenge settings while in `setup` status
- All participants can read challenge data
- Non-participants cannot see challenge data

## Referenced By

- [ENT-PARTICIPANT](ENT-PARTICIPANT.md) — challenge_id FK
- [ENT-WEEKLY-RESULT](ENT-WEEKLY-RESULT.md) — challenge_id FK
