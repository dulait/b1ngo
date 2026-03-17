---
title: Architecture Decision Records
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

# Architecture Decision Records

| # | Title | Status | Date |
|---|---|---|---|
| [0001](0001-room-as-sole-aggregate-root.md) | Room as Sole Aggregate Root | accepted | 2026-03-14 |
| [0002](0002-cqrs-without-mediatr.md) | CQRS Without MediatR | accepted | 2026-03-14 |
| [0003](0003-railway-oriented-error-handling.md) | Railway-Oriented Error Handling with Result&lt;T&gt; | accepted | 2026-03-14 |
| [0004](0004-domain-event-dispatch-post-persistence.md) | Domain Event Dispatch Post-Persistence | accepted | 2026-03-14 |
| [0005](0005-repository-and-unit-of-work.md) | Repository and Unit of Work over Raw DbContext | accepted | 2026-03-14 |
| [0006](0006-solution-decomposition.md) | Solution Decomposition into Seven Projects | accepted | 2026-03-14 |
| [0007](0007-ef-core-persistence-strategy.md) | EF Core Persistence Strategy | accepted | 2026-03-14 |
| [0008](0008-error-type-enum-for-http-mapping.md) | Add ErrorType Enum for Deterministic HTTP Mapping | proposed | 2026-03-14 |
| [0009](0009-transactional-outbox-for-domain-events.md) | Transactional Outbox for Domain Events | accepted | 2026-03-15 |
| [0010](0010-deployment-architecture.md) | Deployment Architecture | proposed | 2026-03-17 |

## Conventions

- Filename: `NNNN-<kebab-case-title>.md`
- Template follows [Michael Nygard's ADR format](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)
- Status values: `proposed` → `accepted` → `deprecated` or `superseded by [NNNN]`
- New records are appended. Existing records are never deleted — they are deprecated or superseded.
