# Test Scenarios

## Coverage Summary

| Category         | Framework    | Count | Status         |
|------------------|-------------|------:|----------------|
| Unit (shared)    | Vitest      |   TBD | ⬜ Not Started |
| Integration      | Vitest/Deno |   TBD | ⬜ Not Started |
| Web E2E          | Playwright  |   TBD | ⬜ Not Started |
| **Total**        |             |   TBD |                |

## Priority Test Areas

### Scoring Engine (Critical — Unit Tests)

The scoring formula is the heart of the app. These must be exhaustively tested:

- Performance factor: linear under target, 2x steep over target
- Performance factor edge cases: exact target (1.0), zero loss (0.0), 50%+ over (0.0)
- Difficulty multiplier: scales from 1.0 to 2.0 based on cumulative progress
- Weekly score computation: full formula integration
- Placement assignment: all tie scenarios (2-way 1st, 3-way 1st, tie 2nd, tie 3rd, all tied)
- Showdown week: doubled placement points
- Maintenance mode: ±2 lb band check, participation points only

### Trend Weight (Critical — Unit Tests)

- 7-day rolling average with all days present
- Rolling average with exactly 5 of 7 days (minimum)
- Trend freeze when below 5 of 7 days
- Trend recovery when days catch back up
- First 7 days (building up to full window)

### Safety Rails (Critical — Unit + Integration)

- Pace ceiling: trigger at > 2.0 lb/wk, verify options presented
- Healthy floor: block goal below BMI 18.5 + 2 lb buffer
- Already-healthy nudge: show when BMI < 22
- Goal computation from all 5 methods produces consistent (target, loss, pace)

### Onboarding Flow (Integration + E2E)

- Each goal-setting method produces correct computed values
- Safety rails interrupt flow correctly
- Spin-up week average becomes starting weight
- All 4 participants can complete onboarding independently

### Weekly Lifecycle (Integration)

- Friday-to-Friday boundary detection
- Showdown week detection (last Friday of calendar month)
- Maintenance mode trigger at 100% cumulative progress
- Challenge completion after final week
- Winner determination

### Weigh-In (E2E)

- Submit weight, verify trend updates
- Same-day edit
- Missed day handling (trend with gaps)
- Trend freeze behavior in UI

### Auth & Access (E2E)

- Sign up, log in, log out
- Protected routes redirect to login
- Participants can only see their own challenge data
- RLS policy enforcement
