# SCR-LEADERBOARD — Design Prompt

## Form Factor
iPhone, 390x844. Desktop, 1440x900.

## Design Direction
This is the scoreboard. It should feel like checking standings in a league —
bold ranks, clear point totals, visual progress. The leader should feel
dominant. Use placement colors (gold, silver, bronze) for the top 3. Dense
but scannable.

## Variants

Create **3 variants side by side** (mobile), then **3 desktop**:

---

### VARIANT 1 — "SCR-LEADERBOARD / Active — Mid-Season"

Challenge in progress, Week 6 of 12.

**Layout (top to bottom):**

**Header (brand navy):**
- "Leaderboard" title, centered, white bold
- Challenge info bar below: "Office BigDogs Q3 — Week 6 of 12"
- Next showdown indicator: "Next showdown: June 27" in muted/accent text

**Standings list:**
- 4 participant rows, ranked by total points:

  **1st — Jeff (you):**
  - Gold rank badge "1st"
  - Initials avatar with green status dot (active)
  - "Jeff" — bold white, "(You)" tag
  - "28 pts" — large, bold, gold-tinted
  - Progress bar: 52% toward goal, green fill
  
  **2nd — Alice:**
  - Silver rank badge "2nd"
  - Avatar + green dot
  - "Alice"
  - "25 pts" — silver-tinted
  - Progress bar: 48%

  **3rd — Bob:**
  - Bronze rank badge "3rd"
  - Avatar + green dot
  - "Bob"
  - "21 pts" — bronze-tinted
  - Progress bar: 38%

  **4th — Carol:**
  - Gray rank badge "4th"
  - Avatar + green dot
  - "Carol"
  - "18 pts"
  - Progress bar: 30%

- Each row: card-style with dark bg, horizontal layout, clear separation

**Bottom nav:** Same as dashboard (Board tab active)

---

### VARIANT 2 — "SCR-LEADERBOARD / Showdown Week"

During a showdown week — extra visual energy.

**Same layout, except:**
- Showdown banner at top: "SHOWDOWN WEEK" with "2x Points" badge
  — electric purple/gold treatment, bold
- Point values reflect doubled scoring
- Banner should feel special, competitive, high-stakes

---

### VARIANT 3 — "SCR-LEADERBOARD / Complete (Winner)"

Challenge finished. Showing final results.

**Layout:**
- Header: "Final Standings" instead of "Leaderboard"
- Challenge info: "Office BigDogs Q3 — Complete"
- Winner celebration: trophy icon or crown above 1st place row
- 1st place row has a gold accent/border treatment
- All progress bars show final percentages
- "Share Results" button at bottom — outlined style
- No showdown indicator (challenge is over)

---

## Components Referenced
- CMP-STANDING-ROW — participant ranking rows
- CMP-PLACEMENT-BADGE — 1st/2nd/3rd/4th badges
- CMP-PROGRESS-BAR — progress toward goal
- CMP-PARTICIPANT-AVATAR — initials avatar with status
- CMP-SHOWDOWN-BANNER — showdown week indicator
- CMP-NAV-BAR — bottom navigation

## Specs
- [SCR-LEADERBOARD](../../docs/screens/SCR-LEADERBOARD.md)

## Use Cases
- [UC-11 View Leaderboard](../../docs/use-cases/UC-11-view-leaderboard.md)
