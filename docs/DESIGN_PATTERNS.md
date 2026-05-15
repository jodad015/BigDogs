# Design Patterns

## Mobile-First Responsive

This is a mobile-friendly web app. All screens are designed mobile-first and
scale up to desktop.

### Touch Targets
- Minimum touch target: 48x48px
- Primary action buttons: full width on mobile, constrained on desktop
- Spacing between interactive elements: minimum 8px

### Thumb Zone
- Primary actions anchored to bottom of screen
- Navigation bar fixed at bottom
- Weigh-in entry designed for one-handed use
- Destructive actions placed away from thumb zone (top or behind confirmation)

### Layout
- Single column on mobile (< 640px)
- Two column on tablet (640–1024px) where appropriate
- Constrained max-width on desktop (1024px)

---

## Navigation

Bottom tab bar with 3–4 primary destinations:

| Tab         | Screen          | Icon     |
|-------------|-----------------|----------|
| Dashboard   | SCR-DASHBOARD   | Home     |
| Weigh In    | SCR-WEIGH-IN    | Scale    |
| Leaderboard | SCR-LEADERBOARD | Trophy   |
| Profile     | SCR-PROFILE     | User     |

Secondary screens accessed via navigation within tabs (push onto stack).

---

## Data Entry Patterns

### Weigh-In Entry
- Large numeric input (easy to read and tap)
- Decimal keyboard on mobile (inputmode="decimal")
- Pre-filled with yesterday's weight as placeholder (not value)
- Confirm button at bottom of screen
- Success feedback: brief toast + trend weight update

### Goal Setting (Onboarding)
- Multi-step flow (not a single long form)
- Step 1: Height
- Step 2: Starting weight (auto-filled from spin-up average)
- Step 3: Goal method picker → goal input
- Step 4: Review computed values (target weight, total loss, weekly target)
- Safety rail warnings appear inline during Step 3/4, not as separate screens
- Confirm button finalizes goal

---

## Feedback Patterns

### Safety Rails
- **Pace ceiling:** Warning card with amber styling, shows 3 options inline
- **Healthy floor:** Error card with red styling, blocks progression
- **Already-healthy nudge:** Info card with blue styling, dismissable

### Score Updates
- Weekly results appear as a summary card on Friday
- Showdown weeks get a distinct banner/header treatment
- Placement badges use color coding (gold/silver/bronze/gray)

---

## Destructive Actions

Minimal destructive actions in this app. Primary ones:

| Action            | Pattern                               |
|-------------------|---------------------------------------|
| Log Out           | Confirmation dialog (DLG-LOGOUT)      |
| Edit Weigh-In     | Same-day only, inline replacement     |

---

## Theming

### Dark/Light Mode

- **Dark mode is the default** — matches the brand navy foundation
- Light mode available via toggle in Profile settings
- User preference stored in `localStorage` and on the profile
- If no preference set, defaults to dark

### Implementation (Tailwind v4)

- CSS custom properties define all colors in `index.css`
- Two token sets: `@theme` for dark (default), `.light` class override
- The `<html>` element gets a `light` class when toggled
- All component colors reference semantic tokens, never raw values

### Color Tokens (Both Modes)

| Token              | Dark Mode           | Light Mode          | Usage                |
|--------------------|---------------------|---------------------|----------------------|
| `--background`     | navy (#0f0f1a)      | cream (#f5f0eb)     | Page background      |
| `--foreground`     | white (#f5f5f5)     | navy (#1a1a2e)      | Primary text         |
| `--card`           | dark navy (#1a1a2e) | white (#ffffff)     | Card backgrounds     |
| `--card-foreground`| white (#f5f5f5)     | navy (#1a1a2e)      | Card text            |
| `--primary`        | crimson (#e94560)   | crimson (#e94560)   | CTAs, brand accent   |
| `--muted`          | gray (#2a2a3e)      | light gray (#e5e5e5)| Muted backgrounds    |
| `--muted-foreground`| gray (#888)        | gray (#666)         | Secondary text       |
| `--border`         | dark (#2a2a3e)      | light (#e0e0e0)     | Borders              |
| `--input`          | dark (#1a1a2e)      | white (#ffffff)     | Input backgrounds    |

### Scoring Colors (Same in Both Modes)

These don't change between modes — they need consistent meaning:

| Token                | Value     | Usage                      |
|----------------------|-----------|----------------------------|
| `--on-pace`          | #16a34a   | On target (green)          |
| `--slightly-under`   | #f59e0b   | Close to target (amber)    |
| `--significantly-under`| #f97316 | Behind target (orange)     |
| `--over-pace`        | #dc2626   | Over target / penalty (red)|
| `--maintenance`      | #3b82f6   | Maintenance mode (blue)    |
| `--showdown`         | #7c3aed   | Showdown week (purple)     |
| `--gold`             | #fbbf24   | 1st place                  |
| `--silver`           | #9ca3af   | 2nd place                  |
| `--bronze`           | #d97706   | 3rd place                  |

---

## Real-Time Considerations

- Weigh-in status for all participants should update in near-real-time on the
  dashboard (who has weighed in today)
- Weekly results computed server-side, pushed via Supabase Realtime
  (postgres_changes on weekly_results table)
- Leaderboard updates when weekly results are computed
