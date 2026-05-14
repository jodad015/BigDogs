# SCR-SPINUP — Spin-Up Week

## Description
View during the 7-day baseline period before the challenge begins.
Shows progress toward establishing the starting weight average.

## Route
`/challenge/:id/spinup` (protected, participants only)

## Elements
- Day counter: "Day X of 7"
- Today's weigh-in entry (or status if done)
- Running 7-day average (updates as days are added)
- List of daily entries so far
- Other participants' check-in status (who's weighed in today)
- Countdown to challenge start

## Components Used
- [CMP-WEIGHT-INPUT](../components/CMP-WEIGHT-INPUT.md)
- [CMP-WEIGH-IN-STATUS](../components/CMP-WEIGH-IN-STATUS.md)
- [CMP-TREND-CHART](../components/CMP-TREND-CHART.md)

## Use Cases
- [UC-7 Record Weigh-In](../use-cases/UC-7-record-weigh-in.md) (during spin-up context)
