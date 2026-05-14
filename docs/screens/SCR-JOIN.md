# SCR-JOIN — Join Challenge

## Description
Enter an invite code to join an existing challenge. Also accessible via
direct link (`/join/{invite_code}`).

## Route
`/join` or `/join/:inviteCode` (protected)

## Elements
- Invite code input (if not in URL)
- Challenge preview (name, creator, participants joined, duration)
- Join button
- Error states: invalid code, full, already started

## Navigation
- Success → SCR-ONBOARDING
- Back → SCR-DASHBOARD

## Use Cases
- [UC-5 Join Challenge](../use-cases/UC-5-join-challenge.md)
