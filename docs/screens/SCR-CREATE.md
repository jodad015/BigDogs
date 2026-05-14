# SCR-CREATE — Create Challenge

## Description
Form to create a new challenge. Sets name, duration, start date, and options.
Generates invite code on creation.

## Route
`/challenge/create` (protected)

## Elements
- Challenge name input
- Duration picker (10 / 12 / 14 / 16 weeks)
- Start date picker
  - Shows computed spin-up start: "Spin-up week begins [start - 7 days]"
  - Helper text: "Everyone weighs in for 7 days before scoring begins"
- Timezone picker (default: creator's local timezone)
  - Helper text: "Determines what 'today' means for everyone in the challenge"
- Showdown weeks toggle (default: on)
  - Helper text: "Last Friday of each month + final week = double points"
- Public challenge toggle (default: off)
  - Helper text: "Lets anyone view the leaderboard and charts (no weight numbers)"
- Create button
- Result: invite code display + copy button + share link

## Navigation
- Success → show invite code (stay on screen or redirect to challenge lobby)
- Back → SCR-DASHBOARD

## Use Cases
- [UC-4 Create Challenge](../use-cases/UC-4-create-challenge.md)
