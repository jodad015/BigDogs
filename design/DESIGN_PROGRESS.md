# Design Progress

## Brand Direction

**Personality:** Bold, competitive, high-energy. The name "BigDogs" implies
dominance — you're here to prove something. The design should feel like a
scoreboard, not a wellness journal.

**Visual Principles:**
- **High contrast** — dark backgrounds, bright accent pops
- **Strong typography** — heavy weights for numbers and rankings
- **Competitive framing** — placements, streaks, progress feel like stats
- **Dense information** — show the data, don't hide behind minimalism
- **Mobile-first** — thumb-friendly, single-column, bottom-anchored actions

**Logo:**
Dog (Lab) holding a barbell in its mouth. Single-color stencil style.
Deep navy on light/cream background, or inverted white on dark background.

**Color Direction:**
- **Brand navy** (#1a1a2e) — the logo color, dark foundation for headers,
  nav, card backgrounds. The app should feel like the logo's world.
- **Cream/off-white** (#f5f0eb) — light background matching the logo's bg
- **Hot accent** (crimson/red-orange) — primary actions, CTAs, brand punch
  against the navy
- Scoring: green (on-pace), amber (slightly under), red (over/under)
- Placement: gold, silver, bronze
- Showdown: electric purple or gold highlight

**Typography Direction:**
- Bold/black weight for numbers, scores, weights
- Clean sans-serif for body text
- Monospace or tabular figures for data alignment

**Dark/Light Mode:**
- Dark mode is the default (matches brand navy)
- Light mode toggle in Profile settings, stored in localStorage + profile
- Marketing site is dark-only
- See DESIGN_PATTERNS.md for full token table

**Architecture:**
- Marketing site at `bigdogs.app` — `apps/marketing/` in monorepo
- Web app at `app.bigdogs.app` — `apps/web/` in monorepo
- Separate Cloudflare Pages projects for each

---

## Design Phases

### Phase 1: Core Solo Tracking
| Screen          | Prompt | Designed | Notes |
|-----------------|:------:|:--------:|-------|
| SCR-LOGIN       | ✅     | ✅       | 3 mobile + 3 desktop variants |
| SCR-DASHBOARD   | ✅     | ✅       | 3 mobile + 3 desktop variants |
| SCR-WEIGH-IN    | ✅     | ✅       | 3 mobile + 3 desktop variants |
| SCR-TREND       | ✅     | ✅       | 3 mobile + 3 desktop variants |

### Phase 2: Challenge Flow
| Screen          | Prompt | Designed | Notes |
|-----------------|:------:|:--------:|-------|
| SCR-CREATE      | ✅     | ✅       | 3 mobile + 3 desktop, baseline week model |
| SCR-JOIN        | ✅     | ✅       | 3 mobile + 3 desktop, no participant cap |
| SCR-ONBOARDING  | ✅     | ✅       | 4 mobile + 4 desktop (4-step wizard) |
| SCR-LEADERBOARD | ✅     | ✅       | 3 mobile + 3 desktop, gold/silver/bronze |
| SCR-WEEKLY      | ✅     | ⬜       | Regular + showdown + maintenance |
| SCR-SPINUP      | ✅     | ⬜       | Baseline week (renamed from spin-up) |

### Phase 3: Supporting Screens
| Screen          | Prompt | Designed | Notes |
|-----------------|:------:|:--------:|-------|
| SCR-PROFILE     | ✅     | ✅       | 3 mobile + 3 desktop, includes light mode |
| SCR-PARTICIPANT | ✅     | ✅       | 3 mobile + 3 desktop, active/maint/early |
| SCR-PUBLIC      | ✅     | ✅       | 3 mobile + 3 desktop, standalone page |
| SCR-SIGNUP      | ✅     | ⬜       | Form + validation + error |

### Marketing Site
| Screen          | Prompt | Designed | Notes |
|-----------------|:------:|:--------:|-------|
| SCR-MARKETING   | ✅     | ⬜       | Dark-only, mobile + desktop variants |
