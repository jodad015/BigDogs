# Screen Specs

## Index

### Marketing & Auth
| ID            | Screen              | Spec                                             |
|---------------|---------------------|--------------------------------------------------|
| SCR-MARKETING | Marketing Site      | [SCR-MARKETING](screens/SCR-MARKETING.md)        |
| SCR-SIGNUP    | Sign Up             | [SCR-SIGNUP](screens/SCR-SIGNUP.md)              |
| SCR-LOGIN     | Log In              | [SCR-LOGIN](screens/SCR-LOGIN.md)                |

### Challenge Setup
| ID              | Screen              | Spec                                             |
|-----------------|---------------------|--------------------------------------------------|
| SCR-CREATE      | Create Challenge    | [SCR-CREATE](screens/SCR-CREATE.md)              |
| SCR-JOIN        | Join Challenge      | [SCR-JOIN](screens/SCR-JOIN.md)                  |
| SCR-ONBOARDING  | Onboarding Flow     | [SCR-ONBOARDING](screens/SCR-ONBOARDING.md)     |

### Core App
| ID              | Screen              | Spec                                             |
|-----------------|---------------------|--------------------------------------------------|
| SCR-DASHBOARD   | Dashboard           | [SCR-DASHBOARD](screens/SCR-DASHBOARD.md)       |
| SCR-WEIGH-IN    | Record Weigh-In     | [SCR-WEIGH-IN](screens/SCR-WEIGH-IN.md)         |
| SCR-TREND       | Weight Trend        | [SCR-TREND](screens/SCR-TREND.md)               |
| SCR-WEEKLY      | Weekly Results      | [SCR-WEEKLY](screens/SCR-WEEKLY.md)              |
| SCR-LEADERBOARD | Leaderboard         | [SCR-LEADERBOARD](screens/SCR-LEADERBOARD.md)   |
| SCR-SPINUP      | Spin-Up Week        | [SCR-SPINUP](screens/SCR-SPINUP.md)             |

### Participant
| ID              | Screen              | Spec                                             |
|-----------------|---------------------|--------------------------------------------------|
| SCR-PARTICIPANT | Participant Detail  | [SCR-PARTICIPANT](screens/SCR-PARTICIPANT.md)    |
| SCR-PROFILE     | Profile / Settings  | [SCR-PROFILE](screens/SCR-PROFILE.md)            |

### Public
| ID              | Screen              | Spec                                             |
|-----------------|---------------------|--------------------------------------------------|
| SCR-PUBLIC      | Public Challenge    | [SCR-PUBLIC](screens/SCR-PUBLIC.md)              |

### Dialogs
| ID                | Dialog                 | Spec                                              |
|-------------------|------------------------|----------------------------------------------------|
| DLG-SAFETY-RAIL   | Safety Rail Warning    | [DLG-SAFETY-RAIL](screens/DLG-SAFETY-RAIL.md)    |
| DLG-CONFIRM-GOAL  | Confirm Goal           | [DLG-CONFIRM-GOAL](screens/DLG-CONFIRM-GOAL.md)  |
| DLG-LOGOUT        | Logout Confirmation    | [DLG-LOGOUT](screens/DLG-LOGOUT.md)              |

## Component Usage Matrix

| Screen          | NavBar | WeightInput | TrendChart | ScoreCard | StandingRow | PlacementBadge | ProgressBar | ShowdownBanner |
|-----------------|:------:|:-----------:|:----------:|:---------:|:-----------:|:--------------:|:-----------:|:--------------:|
| SCR-DASHBOARD   | ✓      |             | ✓          | ✓         | ✓           | ✓              | ✓           | ✓              |
| SCR-WEIGH-IN    | ✓      | ✓           |            |           |             |                |             |                |
| SCR-TREND       | ✓      |             | ✓          |           |             |                | ✓           |                |
| SCR-WEEKLY      | ✓      |             |            | ✓         | ✓           | ✓              |             | ✓              |
| SCR-LEADERBOARD | ✓      |             |            |           | ✓           | ✓              | ✓           |                |
| SCR-PARTICIPANT | ✓      |             | ✓          | ✓         |             | ✓              | ✓           |                |
| SCR-SPINUP      | ✓      | ✓           | ✓          |           |             |                |             |                |
| SCR-ONBOARDING  |        |             |            |           |             |                |             |                |
| SCR-PROFILE     | ✓      |             |            |           |             |                |             |                |
