# CMP-WEEK-SELECTOR — Week Selector

## Description
Navigation control for moving between challenge weeks.

## Props
| Prop        | Type     | Description                    |
|-------------|----------|--------------------------------|
| currentWeek | number   | Currently displayed week       |
| totalWeeks  | number   | Total challenge weeks          |
| onChange    | function  | Callback when week changes     |

## Display
- ← Previous | "Week 3 of 12" | Next →
- Showdown indicator on showdown weeks
- Disabled arrows at boundaries (week 1, current/final week)

## Used On
SCR-WEEKLY
