# SCR-PARTICIPANT — Design Prompt

## Form Factor
iPhone, 390x844. Desktop, 1440x900.

## Design Direction
Viewing a competitor's profile. You're scouting the competition. Show their
progress, their scores, their trend — everything you'd want to know about
someone you're trying to beat. Respect privacy (no actual weight numbers
unless transparency is enabled), but make the data that IS shown feel rich.

## Variants

Create **3 variants side by side** (mobile), then **3 desktop**:

---

### VARIANT 1 — "SCR-PARTICIPANT / Active — Full Data"

Viewing an active competitor with several weeks of data.

**Layout (top to bottom):**

**Header:**
- Back arrow top-left
- Participant name: "Alice" — centered, bold

**Identity section:**
- Large initials avatar "A" with green status dot (active)
- Status badge: "Active" in green
- Progress bar: 48% toward goal — with percentage label

**Stats row (3 columns):**
- "Total Pts" — "25" bold
- "Best Week" — "4 pts" bold
- "Streak" — "18 days"

**Trend chart:**
- Line chart showing their weight trend over time
- Relative movement only (no Y-axis weight numbers if privacy restricted)
- If transparency enabled: actual trend values shown
- Accent-colored trend line, same style as SCR-TREND

**Weekly score history:**
- Scrollable list of score cards, most recent first:
  - "Week 6" — 2nd place, +3 pts, "−1.5 lb"
  - "Week 5" — 1st place, +4 pts, "−2.0 lb"
  - "Week 4" — 3rd place, +2 pts, "−0.9 lb"
  - etc.
- Each card shows placement badge + points + weekly loss

**Bottom nav:** Same as dashboard

---

### VARIANT 2 — "SCR-PARTICIPANT / Maintenance Mode"

Viewing a participant who has reached their goal.

**Same layout, except:**
- Status badge: "Maintenance" in blue
- Progress bar: 100%+ — filled with blue/maintenance color
- Stats show maintenance-specific info
- Trend chart shows weight holding steady near target
- Recent score cards show maintenance points (1 pt per week)
- Maintenance note: "Maintaining within ±2 lb of target"

---

### VARIANT 3 — "SCR-PARTICIPANT / Early Challenge"

Viewing a participant early in the challenge (Week 2).

**Same layout, except:**
- Progress bar: 8% — small fill
- Stats: "Total Pts" = "7", "Best Week" = "4", "Streak" = "10 days"
- Trend chart: only 2 weeks of data, short line
- Score history: only 1-2 entries
- Chart area still takes full height — sparse but not empty

---

## Components Referenced
- CMP-PARTICIPANT-AVATAR — identity display
- CMP-PROGRESS-BAR — goal progress
- CMP-TREND-CHART — weight trend visualization
- CMP-SCORE-CARD — weekly score entries
- CMP-PLACEMENT-BADGE — placement indicators
- CMP-NAV-BAR — bottom navigation

## Specs
- [SCR-PARTICIPANT](../../docs/screens/SCR-PARTICIPANT.md)

## Use Cases
- [UC-15 View Participant](../../docs/use-cases/UC-15-view-participant.md)
