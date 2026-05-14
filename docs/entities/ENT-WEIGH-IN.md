# ENT-WEIGH-IN — Weigh-In

## Description

A single daily weight recording. Belongs to a User (not a Participant) so that
weigh-ins persist across solo tracking and challenge participation. The same
weigh-in data is used for both personal trend tracking and challenge scoring.

## Fields

| Field            | Type         | Nullable | Description                                  |
|------------------|-------------|----------|----------------------------------------------|
| id               | uuid (PK)    | No       | Weigh-in identifier                          |
| user_id          | uuid (FK)    | No       | Which user recorded this                     |
| date             | date         | No       | Calendar date of the weigh-in                |
| weight           | decimal      | No       | Recorded weight in lb                        |
| trend_weight     | decimal      | Yes      | 7-day rolling average (computed on write)    |
| valid_days_count | integer      | No       | How many of last 7 days have a reading       |
| created_at       | timestamptz  | No       | Submission timestamp                         |
| updated_at       | timestamptz  | Yes      | Last edit timestamp (same-day edits only)    |

## Trend Weight Computation

```
trend_weight = average(weights from last 7 calendar days where a reading exists)
```

- Requires minimum **5 of 7** days to update
- If `valid_days_count < 5`, trend_weight copies the previous day's trend
  (freeze behavior)
- `valid_days_count` is the count of readings in the 7-day window

## Constraints

- Unique on `(user_id, date)` — one weigh-in per day per user
- Edits allowed for any date (honor system) — `updated_at` is set on edit,
  trend weight recomputed for affected dates
- Weight must be > 0

## Notes

- Weigh-ins are owned by the User, not the Participant. This means:
  - Solo users can track weight without joining a challenge
  - When a user joins a challenge, their existing weigh-ins during the
    challenge period are automatically included in scoring
  - Weigh-in history persists if a challenge ends
- Trend computation is done server-side (edge function or database function)
  on each insert/update to keep it consistent

## RLS Policies

- Users can insert/read/update their own weigh-ins
- Co-participants can read each other's weigh-ins during a shared challenge
  period (joining a challenge implies consent to share data with co-participants)
- Public view (when challenge `is_public = true`) shows chart shapes only —
  no actual weight numbers exposed

## Referenced By

- Weekly scoring reads weigh-ins by user_id within challenge date boundaries
