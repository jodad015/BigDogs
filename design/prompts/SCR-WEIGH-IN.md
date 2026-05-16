# SCR-WEIGH-IN — Design Prompt

## Form Factor
iPhone, 390x844.

## Design Direction
The most frequent interaction in the app. Should feel like tapping a number
and done — under 5 seconds. Big digits, minimal chrome, confirm button in
the thumb zone. Think scoreboard entry, not health form.

Dark background to match the brand. The weight number should dominate the
screen visually.

## Variants

Create **3 variants side by side**:

---

### VARIANT 1 — "SCR-WEIGH-IN / Entry"

User is entering today's weight.

**Layout (top to bottom):**

**Header (brand navy):**
- "Log Weight" title, centered, white bold text
- Date below: "Wednesday, May 14" in muted text
- X or back arrow top-left to close/go back

**Weight display (center of screen, dominant):**
- Very large number display: "183.2" — white, extra bold, 48-60pt equivalent
- "lb" unit label to the right, smaller, muted
- This is the live input — updates as user types
- Subtle underline or bottom border on the number to indicate it's editable

**Reference info (below the number, subtle):**
- "Yesterday: 184.0 lb" in small muted text — gives context, not editable

**Input area:**
- The number is the input — tapping it brings up decimal numpad
- Or: dedicated large digit buttons (0-9 + decimal + backspace) styled into
  the screen, calculator-style, brand navy buttons with white text
- Either approach works — the key is BIG touch targets

**Confirm button (bottom, thumb zone):**
- "Save" or "Log It" — full width, accent color, bold white text, 56px height
- Anchored to bottom with safe area padding

**Bottom nav:** Same as dashboard

---

### VARIANT 2 — "SCR-WEIGH-IN / Success"

Weight just saved. Brief confirmation before returning to dashboard.

**Layout:**
- Same header
- Large green checkmark icon, centered
- "183.2 lb" confirmed weight, bold
- "Trend: 183.8 lb" — updated trend weight shown below
- Brief delta: "↓ 0.6 lb from trend" in green text
- Auto-returns to dashboard after 2 seconds, or tap anywhere to dismiss

**Feel:** Satisfying, quick, like a receipt

---

### VARIANT 3 — "SCR-WEIGH-IN / Already Logged"

User already weighed in today. Showing current value with edit option.

**Layout:**
- Same header, but subtitle says "Already logged today"
- Current weight displayed large: "183.2"
- "Edit" button or the number itself is tappable to modify
- "Update" button at bottom (instead of "Log It") — same accent style
- Small text: "Last updated 7:32 AM" in muted color

---

## Components Referenced
- CMP-WEIGHT-INPUT — the large numeric input
- CMP-NAV-BAR — bottom navigation

## Specs
- [SCR-WEIGH-IN](../../docs/screens/SCR-WEIGH-IN.md)

## Use Cases
- [UC-7 Record Weigh-In](../../docs/use-cases/UC-7-record-weigh-in.md)
