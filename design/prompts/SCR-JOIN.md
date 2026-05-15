# SCR-JOIN — Design Prompt

## Form Factor
iPhone, 390x844. Desktop, 1440x900.

## Design Direction
Simple, fast. The invite code is the star — big input, immediate feedback.
When a valid code is entered, the challenge preview should build excitement:
who's in, what's the challenge, you're about to compete. Error states should
be clear but not harsh.

## Variants

Create **3 variants side by side** (mobile), then **3 desktop**:

---

### VARIANT 1 — "SCR-JOIN / Code Entry"

User hasn't entered a code yet.

**Layout (top to bottom):**

**Header:**
- Back arrow top-left
- "Join Challenge" title, centered, white bold text

**Content (centered vertically):**
- Trophy or handshake icon, muted, 48-64px
- "Enter your invite code" — white, 18pt, medium weight
- Large code input — centered, monospace font, letter-spaced, dark bg with
  border, placeholder "BDOG-XXXX", auto-uppercase
- "Join" button below — full width, accent color, disabled until code entered
- Small text: "Got a link instead? Just open it in your browser"

**Bottom nav:** Same as dashboard

---

### VARIANT 2 — "SCR-JOIN / Challenge Preview"

Valid code entered, showing challenge details before confirming.

**Layout:**
- Same header
- Challenge preview card:
  - Challenge name: "Office BigDogs Q3" — bold, white
  - Creator: "Created by Jeff" — muted
  - Duration: "12 weeks starting June 2"
  - Participants: "2 of 4 joined" with small avatar circles
  - Showdown badge if enabled
- "Join This Challenge" button — accent color, full width, active
- Small text: "You'll set your goal after joining"

---

### VARIANT 3 — "SCR-JOIN / Error States"

Show various error conditions.

**Layout:**
- Same header + code input
- Code input has red border
- Error message below input in red:
  - "Challenge not found" (invalid code)
  - OR "This challenge is full" (4/4 participants)
  - OR "This challenge has already started"
- Join button disabled

---

## Components Referenced
- CMP-NAV-BAR — bottom navigation
- CMP-PARTICIPANT-AVATAR — preview of who's joined

## Specs
- [SCR-JOIN](../../docs/screens/SCR-JOIN.md)

## Use Cases
- [UC-5 Join Challenge](../../docs/use-cases/UC-5-join-challenge.md)
