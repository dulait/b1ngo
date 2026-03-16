---
title: Repository and Unit of Work over Raw DbContext
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

# 0005. Repository and Unit of Work over Raw DbContext

**Status:** accepted
**Date:** 2026-03-14
**Deciders:** Software Architect

## Context

EF Core's `DbContext` already implements both the Repository and Unit of Work patterns internally. Adding our own abstractions on top is a deliberate choice with costs and benefits.

The domain layer defines `IRepository<TEntity, TId>` and `IUnitOfWork`. The infrastructure layer implements them.

## Decision

Use explicit Repository and Unit of Work interfaces defined in the Domain layer, implemented by Infrastructure.

```
Domain.Core:  IRepository<TEntity, TId>, IUnitOfWork
Domain.Game:  IRoomRepository : IRepository<Room, RoomId>
Infrastructure.Core:  Repository<TContext, TEntity, TId> (abstract base)
Infrastructure.Postgresql:  RoomRepository, UnitOfWork
```

Handlers depend on `IRoomRepository` and `IUnitOfWork` — never on `DbContext`.

## Consequences

**Positive:**

- Domain and Application layers have zero EF dependency. Replacing PostgreSQL with another store requires only new Infrastructure implementations.
- `IRoomRepository` is shaped by domain needs (`GetByJoinCodeAsync`) rather than by EF's API surface.
- Tests substitute repositories with in-memory fakes. No need for EF's `InMemoryProvider` or SQLite in unit tests.
- `IUnitOfWork.SaveChangesAsync()` makes the persistence boundary explicit. Handlers choose when to commit.

**Negative:**

- `DbContext` already does what Repository and UnitOfWork do. The abstractions add a layer of indirection that must be maintained.
- The base `Repository<,,>` uses `Set<TEntity>()` generically. Aggregate-specific queries (e.g., `GetByJoinCodeAsync`) must be implemented in concrete repositories, which is extra code.
- `IUnitOfWork` is a thin wrapper around `DbContext.SaveChangesAsync`. Its value is decoupling, not behavior.

## Alternatives Considered

**Inject DbContext directly.** Handlers depend on `B1ngoDbContext`. Simpler, fewer files. Rejected because it couples Application to EF Core and PostgreSQL. Testing requires EF's test infrastructure instead of simple fakes.

**Repository without UnitOfWork.** Repository's `SaveAsync` method handles persistence internally. Rejected because it prevents coordinating multiple repository calls within a single transaction. `IUnitOfWork` keeps transaction control in the handler.
