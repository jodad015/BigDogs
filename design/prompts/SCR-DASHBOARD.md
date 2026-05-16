# SCR-DASHBOARD — Design Prompt

## Form Factor
iPhone, 390x844.

## Design Direction
The home base. This is where users land after login. It needs to answer two
questions immediately: "Have I weighed in today?" and "How am I doing?"

Solo mode for now — challenge mode variants come in Phase 2. The design should
leave room for a standings section to slot in later without a full redesign.

Dark header area (brand navy) transitioning to lighter content area. Bold
numbers. The dashboard should feel like checking your stats, not reading a
health report.

## Variants

Create **3 variants side by side**:

---

### VARIANT 1 — "SCR-DASHBOARD / Solo — Weighed In"

User has logged today's weight. Showing current stats.

**Layout (top to bottom):**

**Header section (brand navy background):**
- Small logo (dog+barbell) top-left, "BIGDOGS" text next to it, white
- Today's date top-right, muted text

**Weigh-in status card (overlapping header/content boundary):**
- Card with slight elevation/shadow
- Left side: "Today" label, large bold weight number "183.2 lb"
- Right side: green checkmark badge — "Logged"
- Subtle accent border on left edge (green = done)

**Stats row (below card, 3 columns):**
- "Trend" — current trend weight, bold number
- "This Week" — weekly change with arrow (e.g., "↓ 1.3 lb" in green)
- "Streak" — consecutive days logged (e.g., "12 days")

**Mini trend chart:**
- Small line chart, last 14 days
- Daily weight dots, trend line overlaid
- If user has a personal target, show it as a dashed horizontal line
- No axis labels in this compact view — just the visual shape
- Chart background slightly darker than content bg

**CTA section (bottom area, above nav):**
- "Create a Challenge" button — full width, accent color, bold
- "Join a Challenge" text link below — muted, underlined

**Bottom nav bar:**
- Fixed at bottom, brand navy background
- 4 tabs: Home (active, accent color), Weigh In (scale icon), Board
  (trophy icon, muted/disabled if no challenge), Profile (user icon)
- Active tab has accent color icon + label, others are muted gray

---

### VARIANT 2 — "SCR-DASHBOARD / Solo — Not Weighed In"

User hasn't logged today yet. Prompting action.

**Same layout as Variant 1, except:**

**Weigh-in status card:**
- Left side: "Today" label, "—" or "No weigh-in" in muted text
- Right side: amber/orange warning icon
- Accent border on left edge is amber/orange
- The card should feel like it's asking for attention without being annoying

**Stats row:**
- Same 3 stats but reflecting yesterday's data
- "This Week" may show "—" if not enough data

**CTA area:**
- Primary CTA changes to "Log Today's Weight" — accent color, prominent
- Challenge CTAs move below as secondary

---

### VARIANT 3 — "SCR-DASHBOARD / Solo — Empty (New User)"

Brand new user, no weigh-ins at all.

**Header section:** Same branding

**Empty state (center of content area):**
- Scale icon or illustration, muted
- "Start tracking your weight"
- "Log your first weigh-in to see your trends and stats"
- "Log Your Weight" button — accent color, full width

**CTA section:**
- Challenge CTAs still present at bottom

**Bottom nav:** Same as other variants

---

## Components Referenced
- CMP-NAV-BAR — bottom navigation
- CMP-TREND-CHART — mini chart (compact mode)
- CMP-STAT-CARD — stats row items
- CMP-WEIGH-IN-STATUS — status card (future: shows who weighed in during challenge)
- CMP-EMPTY-STATE — empty state for new users

## Specs
- [SCR-DASHBOARD](../../docs/screens/SCR-DASHBOARD.md)

## Use Cases
- [UC-16 View Dashboard](../../docs/use-cases/UC-16-view-dashboard.md)
