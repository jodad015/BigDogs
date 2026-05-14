# DLG-SAFETY-RAIL — Safety Rail Warning

## Description
Inline alert displayed during onboarding (SCR-ONBOARDING) when a safety
rail is triggered. Not a modal — appears inline in the goal-setting step.

## Variants

### Pace Ceiling (amber)
Shown when weekly target > 2.0 lb/wk.
- Message: "That requires X lb/week — above the 2 lb/wk sustainable max."
- 3 options as selectable cards:
  1. Lower goal to ___ lb (keeps safe pace)
  2. Extend challenge to ___ weeks (keeps goal at safe pace)
  3. Keep as stretch goal (warned about scoring penalty)

### Healthy Floor (red)
Shown when target weight < BMI 18.5 weight + 2 lb.
- Message: "Your target is below the healthy minimum of ___ lb."
- Blocks progression — must adjust goal
- No dismiss option

### Already Healthy (blue)
Shown when current BMI < 22.
- Message: "You're already at a healthy weight. Consider a smaller,
  fitness-focused target."
- Dismissable — informational only

## Components Used
- [CMP-SAFETY-ALERT](../components/CMP-SAFETY-ALERT.md)

## Use Cases
- [UC-6 Complete Onboarding](../use-cases/UC-6-complete-onboarding.md)
