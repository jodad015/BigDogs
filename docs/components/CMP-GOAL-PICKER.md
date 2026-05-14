# CMP-GOAL-PICKER — Goal Method Selector

## Description
Selectable card list for choosing one of the five goal-setting methods
during onboarding.

## Props
| Prop     | Type     | Description                      |
|----------|----------|----------------------------------|
| selected | string?  | Currently selected method        |
| onSelect | function | Callback when method is chosen   |

## Options
| Method            | Label                  | Requires Input |
|-------------------|------------------------|:--------------:|
| target_weight     | "I want to reach __ lb"| Yes            |
| percent_loss      | "I want to lose __% "  | Yes            |
| target_bmi        | "I want to hit BMI __" | Yes            |
| weekly_pace       | "I'll lose __ lb/week" | Yes            |
| suggested_default | "Use the default pace" | No             |

## Behavior
- Cards are selectable (radio-style)
- Selecting a method reveals the input field below (except suggested_default)
- Only one can be selected at a time

## Used On
SCR-ONBOARDING (Step 2)
