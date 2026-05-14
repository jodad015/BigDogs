# CMP-WEIGH-IN-STATUS — Weigh-In Status

## Description
Shows who has and hasn't weighed in today. Creates social accountability
within a challenge.

## Props
| Prop         | Type     | Description                          |
|--------------|----------|--------------------------------------|
| participants | array    | [{displayName, hasWeighedIn}]        |

## Display
- List of participant names with check/pending icons
- Green check: weighed in today
- Gray circle: not yet
- Updates in near-real-time via Supabase Realtime

## Used On
SCR-DASHBOARD (challenge mode), SCR-SPINUP
