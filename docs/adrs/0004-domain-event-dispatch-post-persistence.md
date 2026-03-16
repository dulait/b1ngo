---
title: Domain Event Dispatch Post-Persistence
version: "0.1.0"
status: draft
date: 2026-03-14
authors:
  - Software Architect
reviewers: []
changelog:
  - version: "0.1.0"
    date: 2026-03-14
    description: Initial draft
---

# 0004. Domain Event Dispatch Post-Persistence

**Status:** accepted
**Date:** 2026-03-14
**Deciders:** Software Architect

## Context

Domain events are raised during aggregate operations (e.g., `RoomCreatedDomainEvent` when a Room is created, `BingoAchievedDomainEvent` when a player wins). These events need to be dispatched to handlers. The question is when: before persistence, during persistence, or after persistence.

## Decision

Domain events are dispatched after `SaveChangesAsync` succeeds. The mechanism lives in `B1ngoDbContext.SaveChangesAsync`:

1. Collect all domain events from tracked entities.
2. Clear events from entities (prevents re-dispatch on retry).
3. Call `base.SaveChangesAsync()` — persist the state change.
4. If persistence succeeds, dispatch events via `IDomainEventDispatcher`.

The dispatcher resolves handlers from the DI container using open generics and reflection:

```csharp
var handlerType = typeof(IDomainEventHandler<>).MakeGenericType(domainEvent.GetType());
```

Events are dispatched sequentially, not in parallel.

## Consequences

**Positive:**

- Handlers never react to state changes that failed to persist. No phantom events.
- Events and state changes share the same `SaveChangesAsync` call site, keeping the coordination point explicit.
- Event-raising code in the domain is simple — `RaiseDomainEvent(...)` adds to a list. No async, no dispatch logic.

**Negative:**

- If a handler fails after persistence, the state change is committed but the side effect is lost. There is no outbox pattern or retry mechanism. Acceptable for in-process handlers at this scale; requires an outbox if handlers trigger external systems.
- Handlers run within the same HTTP request scope. Long-running handlers block the response. Not a concern currently — no handlers are registered.
- The dispatcher uses reflection (`GetMethod("HandleAsync")`), which has no compile-time safety. A rename of the interface method silently breaks dispatch at runtime.
- Events are dispatched sequentially. If handler order matters, the current implementation provides no ordering guarantees (depends on DI registration order).

## Alternatives Considered

**Pre-persistence dispatch.** Events fire before `SaveChangesAsync`. Rejected because handlers would react to state that might not persist (e.g., if the save fails due to a concurrency conflict).

**Outbox pattern.** Events are serialized into an outbox table within the same transaction, then dispatched by a background processor. Overkill for a single-process application with no external consumers. Would reconsider if the system adds message broker integration.

**MediatR notifications.** Would provide typed dispatch without reflection. Rejected alongside MediatR itself (see ADR-0002).
