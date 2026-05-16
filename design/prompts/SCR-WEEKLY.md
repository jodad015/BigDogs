# SCR-WEEKLY — Design Prompt

## Form Factor
iPhone, 390x844. Desktop, 1440x900.

## Design Direction
A scorecard breakdown for a single week. Think box score — every number
matters. The placement badges should pop (gold/silver/bronze). Performance
factors need a clear visual language: green = on pace, amber = close,
red = off pace. Week navigation should be obvious and quick.

## Variants

Create **3 variants side by side** (mobile), then **3 desktop**:

---

### VARIANT 1 — "SCR-WEEKLY / Regular Week"

Standard week results, no showdown.

**Layout (top to bottom):**

**Header:**
- Back arrow top-left
- Week navigation: "← Week 3 of 12 →" with tappable arrows
- Date range below: "May 2 – May 9" in muted text

**Score cards (ranked by placement):**

Each participant gets a card:

**1st — Jeff:**
- Gold placement badge
- "Jeff" — bold
- Weekly loss: "−1.8 lb" — green
- Performance factor: "0.90" with green dot indicator
- Weekly score: "2.43"
- Points earned: "+4 pts" — bold, gold

**2nd — Alice:**
- Silver badge
- "−1.5 lb" — green
- Factor: "0.75" — green dot
- Score: "1.89"
- "+3 pts" — silver

**3rd — Bob:**
- Bronze badge
- "−0.8 lb" — amber
- Factor: "0.53" — amber dot
- Score: "1.12"
- "+2 pts" — bronze

**4th — Carol:**
- Gray badge
- "+0.3 lb" — red (gained weight)
- Factor: "0.00" — red dot
- Score: "0.00"
- "+1 pt" — gray

**Bottom nav:** Same as dashboard

---

### VARIANT 2 — "SCR-WEEKLY / Showdown Week"

Showdown week with doubled points.

**Same layout, except:**
- Showdown banner below week header: "SHOWDOWN WEEK — 2x Points"
  — purple/gold, bold, energetic
- Points doubled: +8, +6, +4, +2
- Point values have a special glow or accent treatment

---

### VARIANT 3 — "SCR-WEEKLY / Week with Maintenance"

One participant is in maintenance mode.

**Same layout as Variant 1, except:**
- 3rd participant shows maintenance state:
  - Blue "Maintenance" badge instead of placement
  - "Within ±2 lb of target" — blue text
  - Points: "+1 pt" (maintenance point)
  - No performance factor displayed
- Other 3 participants ranked normally among themselves

---

## Components Referenced
- CMP-SCORE-CARD — participant score breakdown
- CMP-PLACEMENT-BADGE — placement indicators
- CMP-WEEK-SELECTOR — week navigation
- CMP-SHOWDOWN-BANNER — showdown indicator
- CMP-NAV-BAR — bottom navigation

## Specs
- [SCR-WEEKLY](../../docs/screens/SCR-WEEKLY.md)

## Use Cases
- [UC-10 View Weekly Results](../../docs/use-cases/UC-10-view-weekly-results.md)
