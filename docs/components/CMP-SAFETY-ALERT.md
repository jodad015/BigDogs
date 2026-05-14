# CMP-SAFETY-ALERT — Safety Rail Alert

## Description
Inline alert component for displaying safety rail warnings during
onboarding goal setting.

## Props
| Prop     | Type    | Description                                  |
|----------|---------|----------------------------------------------|
| type     | string  | "pace_ceiling" / "healthy_floor" / "nudge"   |
| message  | string  | Warning text                                 |
| options  | array?  | Action options (pace ceiling only)            |
| onSelect | function? | Callback when option is chosen             |
| onDismiss| function? | Callback for dismissable alerts (nudge)    |

## Variants
| Type           | Color  | Dismissable | Blocking |
|----------------|--------|:-----------:|:--------:|
| pace_ceiling   | Amber  | No          | No (offers options) |
| healthy_floor  | Red    | No          | Yes      |
| nudge          | Blue   | Yes         | No       |

## Used On
SCR-ONBOARDING (Step 3)
