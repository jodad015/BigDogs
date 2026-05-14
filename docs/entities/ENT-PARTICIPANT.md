# ENT-PARTICIPANT — Participant

## Description

A user enrolled in a specific challenge. Holds the challenge-specific goal
settings and status. A user can exist without being a participant (solo
tracking mode).

## Fields

| Field               | Type         | Nullable | Description                                    |
|---------------------|-------------|----------|------------------------------------------------|
| id                  | uuid (PK)    | No       | Participant identifier                         |
| challenge_id        | uuid (FK)    | No       | Which challenge                                |
| user_id             | uuid (FK)    | No       | Which user                                     |
| starting_weight     | decimal      | Yes      | 7-day spin-up average (set after spin-up)      |
| starting_bmi        | decimal      | Yes      | Computed from height + starting weight         |
| goal_method         | text         | Yes      | target_weight / percent_loss / target_bmi / weekly_pace / suggested_default |
| goal_input          | decimal      | Yes      | Raw value entered for chosen method            |
| target_weight       | decimal      | Yes      | Computed target weight (lb)                    |
| total_loss          | decimal      | Yes      | Computed total loss goal (lb)                  |
| weekly_target       | decimal      | Yes      | Committed weekly pace (lb/wk) — fixed          |
| healthy_floor_weight| decimal      | Yes      | BMI 18.5 weight + 2 lb buffer                 |
| status              | text         | No       | onboarding / spinup / active / maintenance / complete |
| created_at          | timestamptz  | No       | Join timestamp                                 |

## Status Lifecycle

```
onboarding → spinup → active → maintenance (optional) → complete
```

- **onboarding** — Joined challenge but hasn't finished goal setup
- **spinup** — In 7-day baseline period
- **active** — Challenge active, being scored weekly
- **maintenance** — Hit 100% of goal early, in ±2 lb band
- **complete** — Challenge ended

## Goal Computation

All five methods produce the same three outputs:

| Method            | Input              | Computation                          |
|-------------------|--------------------|--------------------------------------|
| target_weight     | target weight (lb) | total_loss = starting - target       |
| percent_loss      | percentage         | total_loss = % × starting            |
| target_bmi        | target BMI         | target_wt from BMI, then total_loss  |
| weekly_pace       | lb/wk              | total_loss = pace × weeks            |
| suggested_default | (none)             | pace = 1.5 lb/wk, total_loss = pace × weeks |

`weekly_target = total_loss / challenge.duration_weeks`

## Safety Rails (Applied at Goal Setting)

1. **Pace ceiling:** weekly_target > 2.0 lb/wk → warning with options
2. **Healthy floor:** target_weight < (BMI 18.5 weight + 2 lb) → blocked
3. **Already-healthy nudge:** current BMI < 22 → informational note

## Notes

- Height comes from the User entity, not duplicated here
- `starting_weight` is null until spin-up week completes (7-day average)
- Goal fields are null until onboarding is complete
- `weekly_target` is fixed for the entire challenge once set
- Unique constraint on (challenge_id, user_id) — one entry per challenge

## RLS Policies

- Participant can read/update their own record
- Co-participants can read (for leaderboard display)

## Referenced By

- [ENT-WEEKLY-RESULT](ENT-WEEKLY-RESULT.md) — participant_id FK
