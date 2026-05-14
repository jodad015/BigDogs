# ENT-WEEKLY-RESULT — Weekly Result

## Description

Computed weekly score and placement for a participant in a challenge. Created
by the scoring system at the end of each challenge week (Friday).

## Fields

| Field                   | Type         | Nullable | Description                                    |
|-------------------------|-------------|----------|------------------------------------------------|
| id                      | uuid (PK)    | No       | Result identifier                              |
| participant_id          | uuid (FK)    | No       | Which participant                              |
| challenge_id            | uuid (FK)    | No       | Which challenge (denormalized for querying)     |
| week_number             | integer      | No       | Week number within the challenge (1-based)     |
| week_start_date         | date         | No       | Friday start of this scoring week              |
| week_end_date           | date         | No       | Friday end of this scoring week                |
| start_trend             | decimal      | No       | Participant's trend weight at week start       |
| end_trend               | decimal      | No       | Participant's trend weight at week end         |
| weekly_loss             | decimal      | No       | start_trend - end_trend (positive = lost)      |
| performance_ratio       | decimal      | No       | weekly_loss / weekly_target                    |
| performance_factor      | decimal      | No       | Scoring factor (see formula)                   |
| cumulative_scored_loss  | decimal      | No       | Running sum of (target × factor) through this wk|
| cumulative_progress_pct | decimal      | No       | cumulative_scored_loss / total_loss × 100      |
| difficulty_multiplier   | decimal      | No       | 1 + (progress / 100), capped at 2.0           |
| weekly_score            | decimal      | No       | target × factor × multiplier                  |
| placement               | integer      | No       | Rank this week (1–4)                           |
| placement_points        | integer      | No       | Points earned (4/3/2/1, doubled in showdowns)  |
| is_showdown             | boolean      | No       | Whether this is a showdown week                |
| is_maintenance          | boolean      | No       | Whether participant was in maintenance mode    |

## Scoring Formulas

### Performance Factor
```
if ratio <= 1.0:  factor = ratio
if ratio >  1.0:  factor = max(0, 1 - 2 * (ratio - 1))
```

Asymmetric: undershooting is proportional, overshooting is penalized 2x.

### Difficulty Multiplier
```
cumulative_scored_loss = sum of (weekly_target * performance_factor) from weeks 1..N-1
cumulative_progress = cumulative_scored_loss / total_loss * 100
multiplier = min(2.0, 1 + (cumulative_progress / 100))
```

Later weeks are worth more because losing weight gets harder.

### Weekly Score
```
weekly_score = weekly_target * performance_factor * difficulty_multiplier
```

### Placement Points
| Placement | Regular | Showdown |
|-----------|--------:|---------:|
| 1st       | 4       | 8        |
| 2nd       | 3       | 6        |
| 3rd       | 2       | 4        |
| 4th       | 1       | 2        |

### Tie Rules
Ties take the higher placement value; next solo placement drops by tie count.

### Maintenance Mode
- If `is_maintenance = true`: participant earns 1 pt (regular) or 2 pts
  (showdown) if trend stays within ±2 lb of target weight, else 0 pts.
- `weekly_score` is set to 0 during maintenance (no scored loss).

## Showdown Detection
```
is_showdown = (week_end_date is the last Friday of its calendar month)
```

## Notes

- Results are computed by an edge function, not by the client
- `challenge_id` is denormalized from Participant for efficient leaderboard queries
- One row per participant per week
- Unique constraint on `(participant_id, week_number)`

## RLS Policies

- All participants in the challenge can read all weekly results for that challenge
- System (edge function with service role) inserts results

## Referenced By

- Leaderboard aggregates placement_points across all weeks
- Dashboard shows most recent weekly result
