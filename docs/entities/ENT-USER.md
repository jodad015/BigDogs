# ENT-USER — User

## Description

An authenticated user of the app. Users can track their weight independently
(solo mode) or join challenges. A user does not need to be in a challenge to
use the app.

## Fields

| Field                 | Type         | Nullable | Description                                  |
|-----------------------|-------------|----------|----------------------------------------------|
| id                    | uuid (PK)    | No       | From Supabase Auth                           |
| email                 | text         | No       | Login email                                  |
| display_name          | text         | No       | Shown to other participants                  |
| height_inches         | integer      | Yes      | Height in inches (set during onboarding)     |
| age                   | integer      | Yes      | Optional, context only                       |
| personal_target_weight| decimal      | Yes      | Optional solo goal (lb)                      |
| created_at            | timestamptz  | No       | Account creation timestamp                   |

## Notes

- `height_inches` and `age` are set once during first use or challenge
  onboarding. They persist across challenges.
- `personal_target_weight` is an optional solo tracking goal. It has no effect
  on challenge scoring — challenge goals live on the Participant entity.
- Profile is auto-created via database trigger on auth signup (SupaArch pattern).

## RLS Policies

- Users can read and update their own profile
- Participants in the same challenge can read each other's display_name and
  height (needed for leaderboard display)

## Referenced By

- [ENT-PARTICIPANT](ENT-PARTICIPANT.md) — user_id FK
- [ENT-WEIGH-IN](ENT-WEIGH-IN.md) — user_id FK
