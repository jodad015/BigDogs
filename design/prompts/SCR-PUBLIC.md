# SCR-PUBLIC — Design Prompt

## Form Factor
iPhone, 390x844. Desktop, 1440x900.

## Design Direction
A spectator view — like watching a game from the stands. You can see
who's winning, the momentum, the drama, but you can't see the private
stats. No actual weight numbers anywhere. Progress bars and chart shapes
tell the story. Should feel exciting enough that visitors want to join.

This is a standalone page — no app nav bar, no auth required. Has its
own header/footer treatment. Dark mode only (matches marketing site).

## Variants

Create **3 variants side by side** (mobile), then **3 desktop**:

---

### VARIANT 1 — "SCR-PUBLIC / Active Challenge"

Challenge in progress, viewable by anyone.

**Layout (top to bottom):**

**Header:**
- BigDogs logo + wordmark, centered
- Challenge name: "Office BigDogs Q3" — bold, white
- Status pill: "In Progress — Week 6 of 12" — green

**Leaderboard section:**
- 4 participant rows ranked by points:
  - Rank badge (gold/silver/bronze/gray)
  - Display name
  - Total points — bold
  - Progress bar (percentage only, no lb values)
- Clean card-style rows

**Trend shapes section:**
- "Progress Over Time" header
- Overlaid chart lines for all 4 participants — different colors
- No Y-axis labels (no weight numbers)
- X-axis: week numbers only
- Legend: colored dots + names

**Week-by-week placements:**
- Compact grid or table showing each week's placements
- Showdown weeks highlighted with special indicator
- Color-coded by placement (gold/silver/bronze/gray)

**Footer:**
- "Want to compete?" — white text
- "Join BigDogs" CTA button — accent color
- Links to app.bigdogs.app

---

### VARIANT 2 — "SCR-PUBLIC / Completed Challenge"

Challenge finished, winner announced.

**Same layout, except:**
- Status pill: "Complete" — muted
- Winner banner at top: trophy icon + "Jeff wins!" — gold treatment,
  celebratory but not over-the-top
- Final standings with all progress bars at their final percentages
- Trend chart shows full duration
- No "In Progress" indicators

---

### VARIANT 3 — "SCR-PUBLIC / Not Started"

Challenge exists but hasn't begun yet.

**Layout:**
- Same header with challenge name
- Status pill: "Starting June 2" — amber
- Simple state:
  - "This challenge hasn't started yet"
  - Participant count: "3 of 4 joined"
  - "Check back after the spin-up week"
- Footer with "Join BigDogs" CTA still present

---

## Components Referenced
- CMP-STANDING-ROW — leaderboard rows (points-only variant)
- CMP-PROGRESS-BAR — goal progress (percentage only)
- CMP-PLACEMENT-BADGE — rank badges
- CMP-SHOWDOWN-BANNER — showdown indicators

## Specs
- [SCR-PUBLIC](../../docs/screens/SCR-PUBLIC.md)

## Use Cases
- [UC-17 View Public Challenge](../../docs/use-cases/UC-17-view-public-challenge.md)
