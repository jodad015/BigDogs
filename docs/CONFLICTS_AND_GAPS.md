# Conflicts and Gaps

Decisions, ambiguities, and conflicts identified during planning. Each item is
tracked through resolution.

---

## From Ruleset — Open Decisions

### GAP-1: Challenge Duration

**Status:** ✅ Resolved

**Resolution:** Duration is selected by the creator when creating a challenge.
Options: 10, 12, 14, or 16 weeks.

---

### GAP-2: Challenge Start Date

**Status:** ✅ Resolved

**Resolution:** Start date is chosen by the creator when creating the
challenge. A 1-week "pre-challenge" spin-up period is required before scoring
begins. The creation flow must clearly communicate this — e.g., "Challenge
starts [date], with a spin-up week beginning [date - 7 days]."

---

### GAP-3: Final Week — Normal or Showdown?

**Status:** ✅ Resolved

**Resolution:** Two decisions here:

1. **Final week is always a Showdown** — regardless of calendar position,
   the last week of the challenge gets doubled points for a climactic finish.

2. **Showdowns are optional per challenge** — the creator can toggle whether
   showdown weeks (including the final-week showdown) are enabled when
   creating the challenge. If disabled, all weeks use standard 4/3/2/1 points.

This means the Challenge entity needs a `showdowns_enabled` field.

---

### GAP-4: Individual Participant Goals

**Status:** ✅ Resolved

**Resolution:** Each participant sets their own goal during onboarding using
any of the five methods, with safety rails applied. Other participants in the
challenge **can see each other's goals** (target weight, total loss, weekly
target). This transparency supports accountability and makes the competition
more engaging.

---

## Identified During Planning

### GAP-5: Weigh-In Timezone Handling

**Status:** ✅ Resolved

**Resolution:** Challenge creator picks a timezone at creation (e.g.,
`America/Chicago`). This is the challenge's canonical timezone — it defines
what "today" and "Friday" mean for all participants.

- **Database:** All timestamps stored in UTC
- **Client:** Translates to challenge timezone for display, date boundaries,
  and determining which calendar date a weigh-in belongs to
- **Weekly boundaries:** Friday-to-Friday in the challenge timezone
- **Solo mode:** Uses the user's local timezone (no challenge context)

---

### GAP-6: Weigh-In Edit / Correction

**Status:** ✅ Resolved

**Resolution:** Editing weigh-ins is allowed at any time. This is an honor
system — participants are trusted. No same-day restriction, no audit trail
needed for v1. Just allow updating a weigh-in for any date (trend weight
recomputed on edit).

---

### GAP-7: Who Creates the Challenge?

**Status:** ✅ Resolved

**Resolution:** Any user can create a challenge. No admin role — the creator
sets it up (name, duration, start date, showdown toggle, public toggle) and
shares the invite code. All participants are equal once the challenge begins.

---

### GAP-8: Invite / Join Flow

**Status:** ✅ Resolved

**Resolution:** Invite code + shareable link. Creator gets a code (e.g.,
`BIGDOGS-A3F9`) that can be entered manually or opened via link
(`/join/{invite_code}`).

---

### GAP-9: Missed Weigh-In Notifications

**Status:** ✅ Resolved

**Resolution:** No push notifications for v1. Instead, show an in-app warning
if you've missed a weigh-in (e.g., a banner on the dashboard: "You haven't
weighed in today"). The social accountability view (who has/hasn't weighed in)
also helps.

---

### GAP-10: Weight Privacy & Public Challenges

**Status:** ✅ Resolved

**Resolution:** Two layers of visibility:

1. **Within a challenge:** Participants can see each other's data (weights,
   trends, goals, scores). This is opt-in by joining the challenge.

2. **Public toggle:** The challenge creator can enable a **public view** for
   the challenge. When enabled, anyone with the public link can see:
   - Leaderboard (placement points, rankings)
   - Charts (trend shapes, progress bars)
   - **No actual weight numbers** — just relative progress and scores

   This lets participants share their competition without exposing personal
   weight data to the public.

This means the Challenge entity needs an `is_public` field and there needs to
be a public-facing read-only view.

---

### GAP-11: Overall Tie-Breaking

**Status:** ✅ Resolved

**Resolution:** Ties result in co-winners — both get the higher placement.
Consistent with the weekly tie rule (ties take the higher value). No
additional tie-breaking mechanism.

---

### GAP-12: Solo Tracking Scope

**Status:** ✅ Resolved

**Resolution:** Solo mode is intentionally simple:
- Daily weigh-in entry
- Trend weight chart (graphs)
- Numbers you've posted (weight history)
- No scoring, no safety rails, no complex goal methods
- Optional personal target weight shown as reference line on chart

The full goal-setting flow with safety rails is challenge-only.
