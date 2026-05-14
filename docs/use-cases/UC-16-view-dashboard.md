# UC-16 — View Dashboard

## Actor
Authenticated user

## Description
The main screen after login. Adapts based on whether the user is in a
challenge or tracking solo.

## Dashboard Modes

### Solo Mode (no active challenge)
- Today's weigh-in status (done / not yet)
- Current trend weight
- Weekly change
- Mini trend chart (last 14 days)
- Progress toward personal target (if set)
- CTA: "Join a Challenge" or "Create a Challenge"

### Challenge Mode (active challenge)
- Today's weigh-in status (done / not yet)
- Current trend weight + weekly change
- This week's progress toward weekly target
- Current standings snapshot (all 4 participants, ranked)
- Who has weighed in today (social accountability)
- Showdown banner if this is a showdown week
- Next showdown date if not

### Spin-Up Mode (during spin-up week)
- Day X of 7
- Today's weigh-in status
- Running average so far
- Other participants' spin-up progress (who's weighed in)

## References
- Screen: [SCR-DASHBOARD](../screens/SCR-DASHBOARD.md)
- Components: [CMP-TREND-CHART](../components/CMP-TREND-CHART.md), [CMP-STANDING-ROW](../components/CMP-STANDING-ROW.md), [CMP-SHOWDOWN-BANNER](../components/CMP-SHOWDOWN-BANNER.md), [CMP-WEIGH-IN-STATUS](../components/CMP-WEIGH-IN-STATUS.md), [CMP-STAT-CARD](../components/CMP-STAT-CARD.md)
