# Weigh-In & Scoring Pipeline — Detail Design

## Overview

When a user logs a daily weight, the system needs to:
1. Validate and store the weigh-in with a server-computed trend weight
2. Check if a scoring week has completed
3. If so, asynchronously compute weekly scores for all participants

This document describes the full call chain from user action to scored results.

---

## Call Chain: Log Weight

```mermaid
sequenceDiagram
    participant User
    participant WebApp as Web App
    participant EF_Store as entity-store<br/>(Edge Function)
    participant EM as EntityManager
    participant MH as WeighInStore<br/>ManagerHandler
    participant SA as SystemAccessor
    participant WLH as WeighInLoadHandler
    participant WSH as WeighInStoreHandler
    participant DB as PostgreSQL
    participant QU as QueueUtility
    participant PGMQ as pgmq<br/>(scoring_jobs)

    User->>WebApp: Tap "Log It" (183.2 lb)
    WebApp->>EF_Store: supabase.functions.invoke('entity-store',<br/>{ type: WeighInStore, weight, date })

    EF_Store->>EM: EntityManager.store(criteria)
    EM->>EM: Stage 1: Zod validation
    EM->>EM: Stage 2: Map criteria
    EM->>EM: Stage 3: Business validation
    EM->>MH: Dispatch to handler

    MH->>SA: SystemAccessor.load(<br/>{ type: WeighInLoad, userId, limit: 7,<br/>orderBy: date_desc })
    SA->>WLH: Dispatch to handler
    WLH->>DB: SELECT from weigh_ins<br/>WHERE user_id = ? ORDER BY date<br/>DESC LIMIT 7
    DB-->>WLH: rows
    WLH-->>SA: weighIns[]
    SA-->>MH: weighIns[]

    MH->>MH: Compute 7-day EMA trend weight

    MH->>SA: SystemAccessor.store(<br/>{ type: WeighInStore, userId, date,<br/>weight, trendWeight })
    SA->>WSH: Dispatch to handler
    WSH->>DB: UPSERT weigh_ins row
    DB-->>WSH: stored row
    WSH-->>SA: { weighIn }
    SA-->>MH: { weighIn }

    MH->>MH: Check: is a scoring week complete?

    alt Scoring needed
        MH->>QU: QueueUtility.send(QueueName.ScoringJobs,<br/>{ challengeId, weekNumber })
        QU->>DB: pgmq_send('scoring_jobs', msg)
        DB->>PGMQ: Message enqueued
    end

    MH-->>EM: { weighIn, trend }
    EM-->>EF_Store: Result
    EF_Store-->>WebApp: { weighIn, trend }
    WebApp-->>User: Success screen
```

---

## Call Chain: Score a Week (Async)

```mermaid
sequenceDiagram
    participant PGMQ as pgmq<br/>(scoring_jobs)
    participant Webhook as Database Webhook
    participant EF_TX as transaction-execute<br/>(Edge Function)
    participant TM as TransactionManager
    participant MH as ComputeWeeklyScores<br/>ManagerHandler
    participant SA as SystemAccessor
    participant PLH as ParticipantLoadHandler
    participant WLH as WeighInLoadHandler
    participant WRSH as WeeklyResultStoreHandler
    participant DB as PostgreSQL

    Note over PGMQ,Webhook: Triggered by Database Webhook<br/>on pgmq message insert

    Webhook->>EF_TX: POST transaction-execute<br/>{ type: ComputeWeeklyScores,<br/>challengeId, weekNumber }

    EF_TX->>TM: TransactionManager.execute(criteria)
    TM->>TM: Stage 1: Validate input
    TM->>TM: Stage 2: Map criteria
    TM->>MH: Dispatch to handler

    Note over MH: Handler owns all business logic

    MH->>SA: SystemAccessor.load(<br/>{ type: ParticipantLoad,<br/>challengeId })
    SA->>PLH: Dispatch to handler
    PLH->>DB: SELECT participants<br/>WHERE challenge_id = ?
    DB-->>PLH: rows
    PLH-->>SA: participants[]
    SA-->>MH: participants[]

    MH->>SA: SystemAccessor.load(<br/>{ type: WeighInLoad, userIds,<br/>startDate, endDate })
    SA->>WLH: Dispatch to handler
    WLH->>DB: SELECT weigh_ins<br/>WHERE user_id IN (?) AND<br/>date BETWEEN ? AND ?
    DB-->>WLH: rows
    WLH-->>SA: weighIns[]
    SA-->>MH: weighIns[]

    MH->>MH: For each participant:<br/>1. start_trend, end_trend<br/>2. weekly_loss = start - end<br/>3. performance_ratio = loss / target<br/>4. performance_factor = clamp(ratio)<br/>5. weekly_score = factor × multiplier

    MH->>MH: Rank by weekly_score<br/>→ placement (1st, 2nd, ...)<br/>→ placement_points (N, N-1, ...)

    MH->>MH: Check showdown week<br/>→ double points if yes

    MH->>SA: SystemAccessor.store(<br/>{ type: WeeklyResultStore,<br/>results[] })
    SA->>WRSH: Dispatch to handler
    WRSH->>DB: UPSERT weekly_results rows
    DB-->>WRSH: stored
    WRSH-->>SA: { weekResults }
    SA-->>MH: { weekResults }

    MH->>MH: Archive queue message
    MH-->>TM: { weekResults }
    TM-->>EF_TX: Result
```

---

## Call Chain: Cron Backup (Daily)

```mermaid
sequenceDiagram
    participant Cron as pg_cron<br/>(midnight Pacific)
    participant DB as PostgreSQL
    participant PGMQ as pgmq<br/>(scoring_jobs)
    participant Webhook as Database Webhook

    Note over Cron: Runs daily at midnight Pacific

    Cron->>DB: SELECT challenges<br/>WHERE status = 'active'
    DB-->>Cron: Active challenges

    loop Each active challenge
        Cron->>DB: Check: any unscored<br/>completed weeks?
        DB-->>Cron: { challengeId, weekNumber }

        alt Unscored week found
            Cron->>DB: pgmq_send('scoring_jobs',<br/>{ challengeId, weekNumber })
            DB->>PGMQ: Message enqueued
            Note over Webhook: Same webhook fires,<br/>same scoring pipeline
        end
    end
```

---

## Component Map

```mermaid
graph TD
    subgraph "Web App (React)"
        UI[Weigh-In Page]
    end

    subgraph "Edge Functions (Deno)"
        ES[entity-store]
        TX[transaction-execute]
    end

    subgraph "Managers"
        EM[EntityManager]
        TM[TransactionManager]
    end

    subgraph "Handlers (Business Logic)"
        WSH[WeighInStoreHandler<br/>trend + enqueue]
        CSH[ComputeWeeklyScoresHandler<br/>loss, factor, score,<br/>rank, placements]
    end

    subgraph "Accessors (Data Access Only)"
        SA[SystemAccessor]
        SAH["Per-Table Handlers (generic, reusable):<br/>WeighInLoadHandler<br/>WeighInStoreHandler<br/>WeighInDeleteHandler<br/>ParticipantLoadHandler<br/>ParticipantStoreHandler<br/>WeeklyResultLoadHandler<br/>WeeklyResultStoreHandler<br/>ChallengeLoadHandler"]
        SA --> SAH
        SAH --> DB
    end

    subgraph "Utilities"
        QU[QueueUtility]
    end

    subgraph "PostgreSQL"
        DB[(Tables)]
        PGMQ[pgmq<br/>scoring_jobs]
        CRON[pg_cron<br/>nightly backup]
    end

    subgraph "Supabase Infrastructure"
        WH[Database Webhook]
    end

    UI -->|functions.invoke| ES
    ES --> EM
    EM --> WSH
    WSH --> SA
    SA --> DB
    WSH --> QU
    QU --> PGMQ

    PGMQ -.->|webhook trigger| WH
    WH -->|POST| TX
    TX --> TM
    TM --> CSH
    CSH --> SA

    CRON -->|pgmq_send| PGMQ
```

---

## Accessor Handler Criteria (Generic, Reusable)

Each accessor handler accepts a criteria object with nullable parameters.
The handler builds a query from whatever is non-null. This means the same
handler serves any manager handler that needs data from that table.

```typescript
// supabase/functions/_shared/accessors/system/types.ts

interface WeighInLoadCriteria {
  type: 'WeighInLoad';
  id?: string;
  userId?: string;
  userIds?: string[];
  startDate?: string;
  endDate?: string;
  limit?: number;
  orderBy?: 'date_asc' | 'date_desc';
}

interface WeighInStoreCriteria {
  type: 'WeighInStore';
  userId: string;
  date: string;
  weight: number;
  trendWeight?: number;
}

interface WeighInDeleteCriteria {
  type: 'WeighInDelete';
  id?: string;
  userId?: string;
  date?: string;
}

interface ParticipantLoadCriteria {
  type: 'ParticipantLoad';
  id?: string;
  challengeId?: string;
  userId?: string;
  status?: string | string[];
  includeProfiles?: boolean;
}

interface ParticipantStoreCriteria {
  type: 'ParticipantStore';
  challengeId: string;
  userId: string;
  status?: string;
  startingWeight?: number;
  targetWeight?: number;
  weeklyTarget?: number;
  goalMethod?: string;
  goalInput?: number;
  totalLoss?: number;
}

interface WeeklyResultLoadCriteria {
  type: 'WeeklyResultLoad';
  challengeId?: string;
  participantId?: string;
  weekNumber?: number;
}

interface WeeklyResultStoreCriteria {
  type: 'WeeklyResultStore';
  results: WeeklyResultRow[];
}

interface ChallengeLoadCriteria {
  type: 'ChallengeLoad';
  id?: string;
  inviteCode?: string;
  status?: string | string[];
  isPublic?: boolean;
  createdBy?: string;
}
```

---

## Queue Name Enum

Queue names are defined as an enum in the shared edge function layer,
accessible by any manager that needs to enqueue work:

```typescript
// supabase/functions/_shared/types/queue-names.ts
export enum QueueName {
  ScoringJobs = 'scoring_jobs',
  // Future queues:
  // NotificationJobs = 'notification_jobs',
  // ChallengeTransitions = 'challenge_transitions',
}
```

Used by managers:
```typescript
import { QueueName } from '../types/queue-names.ts';

await queueUtility.send({
  queue: QueueName.ScoringJobs,
  message: { challengeId, weekNumber },
});
```

---

## Week Boundary Logic

A scoring week is complete when:

```
week_end_date = challenge.start_date + (weekNumber × 7) - 1

Scoring triggers when:
1. Current date > week_end_date (week has ended)
2. No weekly_results row exists for this challenge + week
3. Either:
   a. All participants have at least 1 weigh-in in the week (last person logged)
   b. A new week has started and previous week was never scored
   c. pg_cron nightly check finds an unscored week
```

---

## Database Changes Required

1. **Enable pgmq extension** — `create extension pgmq;`
2. **Create scoring_jobs queue** — `select pgmq.create('scoring_jobs');`
3. **Public wrapper functions** for pgmq (Edge Functions need public schema access)
4. **pg_cron job** — nightly check for unscored weeks
5. **Database Webhook** — configured in Supabase dashboard, fires on pgmq message

---

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `_shared/types/queue-names.ts` | Create | QueueName enum |
| `_shared/utilities/queue/queue-utility.ts` | Create | pgmq wrapper |
| `_shared/accessors/system/system-accessor.ts` | Modify | Add dispatch to new handlers |
| `_shared/accessors/system/handlers/weigh-in-load-handler.ts` | Create | Generic weigh_ins SELECT (nullable: userId, userIds, startDate, endDate, limit, orderBy) |
| `_shared/accessors/system/handlers/weigh-in-store-handler.ts` | Create | Generic weigh_ins UPSERT (userId, date, weight, trendWeight) |
| `_shared/accessors/system/handlers/weigh-in-delete-handler.ts` | Create | Generic weigh_ins DELETE (nullable: id, userId, date) |
| `_shared/accessors/system/handlers/participant-load-handler.ts` | Create | Generic participants SELECT (nullable: id, challengeId, userId, status, includeProfiles) |
| `_shared/accessors/system/handlers/participant-store-handler.ts` | Create | Generic participants UPSERT |
| `_shared/accessors/system/handlers/weekly-result-load-handler.ts` | Create | Generic weekly_results SELECT (nullable: challengeId, participantId, weekNumber) |
| `_shared/accessors/system/handlers/weekly-result-store-handler.ts` | Create | Generic weekly_results UPSERT (accepts array of result rows) |
| `_shared/accessors/system/handlers/challenge-load-handler.ts` | Create | Generic challenges SELECT (nullable: id, inviteCode, status, isPublic) |
| `_shared/managers/entity-manager/handlers/weigh-in-store-handler.ts` | Create | Trend computation + week boundary check + enqueue scoring job |
| `_shared/managers/transaction-manager/handlers/compute-weekly-scores-handler.ts` | Create | All scoring business logic: loss, factor, score, rank, placements, showdown |
| `supabase/migrations/YYYYMMDD_pgmq_scoring_queue.sql` | Create | pgmq extension + queue + public wrappers |
| `apps/web/src/hooks/use-weigh-ins.ts` | Modify | Replace direct DB calls with functions.invoke |
