# UC-3 — Log Out

## Actor
Authenticated user

## Description
Sign out of the app. Clears session and returns to login screen.

## Journey

```mermaid
sequenceDiagram
    actor U as User
    participant P as Profile Screen
    participant D as Logout Dialog
    participant A as Supabase Auth

    U->>P: Tap "Log Out"
    P->>D: Show confirmation
    U->>D: Confirm
    D->>A: signOut()
    A-->>D: Session cleared
    D-->>U: Redirect to Login
```

## References
- Screen: [SCR-PROFILE](../screens/SCR-PROFILE.md)
- Dialog: [DLG-LOGOUT](../screens/DLG-LOGOUT.md)
