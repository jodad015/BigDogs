# SCR-ONBOARDING — Design Prompt

## Form Factor
iPhone, 390x844. Desktop, 1440x900.

## Design Direction
A focused multi-step wizard. Each step should feel like one clear question —
no visual clutter. Progress indicator at top so users know where they are.
The safety rails should feel protective, not punitive. The final review
should feel like a contract you're signing with yourself.

Dark background throughout. Bold numbers when showing computed values.

## Variants

Create **4 variants side by side** (mobile), then **4 desktop**:

---

### VARIANT 1 — "SCR-ONBOARDING / Step 1 — Height"

First step after joining a challenge.

**Layout (top to bottom):**

**Header:**
- Back arrow top-left
- "Set Up Your Challenge" title, centered
- Progress dots: ● ○ ○ ○ (step 1 of 4)

**Content (centered):**
- "What's your height?" — large, white, bold
- Height input — two side-by-side inputs: feet + inches
  - Large number inputs, dark bg with border
  - "ft" and "in" labels next to each
  - Pre-filled if height exists on profile
- Helper text: "Used for safety checks only — never shared"

**Action (bottom):**
- "Next" button — full width, accent color

---

### VARIANT 2 — "SCR-ONBOARDING / Step 2 — Goal Method"

Choosing how to set the weight loss goal.

**Layout:**
- Same header, progress: ○ ● ○ ○

**Content:**
- "How do you want to set your goal?" — large, white
- 5 selectable cards stacked vertically:
  - "I want to reach ___ lb" — target weight
  - "I want to lose ___%" — percent body weight
  - "I want to hit BMI ___" — target BMI
  - "I'll lose ___ lb/week" — weekly pace
  - "Use the suggested pace" — 1.5 lb/wk default
- Each card: dark bg (#252547), rounded, label + brief description
- Selected card: accent color left border + subtle accent bg tint
- The "suggested" card shows "1.5 lb/week — a steady, sustainable pace"

**Action:**
- "Next" button — active when a method is selected

---

### VARIANT 3 — "SCR-ONBOARDING / Step 3 — Goal Input + Safety Rail"

Entering goal value with a pace ceiling warning triggered.

**Layout:**
- Same header, progress: ○ ○ ● ○

**Content:**
- Selected method reminder: "Target weight" in muted text
- Large input: "165" lb — big number, editable
- Computed preview below:
  - "Total loss: 30.0 lb"
  - "Weekly pace: 2.5 lb/wk"
- **Safety rail alert (amber, inline):**
  - Warning icon + "That requires 2.5 lb/week — above the 2 lb/wk
    sustainable max."
  - 3 option cards below:
    1. "Lower goal to 171 lb" (fits 2.0 lb/wk)
    2. "Extend challenge to 15 weeks" (fits goal safely)
    3. "Keep as stretch goal" (warned about penalty)
  - Each option is a selectable card, outlined

**Action:**
- "Next" button — active when an option is chosen

---

### VARIANT 4 — "SCR-ONBOARDING / Step 4 — Review & Confirm"

Final review before locking in the goal.

**Layout:**
- Same header, progress: ○ ○ ○ ●

**Content:**
- "Review Your Goal" — large, white, bold
- Summary card (dark bg, rounded, padded):
  - Goal method: "Target Weight"
  - Target weight: "171 lb" — bold
  - Total loss: "24.0 lb"
  - Weekly target: "2.0 lb/wk"
  - Challenge: "12 weeks"
- Disclaimer text in muted: "This pace is locked for the entire challenge"

**Action:**
- "Confirm & Start" button — accent color, full width, bold
- "Go Back" text link below — muted

---

## Components Referenced
- CMP-GOAL-PICKER — goal method selection cards
- CMP-SAFETY-ALERT — inline safety rail warnings

## Specs
- [SCR-ONBOARDING](../../docs/screens/SCR-ONBOARDING.md)

## Use Cases
- [UC-6 Complete Onboarding](../../docs/use-cases/UC-6-complete-onboarding.md)
