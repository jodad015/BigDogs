# SCR-LOGIN — Design Prompt

## Form Factor
iPhone, 390x844. Dark background.

## Design Direction
Bold and minimal. The login screen is the first impression — it should feel
confident, not corporate. Dark background with the brand mark front and center.
One clear action.

## Variants

Create **3 variants side by side**:

---

### VARIANT 1 — "SCR-LOGIN / Google (Production)"

This is the production login — Google OAuth only.

**Layout (top to bottom):**
- Brand navy background (#1a1a2e) filling full screen
- Logo centered — dog with barbell, rendered in white/cream, sized prominently
  (roughly 120px wide)
- App name "BIGDOGS" below logo, large bold uppercase tracking, white text
- Tagline below: "Prove it on the scale." in muted text, smaller
- Generous vertical space
- "Sign in with Google" button — full width, white background with dark text,
  Google "G" logo on left, rounded corners, centered in thumb zone
- Bottom padding for safe area

**Styling:**
- Background: brand navy (#1a1a2e)
- Logo: white/cream version of the dog+barbell mark
- App name: white, bold/black weight, large (28-32pt equivalent)
- Tagline: muted gray (#888), regular weight
- Google button: white bg, dark text, subtle shadow, 48px height minimum
- No other elements — clean and focused

---

### VARIANT 2 — "SCR-LOGIN / Email (Local Dev)"

This is the local development login — email/password form with demo accounts.

**Layout (top to bottom):**
- Same brand navy background
- Same logo + "BIGDOGS" header and tagline
- Email input field — dark input bg with lighter border, white text, placeholder
  in muted color
- Password input field — same styling
- "Sign In" button — full width, primary accent color (crimson/red-orange),
  white bold text, 48px height
- Divider line with "Demo Accounts" label centered
- Two side-by-side buttons below: "Alice" and "Bob" — outlined style,
  muted border, white text. These click-to-fill the form fields.

**Styling:**
- Input fields: dark bg (#1a1a2e), border (#333), white text, rounded
- Sign In button: accent color bg, white text, slightly rounded
- Demo buttons: transparent bg, subtle border, muted text, equal width

---

### VARIANT 3 — "SCR-LOGIN / Error State"

Same as Variant 2 but showing an error after failed sign-in.

- Email and password fields populated
- Error message below the Sign In button: "Invalid login credentials"
  in red/destructive color
- Sign In button in normal (not loading) state

---

## Components Referenced
- None (standalone screen, no shared nav)

## Specs
- [SCR-LOGIN](../../docs/screens/SCR-LOGIN.md)

## Use Cases
- [UC-2 Log In](../../docs/use-cases/UC-2-log-in.md)
