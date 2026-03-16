---
title: Solution Decomposition into Seven Projects
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

# 0006. Solution Decomposition into Seven Projects

**Status:** accepted
**Date:** 2026-03-14
**Deciders:** Software Architect

## Context

The server-side codebase could be organized as a single project, a few projects per layer, or many fine-grained projects. The choice affects dependency enforcement, build times, and cognitive overhead.

## Decision

Seven projects, organized by layer and responsibility:

| Project | Layer | Dependencies | Purpose |
|---|---|---|---|
| `B1ngo.Domain.Core` | Domain | None | Base types: `Entity<TId>`, `EntityId<T>`, `IRepository`, `IUnitOfWork`, `IDomainEvent`, `IAuditable` |
| `B1ngo.Domain.Game` | Domain | Domain.Core | Game aggregate: Room, Player, BingoCard, BingoSquare, domain events |
| `B1ngo.Application.Common` | Application | None | Shared application primitives: `ICommand`, `ICommandHandler`, `Result<T>`, `Error` |
| `B1ngo.Application.Features` | Application | Application.Common, Domain.Game | Use case handlers, validators, DI registration |
| `B1ngo.Infrastructure.Core` | Infrastructure | Domain.Core, EF Core | Shared infra: base Repository, DomainEventDispatcher, EF conventions |
| `B1ngo.Infrastructure.Postgresql` | Infrastructure | Infrastructure.Core, Application.Common, Domain.Game | PostgreSQL-specific: DbContext, configurations, migrations, concrete repositories |
| `B1ngo.Web` | API | Application.Features, Infrastructure.Postgresql | ASP.NET Core host, controllers, composition root |

The compiler enforces dependency direction. Domain.Game cannot reference Infrastructure because there is no ProjectReference. This is a hard guarantee, not a convention.

## Consequences

**Positive:**

- Layer violations are compile errors, not code review findings.
- Domain.Core can be reused across bounded contexts (if more are added) without carrying game-specific types.
- Application.Common separates framework-agnostic primitives (Result, Command) from feature-specific code.
- Infrastructure.Core separates EF conventions and base classes from PostgreSQL-specific implementation. Switching to another EF provider (SQL Server, SQLite) requires only a new Infrastructure.Provider project.

**Negative:**

- Seven projects for a single bounded context is heavy. Build graph has seven nodes. IDE solution explorer is busier.
- Application.Common and Infrastructure.Core are small (3-5 files each). They exist for structural purity, not because they carry significant code mass.
- Adding a new feature touches at minimum Application.Features (handler, command, validator) and possibly Domain.Game (new aggregate behavior) — two projects for one feature.

## Alternatives Considered

**Single project with folder-based layers.** All code in one project, organized by folders: `/Domain`, `/Application`, `/Infrastructure`, `/Web`. Simpler structure. Rejected because folder conventions are not enforced by the compiler. A developer can accidentally add a `using B1ngo.Infrastructure` in a Domain class and nothing prevents it.

**Three projects (Domain, Application, Infrastructure+Web).** Fewer projects with coarser granularity. Rejected because it bundles Infrastructure.Core (reusable EF conventions) with Infrastructure.Postgresql (provider-specific), and Application.Common (stable primitives) with Application.Features (volatile handlers).

**Feature-sliced projects.** One project per feature (e.g., `B1ngo.CreateRoom`, `B1ngo.JoinRoom`). Rejected as premature vertical slicing. Features currently share the same aggregate, repository, and domain model. Splitting by feature would duplicate or circularly reference shared types.
