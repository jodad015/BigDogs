# SCR-CREATE — Design Prompt

## Form Factor
iPhone, 390x844. Desktop, 1440x900.

## Design Direction
A form, but it should feel like setting up a competition — not filling out
insurance paperwork. Dark background, clear sections, confident confirm
action. The invite code reveal at the end should feel like a reward.

## Variants

Create **3 variants side by side** (mobile), then **3 desktop**:

---

### VARIANT 1 — "SCR-CREATE / Empty Form"

Fresh form, nothing filled in yet.

**Layout (top to bottom):**

**Header:**
- Back arrow top-left
- "Create Challenge" title, centered, white bold text

**Form (scrollable content area):**
- Challenge name input — dark input bg, white text, placeholder "Name your challenge"
- Duration picker — 4 pill-style options: 10 / 12 / 14 / 16 weeks, none selected
- Start date picker — shows a date input, helper text below:
  "Week 1 is the un-scored baseline week"
- Timezone picker — dropdown defaulting to user's local timezone,
  helper text: "Determines what 'today' means for everyone"
- Showdown weeks toggle — on by default, with label and helper text:
  "Last Friday of each month + final week = double points"
- Public challenge toggle — off by default, helper text:
  "Lets anyone view the leaderboard (no weight numbers)"

**Action (bottom, thumb zone):**
- "Create Challenge" button — full width, accent color, disabled/muted
  until required fields are filled

**Bottom nav:** Same as dashboard

---

### VARIANT 2 — "SCR-CREATE / Filled Form"

All fields completed, ready to submit.

**Same layout, except:**
- Name filled: "Office BigDogs Q3"
- Duration: "12 weeks" pill selected (accent color fill)
- Start date: "June 2, 2026" — helper shows "Week 1 is baseline, scoring starts Week 2"
- Timezone: "America/Chicago (CDT)"
- Showdown toggle: on
- Public toggle: off
- Create button: active, accent color, full opacity

---

### VARIANT 3 — "SCR-CREATE / Success (Invite Code)"

Challenge created. Showing the invite code.

**Layout:**
- Same header
- Large checkmark or party/trophy icon centered
- Challenge name: "Office BigDogs Q3" bold
- "12 weeks starting June 2"
- Large invite code display: "BDOG-X7K9" — monospace, high contrast,
  prominent visual treatment (card or badge)
- "Copy Code" button — outlined, with copy icon
- "Share Link" button — outlined, with share icon
- Or a single "Copy Invite Link" primary button
- Small text: "Share this code to invite others"
- "Go to Dashboard" text link below

---

## Components Referenced
- CMP-NAV-BAR — bottom navigation

## Specs
- [SCR-CREATE](../../docs/screens/SCR-CREATE.md)

## Use Cases
- [UC-4 Create Challenge](../../docs/use-cases/UC-4-create-challenge.md)
