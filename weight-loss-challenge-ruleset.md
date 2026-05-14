# Weight Loss Challenge — Ruleset

A 4-person weight loss challenge using weekly placement scoring (inspired by
Banana Ball inning scoring). The whole system is designed to reward
**committing to a pace and hitting it consistently** — not racing to a soft
goal and coasting. The penalty for outpacing your committed target is steeper
than the penalty for falling short.

---

## Onboarding (Per Participant)

Each participant provides:

- **Height** (used for BMI calculations and safety floors)
- **Starting weight** (the 7-day average from the spin-up week)
- **Age** (optional, for context only)
- **Goal-setting method** — one of five ways to express their goal

### Goal-setting methods

| Method             | What you provide                       | What gets computed                    |
|--------------------|----------------------------------------|---------------------------------------|
| Target weight      | The weight you want to hit             | Total loss = current − target         |
| % loss             | The % of body weight to lose (5-10% typical) | Total loss = % × current weight |
| Target BMI         | The BMI you want to reach              | Target weight, then total loss        |
| Weekly pace        | Your committed lb/wk                   | Total loss = pace × weeks             |
| Suggested default  | (nothing — accept the default)         | 1.5 lb/wk × weeks                     |

Any method produces the same three numbers: **target weight, total loss,
weekly target**. The weekly target is fixed for the whole challenge — that's
the committed pace.

---

## Safety Rails

Three automatic checks at goal-setting time:

**1. Pace ceiling.** If the derived weekly target exceeds 2.0 lb/wk, the
system pushes back:

> That requires X lb/week — above the 2 lb/wk sustainable max. Options:
> - Lower the goal to ___ lb (keeps you at the safe ceiling)
> - Extend the challenge to ___ weeks (keeps the goal at a safe pace)
> - Keep it as a stretch goal — the band penalty will hit hard and you'll
>   likely score poorly

**2. Healthy floor.** If the target weight is below BMI 18.5 + 2 lb buffer,
the system refuses the goal and asks for a target ≥ the minimum safe weight.

**3. Already-healthy nudge.** If current BMI is below 22, soft note:

> You're already at a healthy weight. Make sure your goal is what you actually
> want — consider a smaller, fitness-focused target.

---

## Spin-up Week

Everyone weighs in daily for 7 days with no scoring. Each person's 7-day
average on day 7 becomes their official starting weight. The challenge begins
on day 8.

---

## Daily Protocol

- **Weigh in each morning**, post-bathroom, pre-food, pre-water, in similar
  clothing (or none).
- Your **trend weight** on any given day is the average of your last 7 daily
  readings.
- **Missed days:** Trend updates normally as long as at least **5 of the last
  7** days have a reading. If you fall below 5/7, your trend freezes at its
  last valid value until you catch back up.

---

## Weekly Target

Your weekly target is fixed for the whole challenge:

> **Weekly target = total loss ÷ challenge weeks**

This is what you committed to during onboarding. Hitting it = perfect weekly
score. Falling short = proportional reduction. Going over = steeper penalty
(see the performance factor below).

The 2.0 lb/wk health ceiling still applies as a hard maximum, but the safety
rails at onboarding should prevent any target from exceeding it in the first
place.

---

## Weekly Score

Each week (Friday → Friday), compute the following for each player:

**1. Weekly loss** = (last Friday's trend) − (this Friday's trend)

**2. Performance ratio** = weekly loss ÷ weekly target

**3. Performance factor:**

- If ratio ≤ 1.0 (at or under target): `factor = ratio`
- If ratio > 1.0 (over target): `factor = max(0, 1 − 2 × (ratio − 1))`

Linear scaling under target, twice as steep over it. Coming up 10% short =
0.9 factor; going 25% over = 0.5 factor; going 50%+ over = 0. This asymmetry
is what enforces the "stay on pace" philosophy.

**4. Difficulty multiplier:**

- Cumulative scored loss = running sum of `(weekly target × performance factor)` from prior weeks
- Cumulative progress (%) = cumulative scored loss ÷ total goal × 100
- `multiplier = 1 + (progress / 100)`, capping at 2.0 at 100% of goal

Pounds late in the challenge count more, since they're harder to lose.

**5. Weekly score** = `weekly target × performance factor × difficulty multiplier`

### Performance factor reference (using weekly target = 1.5 lb/wk)

| Weekly Loss        | Ratio | Factor |
|--------------------|------:|-------:|
| 0.00 lb (hold)     | 0.00  | 0.00   |
| 0.75 lb            | 0.50  | 0.50   |
| 1.35 lb            | 0.90  | 0.90   |
| 1.50 lb (perfect)  | 1.00  | 1.00   |
| 1.65 lb            | 1.10  | 0.80   |
| 1.875 lb           | 1.25  | 0.50   |
| 2.25 lb            | 1.50  | 0.00   |

---

## Weekly Placement Points

Each week, rank all 4 players by weekly score and award placement points:

| Placement | Points |
|-----------|-------:|
| 1st       | 4      |
| 2nd       | 3      |
| 3rd       | 2      |
| 4th       | 1      |

Gain/hold weeks still earn the 1-point participation placement.

### Tie rules

Ties take the **higher** placement value; the next solo placement drops by
the number of people in the tie.

| Tie Scenario        | Points        |
|---------------------|---------------|
| 2-way tie for 1st   | 4, 4, 2, 1    |
| 3-way tie for 1st   | 4, 4, 4, 1    |
| Tie for 2nd         | 4, 3, 3, 1    |
| Tie for 3rd         | 4, 3, 2, 2    |
| All tied            | 4, 4, 4, 4    |

---

## Showdown Weeks

The week ending on **the last Friday of each calendar month** is a Showdown
Week. Placement points are **doubled**:

| Placement | Showdown Points |
|-----------|----------------:|
| 1st       | 8               |
| 2nd       | 6               |
| 3rd       | 4               |
| 4th       | 2               |

Tie rules apply the same way (e.g., 2-way tie for 1st in a showdown = both
get 8, next placement drops to 4).

---

## Maintenance Mode (Hitting Your Goal Early)

If your cumulative scored loss reaches 100% of your goal before the challenge
ends, you enter Maintenance Mode for the remaining weeks:

- Each week, if your trend weight stays within **±2 lb of your goal weight**,
  you earn the **1-point participation placement** in regular weeks (or 2
  points in a showdown).
- If your trend drifts outside the band, you receive **0 points** that week.
- You continue weighing in daily through the end of the challenge.

Maintenance is a clean landing, not a victory lap. The challenge is the
journey — picking a small goal to rush through and then collect maintenance
points is a losing strategy under this scoring, since maintenance points
are smaller than what you'd earn by being on pace.

---

## Winner

**Highest total placement points across the challenge.**

---

## Participants

| Player | Height | Starting Weight | Current BMI       | Healthy Floor Wt |
|--------|:------:|----------------:|-------------------|-----------------:|
| A      | 6'0"   | 195 lb          | 26.4 (overweight) | 138 lb           |
| B      | 6'5"   | 280 lb          | 33.2 (obese I)    | 158 lb           |
| C      | 6'3"   | 250 lb          | 31.2 (obese I)    | 150 lb           |
| D      | 5'7"   | 164 lb          | 25.7 (overweight) | 120 lb           |

*Healthy floor weight = BMI 18.5 weight + 2 lb buffer. All goal target weights
must land at or above this.*

Each player's goal is to be set during onboarding using one of the five
methods above, with safety rails applied.

---

## Open Decisions Before Starting

- [ ] Challenge duration (10 / 12 / 14 / 16 weeks)
- [ ] Start date (so showdown Fridays can be marked on the calendar)
- [ ] Each participant's goal (run onboarding for each)
- [ ] Final-week edge case: if the challenge ends on a regular (non–last-Friday)
      week, is the final week a normal week or always a Showdown?
