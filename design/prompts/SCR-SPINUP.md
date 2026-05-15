# SCR-SPINUP — Design Prompt

## Form Factor
iPhone, 390x844. Desktop, 1440x900.

## Design Direction
Week 1 of the challenge — the baseline week. No scoring yet, just daily
weigh-ins to establish everyone's starting weight. Should feel like a
warm-up: building anticipation, building the habit, building accountability.
The day counter is the anchor. The group check-in status creates social
pressure to show up. Not as intense as the scored weeks, but purposeful.

## Variants

Create **3 variants side by side** (mobile), then **3 desktop**:

---

### VARIANT 1 — "SCR-SPINUP / Day 3 of 7 — In Progress"

Mid-baseline week, user has weighed in today.

**Layout (top to bottom):**

**Header (brand navy):**
- "Baseline Week" title, centered, white
- Challenge name below: "Office BigDogs Q3" in muted text

**Day counter (prominent):**
- Large circular or badge-style counter: "Day 3 of 7"
- Progress ring or bar showing 3/7 complete
- "Scoring begins next week" — muted text

**Today's status:**
- Green check + "Weighed in today: 195.2 lb"
- Or if not yet: amber + "Not weighed in today" with CTA

**Running average card:**
- "Starting Weight" label
- "194.8 lb" — bold, large (average of days so far)
- "Based on 3 weigh-ins" — muted
- Mini bar chart showing daily entries so far

**Group check-in status:**
- "Today's Check-Ins" section header
- List of participants with check/pending icons:
  - Jeff ✓ (green)
  - Alice ✓ (green)
  - Bob ○ (gray, pending)
  - Carol ○ (gray, pending)

**Bottom nav:** Same as dashboard

---

### VARIANT 2 — "SCR-SPINUP / Day 7 of 7 — Complete"

Final day of baseline week, all weigh-ins done.

**Same layout, except:**
- Day counter: "Day 7 of 7" — fully filled progress
- "Scoring starts tomorrow!" — accent color, bold
- Running average: "195.0 lb" based on 7 entries
- All participants show green checks
- Celebratory tone: "Baseline locked" or "You're ready"

---

### VARIANT 3 — "SCR-SPINUP / Not Weighed In Today"

User needs to log today's weight.

**Same layout as Variant 1, except:**
- Today's status: amber warning, "You haven't weighed in today"
- Prominent "Log Weight" button — accent color, below the status
- Group check-in shows this user as pending while others may have checked in
- Subtle urgency without being annoying

---

## Components Referenced
- CMP-WEIGH-IN-STATUS — group check-in list
- CMP-NAV-BAR — bottom navigation

## Specs
- [SCR-SPINUP](../../docs/screens/SCR-SPINUP.md)

## Use Cases
- [UC-7 Record Weigh-In](../../docs/use-cases/UC-7-record-weigh-in.md)
