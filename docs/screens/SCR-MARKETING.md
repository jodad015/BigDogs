# SCR-MARKETING — Marketing Landing Page

## Description
Public marketing site at bigdogs.app. Explains the app, the challenge concept,
and drives users to sign up. This is a separate app from the web app (which
lives at app.bigdogs.app).

## Route
`/` at bigdogs.app (public, no auth)

## Sections

### Hero
- Logo (dog + barbell) prominently displayed
- "BIGDOGS" headline
- Tagline / value proposition
- Primary CTA: "Get Started" → links to app.bigdogs.app

### What is BigDogs?
- Brief explanation: competitive weight loss challenge with friends
- Emphasis on consistency over speed (the core scoring philosophy)

### How It Works
- Step-by-step: Create → Invite → Track → Compete
- Visual or icon for each step

### Features
- Daily weigh-in tracking with trend analysis
- Weekly placement scoring (Banana Ball inspired)
- Showdown weeks with doubled points
- Solo tracking without a challenge
- Public challenge view for spectators

### Social Proof / Tone
- This isn't a diet app — it's a competition
- Competitive framing: "Prove it on the scale"

### Footer CTA
- Repeat primary CTA
- Link to app.bigdogs.app

## Design Notes
- Dark mode only — follows the brand, no light mode toggle
- Single page, scrolling sections
- Mobile-first responsive
- Fast-loading, minimal JS (static or near-static)

## Architecture Notes
- Separate app: `apps/marketing/` in the monorepo
- Separate Cloudflare Pages project (e.g., `bigdogs-marketing`)
- bigdogs.app points to marketing, app.bigdogs.app points to web app
