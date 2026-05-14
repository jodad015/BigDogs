# Service Architecture

## Edge Functions (10 endpoints)

| Edge Function            | Manager              | Method      | Purpose                                    |
|--------------------------|----------------------|-------------|--------------------------------------------|
| `entity-load/`           | EntityManager        | load()      | Read entities (profiles, challenges, weigh-ins, etc.) |
| `entity-store/`          | EntityManager        | store()     | Create/update entities                     |
| `entity-delete/`         | EntityManager        | delete()    | Delete entities                            |
| `transaction-load/`      | TransactionManager   | load()      | Read computed data (scores, leaderboards, standings) |
| `transaction-execute/`   | TransactionManager   | execute()   | Run complex operations (scoring, state transitions) |
| `feed-schedule/`         | FeedManager          | schedule()  | Schedule recurring jobs (weekly scoring trigger) |
| `feed-ingest/`           | FeedManager          | ingest()    | Process incoming data (trend computation, etc.) |
| `feed-digest/`           | FeedManager          | digest()    | Generate summaries/digests                 |
| `notification-notify/`   | NotificationManager  | notify()    | Create in-app notifications                |
| `notification-send/`     | NotificationManager  | send()      | Deliver notifications (future: push, email)|

---

## `_shared/` Directory Layout

```
supabase/functions/_shared/
├── manager-base.ts                          # Abstract base: 4-layer intercept pipeline
├── supabase-client.ts                       # Deno Supabase client factory
├── context.ts                               # Context builder (JWT → UserContext)
├── index.ts                                 # Barrel exports
│
├── managers/
│   ├── entity-manager/
│   │   ├── entity-manager.ts                # load(), store(), delete()
│   │   ├── mapper.ts
│   │   ├── schemas.ts                       # Zod schemas per request type
│   │   ├── criteria/                        # Typed criteria per operation
│   │   └── handlers/                        # Handler functions per request type
│   │
│   ├── transaction-manager/
│   │   ├── transaction-manager.ts           # load(), execute()
│   │   ├── mapper.ts
│   │   ├── schemas.ts
│   │   ├── criteria/
│   │   └── handlers/                        # Scoring, placements, state transitions
│   │
│   ├── feed-manager/
│   │   ├── feed-manager.ts                  # schedule(), ingest(), digest()
│   │   ├── mapper.ts
│   │   ├── schemas.ts
│   │   ├── criteria/
│   │   └── handlers/
│   │
│   └── notification-manager/
│       ├── notification-manager.ts          # notify(), send()
│       ├── mapper.ts
│       ├── schemas.ts
│       ├── criteria/
│       └── handlers/
│
├── accessors/
│   ├── user/                                # User/profile data access
│   │   ├── user-accessor.ts                 # load(), store(), delete()
│   │   ├── criteria/
│   │   ├── mappers/
│   │   └── handlers/
│   │
│   └── system/                              # Challenges, participants, weigh-ins, results
│       ├── system-accessor.ts               # load(), store(), delete()
│       ├── criteria/
│       ├── mappers/
│       └── handlers/
│
├── engines/
│   ├── validation/                          # Business rule validation
│   │   ├── validation-engine.ts
│   │   └── handlers/                        # Per-request-type validators
│   │
│   └── transformation/                      # Data transformation
│       └── transformation-engine.ts
│
├── utilities/                               # Same as SupaArch
│   ├── storage/
│   │   ├── storage-utility.ts
│   │   └── criteria.ts
│   ├── communication/
│   │   ├── communication-utility.ts
│   │   └── criteria.ts
│   ├── queue/
│   │   ├── queue-utility.ts
│   │   └── criteria.ts
│   ├── logging/
│   │   ├── logging-utility.ts
│   │   └── criteria.ts
│   ├── context/
│   │   ├── context-utility.ts
│   │   └── criteria.ts
│   ├── datetime/
│   │   └── datetime-utility.ts
│   └── configuration/
│       ├── configuration-utility.ts
│       └── criteria.ts
│
├── types/
│   ├── context.ts                           # ContextBase, UserContext, SystemContext
│   ├── result-base.ts                       # ResultBase (errors array)
│   ├── error-base.ts                        # ErrorBase (code, message, field)
│   └── validation-result.ts                 # ValidationResult
│
└── enums/
    ├── error-code.ts
    ├── context-type.ts
    ├── log-level.ts
    └── index.ts
```

---

## Manager Responsibilities

### EntityManager — CRUD for all domain entities

Handles straightforward create/read/update/delete via the two accessors.

| Method   | Request Types (via criteria.type)                    |
|----------|------------------------------------------------------|
| load()   | UserProfileLoad, ChallengeLoad, ParticipantLoad, WeighInLoad |
| store()  | UserProfileStore, ChallengeStore, ParticipantStore, WeighInStore, GoalStore |
| delete() | WeighInDelete, ChallengeDelete (if needed)           |

**Dispatches to:**
- UserAccessor — profile reads/writes
- SystemAccessor — challenges, participants, weigh-ins

### TransactionManager — Computed data and complex operations

Handles multi-step operations that involve computation, multiple entity
updates, or state transitions.

| Method    | Request Types (via criteria.type)                     |
|-----------|-------------------------------------------------------|
| load()    | WeeklyResultLoad, LeaderboardLoad, StandingsLoad, PublicChallengeLoad |
| execute() | ComputeWeeklyScores, ComputeTrendWeight, TransitionChallengeStatus, DetermineWinner, EnterMaintenance |

**Key operations:**
- **ComputeWeeklyScores** — The big one: performance ratio → factor → multiplier → score → placements → points for all participants
- **ComputeTrendWeight** — 7-day rolling average with 5/7 minimum threshold
- **TransitionChallengeStatus** — setup → spinup → active → complete
- **DetermineWinner** — Aggregate points, handle ties (co-winners)
- **EnterMaintenance** — Triggered when cumulative progress hits 100%

### FeedManager — Scheduled and batch operations

| Method     | Purpose                                               |
|------------|-------------------------------------------------------|
| schedule() | Set up recurring jobs (weekly Friday scoring trigger) |
| ingest()   | Process batched data (bulk trend recomputation, etc.) |
| digest()   | Generate periodic summaries (weekly recap, etc.)      |

### NotificationManager — In-app notifications

| Method   | Purpose                                                |
|----------|--------------------------------------------------------|
| notify() | Create notification records (missed weigh-in warning, weekly results ready, challenge invite) |
| send()   | Deliver via channel (in-app for v1, future: push/email)|

---

## Accessor Responsibilities

### UserAccessor

| Method   | Operations                                |
|----------|-------------------------------------------|
| load()   | ProfileLoad — by user ID(s)               |
| store()  | ProfileStore — create/update profile      |
| delete() | ProfileDelete — account deletion (future) |

### SystemAccessor

| Method   | Operations                                               |
|----------|----------------------------------------------------------|
| load()   | ChallengeLoad, ParticipantLoad, WeighInLoad, WeeklyResultLoad |
| store()  | ChallengeStore, ParticipantStore, WeighInStore, WeeklyResultStore |
| delete() | WeighInDelete, ChallengeDelete                           |

---

## Engine Responsibilities

### ValidationEngine

Per-request-type business rule validators. Examples:

| Request Type          | Validations                                            |
|-----------------------|--------------------------------------------------------|
| ChallengeStore        | Creator is authenticated, duration in [10,12,14,16]    |
| GoalStore             | Safety rails (pace ceiling, healthy floor, BMI nudge)  |
| WeighInStore          | Weight > 0, user owns the weigh-in                     |
| JoinChallenge         | Challenge exists, in setup status, not full, not already joined |
| ComputeWeeklyScores   | Challenge is active, week boundary is valid            |

### TransformationEngine

Data transformations between layers. Examples:
- DB row (snake_case) ↔ domain model (camelCase)
- Raw weigh-in data → trend weight computation
- Scoring formula inputs → weekly result outputs
- Full challenge data → sanitized public view (strip weight numbers)

---

## Request Type Enums (packages/shared)

```typescript
// EntityRequestType
EntityRequestType = {
  UserProfileLoad:    'userProfileLoadRequest',
  UserProfileStore:   'userProfileStoreRequest',
  ChallengeLoad:      'challengeLoadRequest',
  ChallengeStore:     'challengeStoreRequest',
  ChallengeDelete:    'challengeDeleteRequest',
  ParticipantLoad:    'participantLoadRequest',
  ParticipantStore:   'participantStoreRequest',
  GoalStore:          'goalStoreRequest',
  WeighInLoad:        'weighInLoadRequest',
  WeighInStore:       'weighInStoreRequest',
  WeighInDelete:      'weighInDeleteRequest',
}

// TransactionRequestType
TransactionRequestType = {
  WeeklyResultLoad:            'weeklyResultLoadRequest',
  LeaderboardLoad:             'leaderboardLoadRequest',
  StandingsLoad:               'standingsLoadRequest',
  PublicChallengeLoad:         'publicChallengeLoadRequest',
  ComputeWeeklyScores:         'computeWeeklyScoresRequest',
  ComputeTrendWeight:          'computeTrendWeightRequest',
  TransitionChallengeStatus:   'transitionChallengeStatusRequest',
  DetermineWinner:             'determineWinnerRequest',
  EnterMaintenance:            'enterMaintenanceRequest',
}

// FeedRequestType
FeedRequestType = {
  ScheduleWeeklyScoring:  'scheduleWeeklyScoringRequest',
  IngestWeighIns:         'ingestWeighInsRequest',
  DigestWeeklySummary:    'digestWeeklySummaryRequest',
}

// NotificationRequestType
NotificationRequestType = {
  MissedWeighInWarning:   'missedWeighInWarningRequest',
  WeeklyResultsReady:     'weeklyResultsReadyRequest',
  ChallengeInvite:        'challengeInviteRequest',
  SendNotification:       'sendNotificationRequest',
}
```

---

## Data Flow: Weigh-In → Weekly Score (Example)

```
1. User submits weigh-in
   → entity-store/ → EntityManager.store(WeighInStore)
   → SystemAccessor.store() → insert weigh-in row

2. Trend weight computed
   → transaction-execute/ → TransactionManager.execute(ComputeTrendWeight)
   → Read last 7 days of weigh-ins → compute average → update trend_weight

3. Friday arrives — weekly scoring triggered
   → feed-schedule/ → FeedManager.schedule() (or cron)
   → transaction-execute/ → TransactionManager.execute(ComputeWeeklyScores)
   → For each participant: read trends → compute factor/multiplier/score
   → Rank all 4 → apply tie rules → assign points (doubled if showdown)
   → SystemAccessor.store() → insert weekly_result rows

4. Participants notified
   → notification-notify/ → NotificationManager.notify(WeeklyResultsReady)
   → Create in-app notification records
```
