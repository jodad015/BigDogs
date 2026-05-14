# SCR-WEIGH-IN — Record Weigh-In

## Description
Daily weight entry screen. Designed for quick, one-handed use.

## Route
`/weigh-in` (protected) — also accessible as bottom-sheet or modal from dashboard

## Elements
- Large numeric display of current input
- Decimal keypad or native decimal keyboard (inputmode="decimal")
- Yesterday's weight shown as reference (not pre-filled)
- Submit button (anchored to bottom / thumb zone)
- Success state: brief confirmation + today's trend weight

## Behavior
- If already weighed in today: shows current value with option to edit
- Submit → computes trend weight server-side → returns updated trend
- Quick interaction: enter number → tap submit → done

## Components Used
- [CMP-WEIGHT-INPUT](../components/CMP-WEIGHT-INPUT.md)

## Use Cases
- [UC-7 Record Weigh-In](../use-cases/UC-7-record-weigh-in.md)
