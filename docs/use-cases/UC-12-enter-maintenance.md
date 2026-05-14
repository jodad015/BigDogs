# UC-12 — Enter Maintenance Mode

## Actor
System (triggered during weekly scoring — UC-9)

## Description
When a participant's cumulative scored loss reaches 100% of their total goal,
they automatically enter maintenance mode for the remaining weeks.

## Trigger
During UC-9 (Compute Weekly Scores), after computing cumulative_progress_pct:
```
if cumulative_progress_pct >= 100: participant.status = "maintenance"
```

## Maintenance Rules
- Each week, if trend weight is within **±2 lb** of target_weight:
  earn **1 point** (regular) or **2 points** (showdown)
- If trend drifts outside the band: **0 points**
- Continue daily weigh-ins through challenge end
- No weekly_score is computed (set to 0)

## Notes
- Maintenance is automatic — no user action required
- The ±2 lb band is checked against the participant's target_weight
- Maintenance points are smaller than on-pace scoring points by design —
  rushing to a small goal to collect maintenance points is a losing strategy

## References
- Entity: [ENT-PARTICIPANT](../entities/ENT-PARTICIPANT.md) (status → maintenance)
- Entity: [ENT-WEEKLY-RESULT](../entities/ENT-WEEKLY-RESULT.md) (is_maintenance = true)
