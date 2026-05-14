# SCR-ONBOARDING — Challenge Onboarding

## Description
Multi-step flow for a new participant to set their height, review info,
and choose a weight loss goal with safety rail feedback.

## Route
`/challenge/:id/onboarding` (protected, participant only)

## Steps

### Step 1: Height
- Height input (feet + inches or total inches)
- Pre-filled if already set on profile
- Next button

### Step 2: Goal Method
- 5 options displayed as selectable cards:
  - Target weight
  - % body weight loss
  - Target BMI
  - Weekly pace (lb/wk)
  - Suggested default (1.5 lb/wk)
- Selecting a method reveals the input field (except suggested default)

### Step 3: Goal Input + Safety Rails
- Input field for chosen method
- Real-time computation preview: target weight, total loss, weekly pace
- Safety rail alerts appear inline:
  - **Pace ceiling** (amber): 3 options
  - **Healthy floor** (red): blocks Next
  - **Already healthy** (blue): dismissable info

### Step 4: Review & Confirm
- Summary: target weight, total loss, weekly target
- Confirm button → finalizes goal
- Back button → return to adjust

## Components Used
- [CMP-GOAL-PICKER](../components/CMP-GOAL-PICKER.md)
- [CMP-SAFETY-ALERT](../components/CMP-SAFETY-ALERT.md)

## Use Cases
- [UC-6 Complete Onboarding](../use-cases/UC-6-complete-onboarding.md)
