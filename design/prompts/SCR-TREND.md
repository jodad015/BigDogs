# SCR-TREND — Design Prompt

## Form Factor
iPhone, 390x844.

## Design Direction
The data screen. Users come here to see their progress over time. The chart
is the hero — it should be large, readable, and feel like a performance
tracker. Stats below give the numbers behind the visual.

Same brand navy header, cream/light content area. The chart should have
enough contrast to read easily on either background.

## Variants

Create **3 variants side by side**:

---

### VARIANT 1 — "SCR-TREND / Populated (2+ weeks)"

User has several weeks of data. Full chart and stats.

**Layout (top to bottom):**

**Header (brand navy):**
- "Your Trend" title, centered, white bold text
- Date range selector row below: "2W" | "1M" | "ALL" — pill-style toggle
  buttons, active one highlighted with accent color

**Chart (main content area, ~50% of screen height):**
- Line chart on light background
- X-axis: dates (abbreviated, e.g., "5/1", "5/7", "5/14")
- Y-axis: weight in lb (e.g., "180", "185", "190") — right-aligned labels
- **Daily weights:** small dots connected by thin line, muted color
- **Trend line:** thicker smooth line, accent color or brand navy, overlaid
- **Target weight:** horizontal dashed line if user has personal_target_weight
  set, with small label "Goal: 175 lb" at the end
- Clean gridlines, very subtle

**Stats panel (below chart, card-style):**
- 2x2 grid of stat cards:
  - "Current Trend" — bold number "183.2 lb"
  - "This Week" — delta with arrow "↓ 1.3 lb" in green
  - "Total Change" — from starting "↓ 11.8 lb" in green
  - "Days Tracked" — count "34"
- Each card: label on top (small, muted), value below (large, bold)
- Cards have subtle borders or background differentiation

**Bottom nav:** Same as dashboard

---

### VARIANT 2 — "SCR-TREND / Early (< 7 days)"

User just started, building up data. Chart has only a few points.

**Same layout, except:**

**Chart:**
- Only 3-5 data points, widely spaced
- Trend line is short/partial
- No target line shown (too early to be meaningful)
- Chart still takes the same vertical space — doesn't shrink

**Stats panel:**
- "Current Trend" shows the value or "Building..." if < 5 days
- "This Week" may show "—"
- "Total Change" shows whatever delta exists
- "Days Tracked" — "3"

**Encouragement note below stats:**
- "Keep logging daily — your trend line starts after 5 days" in muted text

---

### VARIANT 3 — "SCR-TREND / Empty (No Data)"

No weigh-ins yet.

**Header:** Same

**Empty state (centered in chart area):**
- Chart icon or line graph illustration, muted
- "No data yet"
- "Log your first weigh-in to start seeing your trend"
- "Log Weight" button — accent color

**Stats panel:** Hidden or all showing "—"

**Bottom nav:** Same

---

## Components Referenced
- CMP-TREND-CHART — the main line chart
- CMP-STAT-CARD — the stats grid items
- CMP-NAV-BAR — bottom navigation
- CMP-EMPTY-STATE — empty state placeholder

## Specs
- [SCR-TREND](../../docs/screens/SCR-TREND.md)

## Use Cases
- [UC-8 View Weight Trend](../../docs/use-cases/UC-8-view-weight-trend.md)
