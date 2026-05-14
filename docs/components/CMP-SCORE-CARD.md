# CMP-SCORE-CARD — Weekly Score Card

## Description
Displays a participant's score breakdown for a single week.

## Props
| Prop     | Type         | Description                    |
|----------|-------------|--------------------------------|
| result   | WeeklyResult | Full weekly result data        |
| showName | boolean      | Whether to show participant name |

## Display
- Placement badge (1st/2nd/3rd/4th)
- Display name (if showName)
- Weekly loss (e.g., "−1.3 lb")
- Performance factor with color indicator
- Weekly score
- Points earned
- Maintenance badge if applicable

## Used On
SCR-DASHBOARD, SCR-WEEKLY, SCR-PARTICIPANT
