---
title: Room as Sole Aggregate Root
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

# 0001. Room as Sole Aggregate Root

**Status:** accepted
**Date:** 2026-03-14
**Deciders:** Software Architect

## Context

B1ngo's core domain is a bingo game played during F1 sessions. The primary entities are Room, Player, BingoCard, and BingoSquare. A Room hosts players who each have a card; the game lifecycle (Lobby → Active → Completed) governs what operations are valid.

Key invariants cross entity boundaries:

- Players can only join when the Room is in Lobby.
- The game cannot start until every Player has a Card assigned.
- Squares can only be marked when the Room is Active.
- A Player cannot mark squares after achieving bingo.
- Leaderboard rankings must be recalculated when a win is revoked.

These invariants require simultaneous access to Room state, Player state, and Card state. No single child entity can enforce them alone.

## Decision

Room is the sole aggregate root. Player, BingoCard, BingoSquare, and LeaderboardEntry exist only within the Room aggregate. All state changes go through Room methods. Only `IRoomRepository` exists — no `IPlayerRepository`, no `IBingoCardRepository`.

Concretely:

- `Room.Create(...)` creates the Room and the host Player.
- `Room.AddPlayer(...)` creates a Player within the Room.
- `Room.MarkSquare(playerId, row, col, ...)` delegates through Player → Card → Square but enforces Room-level invariants first.
- `Room.StartGame()` validates all Players have Cards before transitioning state.

## Consequences

**Positive:**

- All game invariants are enforced in one place. No distributed validation.
- Single transactional boundary. Saving a Room saves everything inside it atomically.
- Repository design is simple — one repository, one aggregate.

**Negative:**

- The Room class accumulates methods as features grow (mark, unmark, edit, start, end, add player). At some point it may become large enough to warrant extracting domain services that operate on Room, but the aggregate boundary itself should remain.
- Concurrent modifications to the same Room (two players marking simultaneously) contend on the same aggregate. Acceptable for a bingo game's concurrency profile.
- Loading a Room means loading all its Players, Cards, and Squares. For a game with ~20 players and 5x5 cards, this is ~500 BingoSquare objects — negligible.

## Alternatives Considered

**Player as a separate aggregate root.** Player would own its Card and Squares independently. Rejected because Room-level invariants (game status checks, leaderboard management, duplicate name enforcement) cannot be enforced without loading the Room anyway. Splitting would create cross-aggregate coordination for every operation, adding complexity without benefit.

**BingoCard as a separate aggregate.** Rejected for the same reason — win detection requires checking Card state against Room configuration (which win patterns are active), which requires both aggregates in the same transaction.
