# SCR-SIGNUP — Sign Up

## Description
Account creation form.

## Route
`/signup` (public only — redirects to dashboard if authenticated)

## Elements
- Email input
- Password input (with strength indicator)
- Display name input
- Sign Up button
- "Already have an account? Log in" link

## Validation
- Email: valid format (Zod)
- Password: minimum length per Supabase config
- Display name: non-empty

## Navigation
- Success → SCR-DASHBOARD
- Log In link → SCR-LOGIN

## Components Used
None (standard form inputs)

## Use Cases
- [UC-1 Sign Up](../use-cases/UC-1-sign-up.md)
