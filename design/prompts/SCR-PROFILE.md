# SCR-PROFILE — Design Prompt

## Form Factor
iPhone, 390x844. Desktop, 1440x900.

## Design Direction
Settings screen, but make it feel personal — not a system menu. The user's
identity (name, avatar) should be prominent at top. Active challenge info
gives context. The dark/light toggle is a key feature. Log out lives at the
bottom, visually separated, not prominent.

## Variants

Create **3 variants side by side** (mobile), then **3 desktop**:

---

### VARIANT 1 — "SCR-PROFILE / With Active Challenge"

User is in a challenge.

**Layout (top to bottom):**

**Header (brand navy):**
- "Profile" title, centered, white

**User identity section:**
- Large initials avatar (64px circle, colored bg derived from name)
- Display name: "Jeff" — white, bold, editable (pencil icon)
- Email: "jeff@example.com" — muted, read-only

**Personal info card:**
- Height: "5'10"" — editable
  - Small lock icon + "Locked during active challenge" in amber
- Age: "34" — editable, optional
- Personal target weight: "175 lb" — editable
  - Helper: "For solo tracking — doesn't affect challenge scoring"

**Active challenge card (accent-bordered):**
- "Active Challenge" section header
- Challenge name: "Office BigDogs Q3"
- Role: "Participant"
- Invite code: "BDOG-X7K9" with copy icon
- Week: "Week 6 of 12"

**Appearance toggle:**
- "Appearance" label
- Dark / Light toggle — segmented control, Dark selected

**Danger zone (bottom, separated):**
- "Log Out" button — outlined, red/destructive color, not prominent

**Bottom nav:** Same (Profile tab active)

---

### VARIANT 2 — "SCR-PROFILE / Solo Mode (No Challenge)"

No active challenge.

**Same layout, except:**
- No challenge card section
- Height field is editable (no lock)
- More vertical space — content breathes
- Maybe a subtle CTA: "Start a Challenge" link in the challenge area

---

### VARIANT 3 — "SCR-PROFILE / Light Mode Preview"

Same as Variant 1 but showing the light mode appearance.

**Key differences:**
- Background: cream/off-white (#f5f0eb)
- Cards: white with subtle border
- Text: dark navy primary, medium gray secondary
- Nav bar: light bg with dark icons
- Appearance toggle: Light selected
- Shows how the whole app looks in light mode

---

## Components Referenced
- CMP-PARTICIPANT-AVATAR — user's avatar display
- CMP-NAV-BAR — bottom navigation

## Specs
- [SCR-PROFILE](../../docs/screens/SCR-PROFILE.md)

## Use Cases
- [UC-14 Edit Profile](../../docs/use-cases/UC-14-edit-profile.md)
- [UC-3 Log Out](../../docs/use-cases/UC-3-log-out.md)
