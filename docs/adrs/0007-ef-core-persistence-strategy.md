---
title: EF Core Persistence Strategy — Owned Types, JSON Columns, Snake Case
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

# 0007. EF Core Persistence Strategy

**Status:** accepted
**Date:** 2026-03-14
**Deciders:** Software Architect

## Context

The domain model includes value objects (RaceSession, RoomConfiguration, LeaderboardEntry, BingoCard, BingoSquare) that need to be persisted alongside their owning entities. EF Core offers several mapping strategies: separate tables, owned entities in the same table, and JSON columns.

The project also needs a naming convention for database objects (columns, tables) that matches PostgreSQL conventions.

## Decision

Three persistence strategies, applied per value object type:

| Value Object | Strategy | Rationale |
|---|---|---|
| `RaceSession` | Owned entity, same table as Room | Small, fixed-shape. Three scalar columns (`season`, `grand_prix_name`, `session_type`) alongside Room. |
| `RoomConfiguration` | Owned entity, JSON column | Variable-shape (`WinningPatterns` is a list). JSON avoids a join table for the pattern list. |
| `LeaderboardEntry` | Owned collection, JSON column | Ordered list of entries. JSON preserves order and avoids a separate table for a small collection. |
| `BingoCard` + `BingoSquare` | Owned entity on Player, JSON column | Card contains a nested list of Squares. JSON maps the entire card structure as a single column on the Player row. |

Global conventions applied via `ModelBuilderExtensions.ApplyGlobalConventions()`:

- Table names: PascalCase entity name → `snake_case` + pluralized (`Room` → `rooms`).
- Column names: PascalCase property name → `snake_case` (`HostPlayerId` → `host_player_id`).
- `EntityId<T>` types: automatic `ValueConverter` from strongly-typed ID to `Guid`.
- JSON-mapped properties: column names left as-is (JSON keys are not snake_cased — they follow the C# property names inside the JSON document).

Enum columns (`RoomStatus`, `SessionType`) stored as strings via `.HasConversion<string>()`.

## Consequences

**Positive:**

- JSON columns eliminate join tables for nested collections (squares, leaderboard entries, winning patterns). Fewer tables, simpler queries for aggregate loading.
- Snake case naming matches PostgreSQL conventions. No quoting issues.
- Automatic EntityId converters prevent manual converter registration per ID type.
- Enum-as-string makes database rows human-readable and avoids integer-to-enum mapping drift.

**Negative:**

- JSON columns cannot be indexed or queried efficiently at the field level in PostgreSQL (without GIN indexes on jsonb, which are not configured). Querying "find all rooms where a player's card has a specific event key" would require full table scans.
- The custom pluralization logic (`StringExtensions.Pluralize`) handles common cases but will produce incorrect plurals for irregular nouns. Not a concern for the current entity names (Room → rooms, Player → players).
- Global conventions applied via reflection in `ApplyGlobalConventions()` run on every model build. Performance is negligible but the reflection-based approach is fragile if EF Core's metadata API changes.

## Alternatives Considered

**Separate tables for all value objects.** BingoSquare as its own table with a foreign key to Player. Standard relational mapping. Rejected because loading a Room aggregate would require joins across 4+ tables. JSON columns keep the aggregate load to 2 tables (rooms + players).

**PostgreSQL arrays for simple lists.** `WinningPatterns` as a `text[]` array column. Rejected because EF Core's array support varies by provider and version. JSON is more portable and handles nested structures uniformly.
