---
title: Transactional Outbox for Domain Events
version: "0.1.0"
status: accepted
date: 2026-03-15
authors:
  - Software Architect
reviewers: []
changelog:
  - version: "0.1.0"
    date: 2026-03-15
    description: Initial draft — supersedes ADR-0004
---

# 0009. Transactional Outbox for Domain Events

**Status:** accepted (supersedes ADR-0004)
**Date:** 2026-03-15
**Deciders:** Software Architect

## Context

ADR-0004 established domain event dispatch post-persistence: `SaveChangesAsync` collects events, saves the aggregate, then dispatches events in-process. This has a fundamental flaw acknowledged in ADR-0004 itself: *"If a handler fails after persistence, the state change is committed but the side effect is lost. There is no outbox pattern or retry mechanism."*

With the addition of SignalR (real-time WebSocket events), reliable event delivery is no longer optional. A dropped `BingoAchievedDomainEvent` means a player's win is never broadcast to other participants.

## Decision

Replace in-process domain event dispatch with a transactional outbox.

### Outbox Message Schema

```
outbox_messages (
  id              uuid          PK,
  event_type      varchar(500)  NOT NULL,  -- fully-qualified CLR type name
  payload         jsonb         NOT NULL,  -- serialized domain event
  occurred_at     timestamptz   NOT NULL,
  processed_at    timestamptz   NULL,      -- set when successfully handled
  retry_count     int           NOT NULL DEFAULT 0,
  error           varchar(2000) NULL       -- last error message
)
```

Filtered index on `processed_at IS NULL` for efficient polling.

### Write Path

`B1ngoDbContext.SaveChangesAsync` no longer dispatches events. Instead:

1. Collect domain events from tracked entities (same as before).
2. Clear events from entities (same as before).
3. Serialize each event as an `OutboxMessage` and add to the `DbContext`.
4. Call `base.SaveChangesAsync()` — aggregate state and outbox messages are saved in the same transaction.

The `IDomainEventDispatcher` dependency is removed from `B1ngoDbContext`.

### Read Path

`OutboxProcessor` is a `BackgroundService` that:

1. Polls for unprocessed messages (`processed_at IS NULL AND retry_count < max_retry`) ordered by `occurred_at`.
2. Deserializes the event using `Type.GetType(event_type)` and `System.Text.Json`.
3. Delegates to `IDomainEventDispatcher.DispatchAsync()` — reusing the existing dispatcher and `IDomainEventHandler<T>` registrations.
4. On success: sets `processed_at`.
5. On failure: increments `retry_count`, stores the error message.
6. Messages exceeding `max_retry` (default: 5) are logged as poison messages and abandoned.

### Existing Abstractions Preserved

- `IDomainEvent` marker interface — unchanged.
- `IDomainEventHandler<T>` — unchanged. Handlers are still registered via DI.
- `IDomainEventDispatcher` — unchanged. The outbox processor uses it, `SaveChangesAsync` does not.
- `DomainEventDispatcher` (Infrastructure.Core) — unchanged. Still resolves handlers via reflection.

## Consequences

**Positive:**

- Events are guaranteed to be written if and only if the aggregate state change is committed. No lost events, no ghost events.
- Failed handlers are retried automatically. Transient failures (network, SignalR hub unavailability) self-heal.
- Poison message protection prevents a single bad event from blocking the entire queue.
- Existing `IDomainEventHandler<T>` implementations work without modification.
- Event history is queryable in the database (useful for debugging).

**Negative:**

- Events are delivered asynchronously with a polling delay (default 5 seconds). Real-time events have slightly higher latency than in-process dispatch. Acceptable for a game where events are human-observable, not millisecond-sensitive.
- The `outbox_messages` table grows over time. Requires periodic cleanup of processed messages (not implemented in this ADR — deferred to operational concerns).
- `Type.GetType(event_type)` is fragile if event classes are renamed or moved across assemblies. Mitigated by using `AssemblyQualifiedName` for serialization.

## Alternatives Considered

**In-process dispatch with retry wrapper.** Wrap handlers in a retry decorator. Rejected because it still cannot recover from process crashes between save and dispatch. The outbox survives process restarts.

**Message broker (RabbitMQ, Azure Service Bus).** External message infrastructure. Rejected as overbuilt for a single-server application with no cross-service communication requirements.

**CDC (Change Data Capture) on PostgreSQL.** Use logical replication to capture outbox inserts. Rejected as operationally complex for a passion project.
