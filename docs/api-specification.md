---
title: API Specification
version: "1.0.0"
status: approved
date: 2026-03-16
authors:
  - Software Architect
reviewers: []
changelog:
  - version: "1.0.0"
    date: 2026-03-16
    description: "v1 release — cookie-based token transport for SignalR, token storage corrected to player_tokens table, added missing square_not_found error, version bump"
  - version: "0.2.0"
    date: 2026-03-15
    description: Resolved all open design decisions, marked approved
  - version: "0.1.0"
    date: 2026-03-15
    description: Initial draft — MVP feature set and endpoint contracts
---

# API Specification

## Conventions

| Convention | Value |
|---|---|
| Base URL | `/api/v1` |
| Content-Type | `application/json` |
| Auth mechanism | `X-Player-Token` header (REST) / `PlayerToken` cookie (SignalR). Opaque GUID stored in `player_tokens` table, returned on create/join. |
| ID format | UUID v4 |
| Enum serialization | `PascalCase` string (e.g., `"Race"`, `"Row"`) |
| Timestamps | ISO 8601 with UTC offset (`2026-03-15T14:30:00+00:00`) |
| Error shape | `{ "code": string, "message": string, "details": string[]? }` |
| Real-time transport | SignalR (WebSocket with fallback) |

## Enums

| Enum | Values |
|---|---|
| `RoomStatus` | `Lobby`, `Active`, `Completed` |
| `SessionType` | `FP1`, `FP2`, `FP3`, `Qualifying`, `SprintQualifying`, `Sprint`, `Race` |
| `WinPatternType` | `Row`, `Column`, `Diagonal`, `Blackout` |
| `SquareMarkedBy` | `Api`, `Player`, `Host` |

---

## Features

### F1: Create Room

The host creates a room tied to an F1 session. Returns a join code for other players and a player token for the host's session identity.

| Attribute | Value |
|---|---|
| Domain operation | `Room.Create` |
| Actor | Host |
| Auth required | No (this call establishes identity) |
| Preconditions | None |
| Side effects | Room persisted, host added as first player, bingo card generated from shuffled predefined event pool and assigned to host |
| Domain events | `RoomCreatedDomainEvent`, `PlayerJoinedRoomDomainEvent` |

### F2: Join Room

A player joins an existing room via join code. Returns a player token for session identity.

| Attribute | Value |
|---|---|
| Domain operation | `Room.AddPlayer` |
| Actor | Player |
| Auth required | No (this call establishes identity) |
| Preconditions | Room exists, room is in `Lobby` status, display name is unique within room |
| Side effects | Player added, bingo card generated from shuffled predefined event pool and assigned |
| Domain events | `PlayerJoinedRoomDomainEvent` |

### F3: Edit Square

A player edits a square's display text on their card while in the lobby. Editing a predefined square clears its `EventKey`, making it a custom square (no longer auto-markable).

| Attribute | Value |
|---|---|
| Domain operation | `Room.EditSquare` |
| Actor | Player (own card only) |
| Auth required | Yes |
| Preconditions | Room in `Lobby`, player has a card, target square is not a free space |
| Side effects | Square text updated |
| Domain events | None |

### F4: Start Game

The host transitions the room from `Lobby` to `Active`.

| Attribute | Value |
|---|---|
| Domain operation | `Room.StartGame` |
| Actor | Host only |
| Auth required | Yes |
| Preconditions | Room in `Lobby`, all players have cards assigned |
| Side effects | Room status changes to `Active` |
| Domain events | `GameStartedDomainEvent` |

### F5: Mark Square

A player marks a square on their card, or the host marks a square on any player's card. Win detection runs automatically after each mark.

| Attribute | Value |
|---|---|
| Domain operation | `Room.MarkSquare` |
| Actor | Player (own card) or Host (any card) |
| Auth required | Yes |
| Preconditions | Room in `Active`, player has not already won, square is not already marked, square is not a free space |
| Side effects | Square marked. If marking completes a winning pattern: player flagged as winner, leaderboard entry added. |
| Domain events | `SquareMarkedDomainEvent`, optionally `BingoAchievedDomainEvent` |

### F6: Unmark Square

A player unmarks a square on their card, or the host unmarks a square on any player's card. If the player had won, win is revoked and leaderboard is recalculated.

| Attribute | Value |
|---|---|
| Domain operation | `Room.UnmarkSquare` |
| Actor | Player (own card) or Host (any card) |
| Auth required | Yes |
| Preconditions | Room in `Active`, square is marked, square is not a free space |
| Side effects | Square unmarked. If player had won and no longer has a winning pattern: win revoked, leaderboard re-ranked. |
| Domain events | `SquareUnmarkedDomainEvent` |

### F7: End Game

The host ends the game.

| Attribute | Value |
|---|---|
| Domain operation | `Room.EndGame` |
| Actor | Host only |
| Auth required | Yes |
| Preconditions | Room in `Active` |
| Side effects | Room status changes to `Completed` |
| Domain events | `GameCompletedDomainEvent` |

### F8: Get Room State

Retrieve the full room state: status, session info, configuration, players (with card state), and leaderboard.

| Attribute | Value |
|---|---|
| Domain operation | Read-only query |
| Actor | Any room participant |
| Auth required | Yes |
| Preconditions | Player belongs to the room |
| Side effects | None |
| Domain events | None |

### F9: Reconnect

A player who left the app reconnects by presenting their player token. Returns full room and player state.

| Attribute | Value |
|---|---|
| Domain operation | Read-only query (token lookup) |
| Actor | Any player with a valid token |
| Auth required | Yes (the token itself is the auth) |
| Preconditions | Token maps to an existing player in an existing room |
| Side effects | WebSocket connection re-established for the room |
| Domain events | None |

---

## Authentication

Players are identified by an opaque GUID token stored in a dedicated `player_tokens` table (infrastructure concern, not part of the domain model). The token is generated server-side and returned in the response to `POST /rooms` (create) and `POST /rooms/join` (join).

### Token Transport

The token is transmitted via two mechanisms depending on the transport:

| Transport | Mechanism | Detail |
|---|---|---|
| REST endpoints | `X-Player-Token` header | Client reads token from create/join response and sends it as a header on all subsequent requests. |
| SignalR hub | `PlayerToken` cookie | Set by the server as `HttpOnly`, `Secure`, `SameSite=Strict` on create/join responses. The browser sends it automatically on the SignalR HTTP handshake. No query params. |

### Token Lifecycle

| Aspect | Detail |
|---|---|
| Format | GUID v4 (e.g., `a1b2c3d4-e5f6-7890-abcd-ef1234567890`) |
| Storage (client) | `localStorage` (for REST header usage) + `HttpOnly` cookie (for SignalR, set by server) |
| Storage (server) | `player_tokens` table: `token` (PK), `player_id` (FK), `room_id` (FK), `is_host`, `created_at` |
| Lifetime | Lives as long as the room exists |
| Reconnection | Client presents stored token via `POST /rooms/reconnect` (header) |
| Token loss | Player must re-join as a new player (acceptable for MVP) |

### Why Cookie for SignalR

The browser WebSocket API does not support custom headers on the upgrade request. The standard SignalR pattern is to pass the token as a query parameter (`?access_token=...`), but query params are logged in server access logs, browser history, and proxy logs. A `HttpOnly` cookie avoids this — the browser sends it automatically on the HTTP handshake, and it is inaccessible to JavaScript (mitigating XSS token theft).

Endpoints that require auth are marked with **Auth** in their contract. The two identity-establishing endpoints (`POST /rooms` and `POST /rooms/join`) do not require auth — they return the token and set the cookie.

## Card Generation

On join (and on room creation for the host), the server generates a bingo card by shuffling a predefined event pool.

| Aspect | Detail |
|---|---|
| Source | Hardcoded seed data, one list per `SessionType` |
| Pool size | ~30–40 events per session type (must be ≥ `matrixSize²` to fill a card) |
| Shuffle | Random selection of `matrixSize² - 1` events from the pool, randomly placed on the grid |
| Free space | Center square (`row: ⌊matrixSize/2⌋, col: ⌊matrixSize/2⌋`) is always a free space, pre-marked |
| Uniqueness | Each player gets an independently shuffled card; duplicate events across players are expected and intended |
| Editing | Players can edit any non-free-space square text during lobby (F3). Editing clears the `EventKey`, making it a custom square. |

---

## REST Endpoints

### `POST /api/v1/rooms`

Creates a new room. The caller becomes the host.

**Request:**

```json
{
  "hostDisplayName": "string",
  "season": 2026,
  "grandPrixName": "string",
  "sessionType": "Race",
  "matrixSize": 5,
  "winningPatterns": ["Row", "Column", "Diagonal"]
}
```

| Field | Type | Required | Default | Constraints |
|---|---|---|---|---|
| `hostDisplayName` | string | yes | — | Non-empty, max 50 chars |
| `season` | int | yes | — | ≥ 1950 |
| `grandPrixName` | string | yes | — | Non-empty, max 100 chars |
| `sessionType` | SessionType | yes | — | Valid enum value |
| `matrixSize` | int | no | `5` | 3–9, odd |
| `winningPatterns` | WinPatternType[] | no | `["Row","Column","Diagonal"]` | At least one |

**Response (200):**

```json
{
  "roomId": "uuid",
  "joinCode": "ABC123",
  "playerId": "uuid",
  "playerToken": "string"
}
```

**Errors:**

| Code | HTTP | Condition |
|---|---|---|
| `validation_error` | 400 | Invalid input (see `details` array) |

---

### `POST /api/v1/rooms/join`

Joins an existing room by join code.

**Request:**

```json
{
  "joinCode": "ABC123",
  "displayName": "string"
}
```

| Field | Type | Required | Constraints |
|---|---|---|---|
| `joinCode` | string | yes | Non-empty |
| `displayName` | string | yes | Non-empty, max 50 chars |

**Response (200):**

```json
{
  "roomId": "uuid",
  "playerId": "uuid",
  "playerToken": "string",
  "displayName": "string"
}
```

**Errors:**

| Code | HTTP | Condition |
|---|---|---|
| `validation_error` | 400 | Empty fields |
| `room_not_found` | 404 | Join code does not match any room |
| `room_not_in_lobby` | 409 | Room is not in `Lobby` status |
| `display_name_taken` | 409 | Display name already exists in room |

---

### `PUT /api/v1/rooms/{roomId}/players/me/card/squares/{row}/{column}`

Edits a square's display text on the authenticated player's card.

**Auth:** `X-Player-Token` header required.

**Request:**

```json
{
  "displayText": "string"
}
```

| Field | Type | Required | Constraints |
|---|---|---|---|
| `displayText` | string | yes | Non-empty |

**Path parameters:**

| Param | Type | Constraints |
|---|---|---|
| `roomId` | uuid | Must match player's room |
| `row` | int | 0-based, within matrix bounds |
| `column` | int | 0-based, within matrix bounds |

**Response (200):**

```json
{
  "row": 0,
  "column": 0,
  "displayText": "string",
  "eventKey": null
}
```

**Errors:**

| Code | HTTP | Condition |
|---|---|---|
| `unauthorized` | 401 | Missing or invalid player token |
| `room_not_found` | 404 | Room does not exist |
| `square_not_found` | 404 | No square at the given row/column |
| `room_not_in_lobby` | 409 | Room is not in `Lobby` status |
| `square_is_free_space` | 409 | Cannot edit a free space |

---

### `POST /api/v1/rooms/{roomId}/start`

Host starts the game.

**Auth:** `X-Player-Token` header required. Must be the host.

**Request:** Empty body.

**Response (200):**

```json
{
  "roomId": "uuid",
  "status": "Active"
}
```

**Errors:**

| Code | HTTP | Condition |
|---|---|---|
| `unauthorized` | 401 | Missing/invalid token |
| `forbidden` | 403 | Caller is not the host |
| `room_not_found` | 404 | Room does not exist |
| `room_not_in_lobby` | 409 | Room is not in `Lobby` status |
| `players_missing_cards` | 409 | One or more players do not have cards |

---

### `POST /api/v1/rooms/{roomId}/players/{playerId}/card/squares/{row}/{column}/mark`

Marks a square. Player can mark own card; host can mark any player's card.

**Auth:** `X-Player-Token` header required.

**Request:** Empty body.

**Path parameters:**

| Param | Type | Constraints |
|---|---|---|
| `roomId` | uuid | Must match player's room |
| `playerId` | uuid | Self or any player (if host) |
| `row` | int | 0-based, within matrix bounds |
| `column` | int | 0-based, within matrix bounds |

**Response (200):**

```json
{
  "row": 0,
  "column": 0,
  "isMarked": true,
  "markedBy": "Player",
  "markedAt": "2026-03-15T14:30:00+00:00",
  "bingo": null
}
```

When marking triggers a win, `bingo` is populated:

```json
{
  "row": 2,
  "column": 4,
  "isMarked": true,
  "markedBy": "Host",
  "markedAt": "2026-03-15T14:35:00+00:00",
  "bingo": {
    "pattern": "Row",
    "rank": 1
  }
}
```

**Errors:**

| Code | HTTP | Condition |
|---|---|---|
| `unauthorized` | 401 | Missing/invalid token |
| `forbidden` | 403 | Caller is not the player or the host |
| `room_not_found` | 404 | Room does not exist |
| `player_not_found` | 404 | Player does not exist in room |
| `square_not_found` | 404 | No square at the given row/column |
| `room_not_active` | 409 | Room is not in `Active` status |
| `player_already_won` | 409 | Player has already won |
| `square_already_marked` | 409 | Square is already marked |
| `square_is_free_space` | 409 | Cannot mark a free space |

---

### `POST /api/v1/rooms/{roomId}/players/{playerId}/card/squares/{row}/{column}/unmark`

Unmarks a square. Player can unmark own card; host can unmark any player's card.

**Auth:** `X-Player-Token` header required.

**Request:** Empty body.

**Path parameters:** Same as mark endpoint.

**Response (200):**

```json
{
  "row": 0,
  "column": 0,
  "isMarked": false,
  "markedBy": null,
  "markedAt": null,
  "winRevoked": false
}
```

When unmarking revokes a win:

```json
{
  "row": 2,
  "column": 4,
  "isMarked": false,
  "markedBy": null,
  "markedAt": null,
  "winRevoked": true
}
```

**Errors:**

| Code | HTTP | Condition |
|---|---|---|
| `unauthorized` | 401 | Missing/invalid token |
| `forbidden` | 403 | Caller is not the player or the host |
| `room_not_found` | 404 | Room does not exist |
| `player_not_found` | 404 | Player does not exist in room |
| `square_not_found` | 404 | No square at the given row/column |
| `room_not_active` | 409 | Room is not in `Active` status |
| `square_not_marked` | 409 | Square is not marked |
| `square_is_free_space` | 409 | Cannot unmark a free space |

---

### `POST /api/v1/rooms/{roomId}/end`

Host ends the game.

**Auth:** `X-Player-Token` header required. Must be the host.

**Request:** Empty body.

**Response (200):**

```json
{
  "roomId": "uuid",
  "status": "Completed"
}
```

**Errors:**

| Code | HTTP | Condition |
|---|---|---|
| `unauthorized` | 401 | Missing/invalid token |
| `forbidden` | 403 | Caller is not the host |
| `room_not_found` | 404 | Room does not exist |
| `room_not_active` | 409 | Room is not in `Active` status |

---

### `GET /api/v1/rooms/{roomId}`

Returns full room state. Used for initial load and reconnection.

**Auth:** `X-Player-Token` header required.

**Response (200):**

```json
{
  "roomId": "uuid",
  "joinCode": "ABC123",
  "status": "Active",
  "session": {
    "season": 2026,
    "grandPrixName": "Bahrain Grand Prix",
    "sessionType": "Race"
  },
  "configuration": {
    "matrixSize": 5,
    "winningPatterns": ["Row", "Column", "Diagonal"]
  },
  "hostPlayerId": "uuid",
  "players": [
    {
      "playerId": "uuid",
      "displayName": "string",
      "hasWon": false,
      "card": {
        "matrixSize": 5,
        "squares": [
          {
            "row": 0,
            "column": 0,
            "displayText": "Safety Car",
            "eventKey": "SAFETY_CAR",
            "isFreeSpace": false,
            "isMarked": false,
            "markedBy": null,
            "markedAt": null
          }
        ]
      }
    }
  ],
  "leaderboard": [
    {
      "playerId": "uuid",
      "rank": 1,
      "winningPattern": "Row",
      "completedAt": "2026-03-15T14:35:00+00:00"
    }
  ]
}
```

**Errors:**

| Code | HTTP | Condition |
|---|---|---|
| `unauthorized` | 401 | Missing/invalid token |
| `forbidden` | 403 | Player does not belong to this room |
| `room_not_found` | 404 | Room does not exist |

---

### `POST /api/v1/rooms/reconnect`

Reconnects a player using their stored token. Returns the room ID so the client can fetch state and re-establish the WebSocket connection.

**Auth:** `X-Player-Token` header required.

**Request:** Empty body.

**Response (200):**

```json
{
  "roomId": "uuid",
  "playerId": "uuid",
  "roomStatus": "Active"
}
```

**Errors:**

| Code | HTTP | Condition |
|---|---|---|
| `unauthorized` | 401 | Missing or invalid token |
| `room_not_found` | 404 | Player's room no longer exists |

---

## WebSocket Events

### Connection

| Attribute | Value |
|---|---|
| Hub URL | `/hubs/game` |
| Transport | SignalR (WebSocket primary, LongPolling fallback) |
| Auth | `PlayerToken` cookie (set by server on create/join, sent automatically by browser on handshake) |
| Group | One SignalR group per room (`room:{roomId}`) |

The client connects after creating or joining a room (or reconnecting). The `PlayerToken` cookie is sent automatically by the browser on the SignalR HTTP handshake — no client-side token handling is needed for the WebSocket connection. The server reads the cookie, resolves the player identity, and adds the connection to the room's SignalR group. All events below are broadcast to the group.

### Event: `PlayerJoined`

Fired when a new player joins the room.

```json
{
  "playerId": "uuid",
  "displayName": "string"
}
```

### Event: `GameStarted`

Fired when the host starts the game.

```json
{
  "roomId": "uuid"
}
```

### Event: `SquareMarked`

Fired when any player's square is marked.

```json
{
  "playerId": "uuid",
  "row": 0,
  "column": 0,
  "markedBy": "Player"
}
```

### Event: `SquareUnmarked`

Fired when any player's square is unmarked.

```json
{
  "playerId": "uuid",
  "row": 0,
  "column": 0
}
```

### Event: `BingoAchieved`

Fired when a player completes a winning pattern.

```json
{
  "playerId": "uuid",
  "pattern": "Row",
  "rank": 1
}
```

### Event: `GameCompleted`

Fired when the host ends the game.

```json
{
  "roomId": "uuid"
}
```

---

## Endpoint-to-Feature Map

| Feature | Endpoint | Method |
|---|---|---|
| F1: Create Room | `/api/v1/rooms` | `POST` |
| F2: Join Room | `/api/v1/rooms/join` | `POST` |
| F3: Edit Square | `/api/v1/rooms/{roomId}/players/me/card/squares/{row}/{column}` | `PUT` |
| F4: Start Game | `/api/v1/rooms/{roomId}/start` | `POST` |
| F5: Mark Square | `/api/v1/rooms/{roomId}/players/{playerId}/card/squares/{row}/{column}/mark` | `POST` |
| F6: Unmark Square | `/api/v1/rooms/{roomId}/players/{playerId}/card/squares/{row}/{column}/unmark` | `POST` |
| F7: End Game | `/api/v1/rooms/{roomId}/end` | `POST` |
| F8: Get Room State | `/api/v1/rooms/{roomId}` | `GET` |
| F9: Reconnect | `/api/v1/rooms/reconnect` | `POST` |

## Endpoint-to-WebSocket Event Map

| Endpoint | WebSocket Events Broadcast |
|---|---|
| `POST /rooms` | — (host connects after, no event needed) |
| `POST /rooms/join` | `PlayerJoined` |
| `PUT .../squares/{row}/{column}` | — (lobby only, no real-time needed) |
| `POST /rooms/{roomId}/start` | `GameStarted` |
| `POST .../mark` | `SquareMarked`, optionally `BingoAchieved` |
| `POST .../unmark` | `SquareUnmarked` |
| `POST /rooms/{roomId}/end` | `GameCompleted` |

