# SCR-SIGNUP — Design Prompt

## Form Factor
iPhone, 390x844. Desktop, 1440x900.

## Design Direction
Same energy as the login screen — brand-first, dark, confident. The signup
form is slightly heavier than login (3 fields vs 2) but should still feel
simple. One extra field shouldn't feel like a burden. Password strength
indicator adds a competitive touch — even your password should be strong.

## Variants

Create **3 variants side by side** (mobile), then **3 desktop**:

---

### VARIANT 1 — "SCR-SIGNUP / Empty Form"

Fresh signup form.

**Layout (top to bottom):**
- Same brand header as login: logo + "BIGDOGS" + tagline
- Form section:
  - Display name input — placeholder "What should we call you?"
  - Email input — placeholder "Email"
  - Password input — placeholder "Password"
  - Password strength bar below the input (empty state — gray bar)
- "Sign Up" button — full width, accent color, 48px+ height
- "Already have an account? Log in" — muted text with link

**Styling:**
- Same dark background, input styling, and button treatment as login
- No nav bar (pre-auth screen)

---

### VARIANT 2 — "SCR-SIGNUP / Filled with Validation"

Form filled, showing password strength.

**Same layout, except:**
- Display name: "Jeff"
- Email: "jeff@example.com"
- Password: "••••••••••"
- Password strength bar: green, "Strong" label
  - Strength levels: Weak (red) → Fair (amber) → Strong (green)
- Sign Up button: active, full opacity

---

### VARIANT 3 — "SCR-SIGNUP / Error State"

Form submitted with an error.

**Same layout, except:**
- Email field: "jeff@example.com"
- Error message below email in red: "An account with this email already exists"
- "Log in instead" link in the error text or nearby
- Sign Up button in normal state (not loading)

---

## Components Referenced
- None (standalone screen, no shared nav)

## Specs
- [SCR-SIGNUP](../../docs/screens/SCR-SIGNUP.md)

## Use Cases
- [UC-1 Sign Up](../../docs/use-cases/UC-1-sign-up.md)
