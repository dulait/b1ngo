---
title: OpenAPI 3.1 Compliance Specification
version: "1.0.0"
status: draft
date: 2026-03-17
authors:
  - Business Analyst
reviewers: []
changelog:
  - version: "1.0.0"
    date: 2026-03-17
    description: Initial specification — full endpoint coverage, error catalog, schema definitions, compliance checklist
---

# OpenAPI 3.1 Compliance Specification

This document defines exactly what the B1ngo API's OpenAPI 3.1 documentation must contain. Every field, schema, example, and error code specified here is mandatory. The BE implements against this spec; we audit against it before publishing.

---

## 1. API Metadata

The `info` object must contain exactly the following:

| Field | Value |
|---|---|
| `info.title` | `B1ngo API` |
| `info.version` | `1.0.0` |
| `info.description` | `B1ngo is a multiplayer F1 bingo game API. Players create or join rooms tied to specific Formula 1 sessions, receive randomized bingo cards populated with real F1 events, and mark squares as events occur during the session. The API manages room lifecycle, card generation, square marking with automatic win detection, and a ranked leaderboard.` |
| `info.contact.name` | `B1ngo Team` |
| `info.contact.email` | `support@b1ngo.dev` |
| `info.license.name` | `MIT` |
| `info.license.identifier` | `MIT` |

### Servers

| Environment | URL | Description |
|---|---|---|
| Development | `http://localhost:5000` | Local development server |
| Production | `https://api.b1ngo.dev` | Production server |

Both servers must be listed in the `servers` array. Development first.

---

## 2. Authentication Scheme

A single security scheme must be defined:

```yaml
securitySchemes:
  playerToken:
    type: apiKey
    in: header
    name: X-Player-Token
    description: >
      Opaque GUID token returned by the Create Room and Join Room endpoints.
      The client stores this token and sends it as the X-Player-Token header
      on all subsequent requests. The server resolves the token to a player
      identity (player ID, room ID, host flag). Tokens live as long as the
      room exists. If the token is lost, the player must re-join as a new
      player.
```

### Authentication Flow

The OpenAPI description must document this flow:

1. Client calls `POST /api/v1/rooms` (Create Room) or `POST /api/v1/rooms/join` (Join Room) — no auth required.
2. Server returns `playerToken` in the response body and sets a `PlayerToken` `HttpOnly` cookie (used only for SignalR WebSocket handshake).
3. Client stores the token and includes it as the `X-Player-Token` header on all subsequent REST requests.
4. Server resolves the token to a `PlayerIdentity` containing `playerId`, `roomId`, and `isHost`.

### Security Requirement by Endpoint

| Endpoint | Security |
|---|---|
| `POST /api/v1/rooms` | None |
| `POST /api/v1/rooms/join` | None |
| `POST /api/v1/rooms/reconnect` | `playerToken` |
| `POST /api/v1/rooms/{roomId}/start` | `playerToken` |
| `POST /api/v1/rooms/{roomId}/end` | `playerToken` |
| `GET /api/v1/rooms/{roomId}` | `playerToken` |
| `PUT /api/v1/rooms/{roomId}/players/me/card/squares/{row}/{column}` | `playerToken` |
| `POST /api/v1/rooms/{roomId}/players/{playerId}/card/squares/{row}/{column}/mark` | `playerToken` |
| `POST /api/v1/rooms/{roomId}/players/{playerId}/card/squares/{row}/{column}/unmark` | `playerToken` |

Endpoints with no security must have `security: []` to override any global security.

---

## 3. Per-Endpoint Specifications

Every endpoint must include all of the following fields: `operationId`, `summary`, `description`, `tags`, `parameters` (if applicable), `requestBody` (if applicable), `responses`, and `security`.

### 3.1 Create Room

| Field | Value |
|---|---|
| **Path** | `POST /api/v1/rooms` |
| **operationId** | `CreateRoom` |
| **summary** | `Create a new room` |
| **description** | `Creates a new bingo room with the caller as host. The room is tied to a specific F1 session (season, Grand Prix, session type). The host receives a join code to share with other players and a player token for session identity. A bingo card is automatically generated and assigned to the host from the predefined event pool for the selected session type. The server also sets a PlayerToken HttpOnly cookie for SignalR connectivity.` |
| **tags** | `["Rooms"]` |
| **security** | `[]` (none) |

#### Request Body

Schema: `CreateRoomRequest`

```json
{
  "hostDisplayName": "Max",
  "season": 2026,
  "grandPrixName": "Bahrain Grand Prix",
  "sessionType": "Race",
  "matrixSize": 5,
  "winningPatterns": ["Row", "Column", "Diagonal"]
}
```

| Property | Type | Required | Description | Constraints | Example |
|---|---|---|---|---|---|
| `hostDisplayName` | string | yes | Display name of the player creating the room. Must be unique within the room. | Non-empty | `"Max"` |
| `season` | integer | yes | The F1 season year for this room's session. | >= 1950 | `2026` |
| `grandPrixName` | string | yes | Name of the Grand Prix event. | Non-empty | `"Bahrain Grand Prix"` |
| `sessionType` | string (enum) | yes | Type of F1 session. Must be a valid `SessionType` enum value. | One of: `FP1`, `FP2`, `FP3`, `Qualifying`, `SprintQualifying`, `Sprint`, `Race` | `"Race"` |
| `matrixSize` | integer | no | Size of the bingo card grid. Defaults to 5 if omitted. | 3–9, must be odd | `5` |
| `winningPatterns` | array of string (enum) | no | Active win patterns. Defaults to `["Row", "Column", "Diagonal"]` if omitted. | Non-empty array when provided. Each value must be a valid `WinPatternType`. | `["Row", "Column", "Diagonal"]` |

#### Responses

**200 OK**

Schema: `CreateRoomResponse`

```json
{
  "roomId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "joinCode": "BHR26R",
  "playerId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "playerToken": "550e8400-e29b-41d4-a716-446655440000"
}
```

| Property | Type | Nullable | Description |
|---|---|---|---|
| `roomId` | string (uuid) | no | Unique identifier for the created room |
| `joinCode` | string | no | 6-character alphanumeric code for other players to join (no ambiguous characters: `0`, `O`, `I`, `1` excluded) |
| `playerId` | string (uuid) | no | Unique identifier for the host player |
| `playerToken` | string (uuid) | no | Opaque token for authenticating subsequent requests |

**400 Bad Request**

Returned when request body validation fails.

Schema: `ErrorResponse`

```json
{
  "code": "validation_error",
  "message": "One or more validation errors occurred.",
  "details": [
    "HostDisplayName: Host display name is required.",
    "GrandPrixName: Grand Prix name is required."
  ]
}
```

#### Error Codes

| Code | HTTP Status | Condition |
|---|---|---|
| `validation_error` | 400 | One or more fields fail validation (see details array) |

#### Validation Rules (for `details` array)

| Rule | Message |
|---|---|
| `hostDisplayName` empty | `HostDisplayName: Host display name is required.` |
| `grandPrixName` empty | `GrandPrixName: Grand Prix name is required.` |
| `matrixSize` not between 3–9 (when provided) | `MatrixSize: Matrix size must be between 3 and 9.` |
| `matrixSize` is even (when provided) | `MatrixSize: Matrix size must be odd to have a center free space.` |
| `winningPatterns` empty array (when provided) | `WinningPatterns: At least one winning pattern is required.` |

---

### 3.2 Join Room

| Field | Value |
|---|---|
| **Path** | `POST /api/v1/rooms/join` |
| **operationId** | `JoinRoom` |
| **summary** | `Join an existing room` |
| **description** | `Joins a room using a join code. The room must be in Lobby status. The player's display name must be unique within the room. Returns player identity and a player token for session authentication. A bingo card is automatically generated and assigned from the predefined event pool for the room's session type. The server also sets a PlayerToken HttpOnly cookie for SignalR connectivity.` |
| **tags** | `["Rooms"]` |
| **security** | `[]` (none) |

#### Request Body

Schema: `JoinRoomRequest`

```json
{
  "joinCode": "BHR26R",
  "displayName": "Lewis"
}
```

| Property | Type | Required | Description | Constraints | Example |
|---|---|---|---|---|---|
| `joinCode` | string | yes | The 6-character code shared by the room host. | Non-empty | `"BHR26R"` |
| `displayName` | string | yes | Display name for the joining player. Must be unique within the room (case-insensitive). | Non-empty | `"Lewis"` |

#### Responses

**200 OK**

Schema: `JoinRoomResponse`

```json
{
  "roomId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "playerId": "c9d0e1f2-a3b4-5678-cdef-901234567890",
  "playerToken": "661f9511-f3ac-52e5-b827-557766551111",
  "displayName": "Lewis"
}
```

| Property | Type | Nullable | Description |
|---|---|---|---|
| `roomId` | string (uuid) | no | Unique identifier for the joined room |
| `playerId` | string (uuid) | no | Unique identifier for the new player |
| `playerToken` | string (uuid) | no | Opaque token for authenticating subsequent requests |
| `displayName` | string | no | The player's confirmed display name |

**400 Bad Request**

```json
{
  "code": "validation_error",
  "message": "One or more validation errors occurred.",
  "details": [
    "JoinCode: Join code is required."
  ]
}
```

**404 Not Found**

```json
{
  "code": "room_not_found",
  "message": "room with ID 'BHR26R' was not found."
}
```

**409 Conflict** — Room not in lobby

```json
{
  "code": "room_not_in_lobby",
  "message": "Cannot add players — room is in 'Active' state, expected 'Lobby'."
}
```

**409 Conflict** — Display name taken

```json
{
  "code": "display_name_taken",
  "message": "A player with display name 'Max' already exists in this room."
}
```

#### Error Codes

| Code | HTTP Status | Condition |
|---|---|---|
| `validation_error` | 400 | Empty `joinCode` or `displayName` |
| `room_not_found` | 404 | No room matches the provided join code |
| `room_not_in_lobby` | 409 | Room has already started or completed |
| `display_name_taken` | 409 | Another player in the room has the same display name (case-insensitive) |

#### Validation Rules

| Rule | Message |
|---|---|
| `joinCode` empty | `JoinCode: Join code is required.` |
| `displayName` empty | `DisplayName: Display name is required.` |

---

### 3.3 Reconnect

| Field | Value |
|---|---|
| **Path** | `POST /api/v1/rooms/reconnect` |
| **operationId** | `Reconnect` |
| **summary** | `Reconnect to a room` |
| **description** | `Re-establishes a player's session with a room using the X-Player-Token header. Use this when a player returns to the app after closing it. Returns the room ID, player ID, and current room status so the client can fetch full state and re-establish the WebSocket connection.` |
| **tags** | `["Rooms"]` |
| **security** | `[{ "playerToken": [] }]` |

#### Parameters

None. The player identity is resolved from the `X-Player-Token` header.

#### Request Body

None.

#### Responses

**200 OK**

Schema: `ReconnectResponse`

```json
{
  "roomId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "playerId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "roomStatus": "Active"
}
```

| Property | Type | Nullable | Description |
|---|---|---|---|
| `roomId` | string (uuid) | no | Unique identifier for the player's room |
| `playerId` | string (uuid) | no | Unique identifier for the reconnecting player |
| `roomStatus` | string (enum) | no | Current room status: `Lobby`, `Active`, or `Completed` |

**401 Unauthorized**

```json
{
  "code": "unauthorized",
  "message": "Missing or invalid player token."
}
```

**404 Not Found**

```json
{
  "code": "room_not_found",
  "message": "room with ID 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' was not found."
}
```

#### Error Codes

| Code | HTTP Status | Condition |
|---|---|---|
| `unauthorized` | 401 | `X-Player-Token` header missing, not a valid GUID, or token not found in storage |
| `room_not_found` | 404 | The room associated with the token no longer exists |

---

### 3.4 Start Game

| Field | Value |
|---|---|
| **Path** | `POST /api/v1/rooms/{roomId}/start` |
| **operationId** | `StartGame` |
| **summary** | `Start the game` |
| **description** | `Transitions the room from Lobby to Active status. Only the host can start the game. All players must have bingo cards assigned before starting. Once started, players can mark and unmark squares, and win detection becomes active.` |
| **tags** | `["Rooms"]` |
| **security** | `[{ "playerToken": [] }]` |

#### Parameters

| Name | In | Type | Required | Description | Example |
|---|---|---|---|---|---|
| `roomId` | path | string (uuid) | yes | Unique identifier of the room to start | `"a1b2c3d4-e5f6-7890-abcd-ef1234567890"` |

#### Request Body

None.

#### Responses

**200 OK**

Schema: `StartGameResponse`

```json
{
  "roomId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "status": "Active"
}
```

| Property | Type | Nullable | Description |
|---|---|---|---|
| `roomId` | string (uuid) | no | Unique identifier of the started room |
| `status` | string (enum) | no | New room status, always `Active` |

**401 Unauthorized**

```json
{
  "code": "unauthorized",
  "message": "Missing or invalid player token."
}
```

**403 Forbidden**

```json
{
  "code": "forbidden",
  "message": "You do not have permission to perform this action."
}
```

**404 Not Found**

```json
{
  "code": "room_not_found",
  "message": "room with ID 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' was not found."
}
```

**409 Conflict** — Wrong status

```json
{
  "code": "room_not_in_lobby",
  "message": "Cannot start the game — room is in 'Active' state, expected 'Lobby'."
}
```

**409 Conflict** — Players missing cards

```json
{
  "code": "players_missing_cards",
  "message": "Player 'Charles' does not have a card assigned. All players must have cards before starting."
}
```

#### Error Codes

| Code | HTTP Status | Condition |
|---|---|---|
| `unauthorized` | 401 | Missing or invalid player token |
| `forbidden` | 403 | Caller is not the host, or `roomId` does not match the token's room |
| `room_not_found` | 404 | Room does not exist |
| `room_not_in_lobby` | 409 | Room is not in `Lobby` status |
| `players_missing_cards` | 409 | One or more players do not have bingo cards assigned |

---

### 3.5 End Game

| Field | Value |
|---|---|
| **Path** | `POST /api/v1/rooms/{roomId}/end` |
| **operationId** | `EndGame` |
| **summary** | `End the game` |
| **description** | `Transitions the room from Active to Completed status. Only the host can end the game. Once ended, the room becomes read-only — no further square marking or unmarking is allowed. The leaderboard is finalized.` |
| **tags** | `["Rooms"]` |
| **security** | `[{ "playerToken": [] }]` |

#### Parameters

| Name | In | Type | Required | Description | Example |
|---|---|---|---|---|---|
| `roomId` | path | string (uuid) | yes | Unique identifier of the room to end | `"a1b2c3d4-e5f6-7890-abcd-ef1234567890"` |

#### Request Body

None.

#### Responses

**200 OK**

Schema: `EndGameResponse`

```json
{
  "roomId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "status": "Completed"
}
```

| Property | Type | Nullable | Description |
|---|---|---|---|
| `roomId` | string (uuid) | no | Unique identifier of the ended room |
| `status` | string (enum) | no | New room status, always `Completed` |

**401 Unauthorized**

```json
{
  "code": "unauthorized",
  "message": "Missing or invalid player token."
}
```

**403 Forbidden**

```json
{
  "code": "forbidden",
  "message": "You do not have permission to perform this action."
}
```

**404 Not Found**

```json
{
  "code": "room_not_found",
  "message": "room with ID 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' was not found."
}
```

**409 Conflict**

```json
{
  "code": "room_not_active",
  "message": "Cannot end the game — room is in 'Lobby' state, expected 'Active'."
}
```

#### Error Codes

| Code | HTTP Status | Condition |
|---|---|---|
| `unauthorized` | 401 | Missing or invalid player token |
| `forbidden` | 403 | Caller is not the host, or `roomId` does not match the token's room |
| `room_not_found` | 404 | Room does not exist |
| `room_not_active` | 409 | Room is not in `Active` status |

---

### 3.6 Get Room State

| Field | Value |
|---|---|
| **Path** | `GET /api/v1/rooms/{roomId}` |
| **operationId** | `GetRoomState` |
| **summary** | `Get full room state` |
| **description** | `Returns the complete room state including session info, configuration, all players with their bingo cards, and the leaderboard. Use this for initial page load after joining or reconnecting. The caller must be a member of the room (enforced by token-to-room matching).` |
| **tags** | `["Rooms"]` |
| **security** | `[{ "playerToken": [] }]` |

#### Parameters

| Name | In | Type | Required | Description | Example |
|---|---|---|---|---|---|
| `roomId` | path | string (uuid) | yes | Unique identifier of the room to retrieve | `"a1b2c3d4-e5f6-7890-abcd-ef1234567890"` |

#### Request Body

None.

#### Responses

**200 OK**

Schema: `GetRoomStateResponse`

```json
{
  "roomId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "joinCode": "BHR26R",
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
  "hostPlayerId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "players": [
    {
      "playerId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
      "displayName": "Max",
      "hasWon": false,
      "card": {
        "matrixSize": 5,
        "squares": [
          {
            "row": 0,
            "column": 0,
            "displayText": "Safety Car deployed",
            "eventKey": "SAFETY_CAR",
            "isFreeSpace": false,
            "isMarked": true,
            "markedBy": "Player",
            "markedAt": "2026-03-17T14:30:00+00:00"
          },
          {
            "row": 0,
            "column": 1,
            "displayText": "Red flag",
            "eventKey": "RED_FLAG",
            "isFreeSpace": false,
            "isMarked": false,
            "markedBy": null,
            "markedAt": null
          },
          {
            "row": 2,
            "column": 2,
            "displayText": "FREE",
            "eventKey": null,
            "isFreeSpace": true,
            "isMarked": true,
            "markedBy": null,
            "markedAt": null
          }
        ]
      }
    },
    {
      "playerId": "c9d0e1f2-a3b4-5678-cdef-901234567890",
      "displayName": "Lewis",
      "hasWon": true,
      "card": {
        "matrixSize": 5,
        "squares": []
      }
    }
  ],
  "leaderboard": [
    {
      "playerId": "c9d0e1f2-a3b4-5678-cdef-901234567890",
      "rank": 1,
      "winningPattern": "Row",
      "completedAt": "2026-03-17T14:35:00+00:00"
    }
  ]
}
```

(See Section 4 for full schema definitions of all nested objects.)

**401 Unauthorized**

```json
{
  "code": "unauthorized",
  "message": "Missing or invalid player token."
}
```

**403 Forbidden**

```json
{
  "code": "forbidden",
  "message": "You do not have permission to perform this action."
}
```

**404 Not Found**

```json
{
  "code": "room_not_found",
  "message": "room with ID 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' was not found."
}
```

#### Error Codes

| Code | HTTP Status | Condition |
|---|---|---|
| `unauthorized` | 401 | Missing or invalid player token |
| `forbidden` | 403 | Token's `roomId` does not match the path `roomId` |
| `room_not_found` | 404 | Room does not exist |

---

### 3.7 Edit Square

| Field | Value |
|---|---|
| **Path** | `PUT /api/v1/rooms/{roomId}/players/me/card/squares/{row}/{column}` |
| **operationId** | `EditSquare` |
| **summary** | `Edit a bingo square` |
| **description** | `Updates the display text of a square on the caller's bingo card. Only available during the Lobby phase. Cannot edit free spaces. Editing a predefined square clears its eventKey, making it a custom square that can no longer be auto-marked by the event feed. The player identity is resolved from the X-Player-Token header.` |
| **tags** | `["Rooms"]` |
| **security** | `[{ "playerToken": [] }]` |

#### Parameters

| Name | In | Type | Required | Description | Example |
|---|---|---|---|---|---|
| `roomId` | path | string (uuid) | yes | Unique identifier of the room | `"a1b2c3d4-e5f6-7890-abcd-ef1234567890"` |
| `row` | path | integer | yes | Zero-based row index of the square | `1` |
| `column` | path | integer | yes | Zero-based column index of the square | `3` |

#### Request Body

Schema: `EditSquareRequest`

```json
{
  "displayText": "Verstappen leads lap 1"
}
```

| Property | Type | Required | Description | Constraints | Example |
|---|---|---|---|---|---|
| `displayText` | string | yes | New display text for the square. | Non-empty | `"Verstappen leads lap 1"` |

#### Responses

**200 OK**

Schema: `EditSquareResponse`

```json
{
  "row": 1,
  "column": 3,
  "displayText": "Verstappen leads lap 1",
  "eventKey": null
}
```

| Property | Type | Nullable | Description |
|---|---|---|---|
| `row` | integer | no | Zero-based row index of the edited square |
| `column` | integer | no | Zero-based column index of the edited square |
| `displayText` | string | no | Updated display text |
| `eventKey` | string | yes | Event key for the square. Always `null` after editing (cleared on edit). |

**400 Bad Request**

```json
{
  "code": "validation_error",
  "message": "One or more validation errors occurred.",
  "details": [
    "DisplayText: Display text is required."
  ]
}
```

**401 Unauthorized**

```json
{
  "code": "unauthorized",
  "message": "Missing or invalid player token."
}
```

**403 Forbidden**

```json
{
  "code": "forbidden",
  "message": "You do not have permission to perform this action."
}
```

**404 Not Found** — Room

```json
{
  "code": "room_not_found",
  "message": "room with ID 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' was not found."
}
```

**404 Not Found** — Square

```json
{
  "code": "square_not_found",
  "message": "No square at position (1, 3)."
}
```

**409 Conflict** — Wrong status

```json
{
  "code": "room_not_in_lobby",
  "message": "Cannot edit squares — room is in 'Active' state, expected 'Lobby'."
}
```

**409 Conflict** — Free space

```json
{
  "code": "square_is_free_space",
  "message": "Cannot edit a free space."
}
```

**409 Conflict** — Card not assigned

```json
{
  "code": "card_not_assigned",
  "message": "Player does not have a card assigned."
}
```

#### Error Codes

| Code | HTTP Status | Condition |
|---|---|---|
| `validation_error` | 400 | `displayText` is empty; `row` < 0; `column` < 0 |
| `unauthorized` | 401 | Missing or invalid player token |
| `forbidden` | 403 | Token's `roomId` does not match the path `roomId` |
| `room_not_found` | 404 | Room does not exist |
| `player_not_found` | 404 | Player (from token) does not exist in the room |
| `square_not_found` | 404 | No square at the given row/column position |
| `room_not_in_lobby` | 409 | Room is not in `Lobby` status |
| `square_is_free_space` | 409 | Target square is the center free space |
| `card_not_assigned` | 409 | Player does not have a bingo card assigned |

#### Validation Rules

| Rule | Message |
|---|---|
| `displayText` empty | `DisplayText: Display text is required.` |
| `row` < 0 | `Row: Row must be greater than or equal to 0.` |
| `column` < 0 | `Column: Column must be greater than or equal to 0.` |

---

### 3.8 Mark Square

| Field | Value |
|---|---|
| **Path** | `POST /api/v1/rooms/{roomId}/players/{playerId}/card/squares/{row}/{column}/mark` |
| **operationId** | `MarkSquare` |
| **summary** | `Mark a bingo square` |
| **description** | `Marks a square on a player's bingo card and automatically evaluates win conditions. A player can mark squares on their own card; the host can mark squares on any player's card. The markedBy field in the response indicates who performed the mark (Player or Host). If marking completes a winning pattern, the response includes bingo info with the winning pattern and rank on the leaderboard.` |
| **tags** | `["Rooms"]` |
| **security** | `[{ "playerToken": [] }]` |

#### Parameters

| Name | In | Type | Required | Description | Example |
|---|---|---|---|---|---|
| `roomId` | path | string (uuid) | yes | Unique identifier of the room | `"a1b2c3d4-e5f6-7890-abcd-ef1234567890"` |
| `playerId` | path | string (uuid) | yes | Unique identifier of the player whose square is being marked | `"f47ac10b-58cc-4372-a567-0e02b2c3d479"` |
| `row` | path | integer | yes | Zero-based row index of the square | `0` |
| `column` | path | integer | yes | Zero-based column index of the square | `4` |

#### Request Body

None.

#### Responses

**200 OK** — No bingo

Schema: `MarkSquareResponse`

```json
{
  "row": 0,
  "column": 4,
  "isMarked": true,
  "markedBy": "Player",
  "markedAt": "2026-03-17T14:30:00+00:00",
  "bingo": null
}
```

**200 OK** — Bingo achieved

```json
{
  "row": 0,
  "column": 4,
  "isMarked": true,
  "markedBy": "Host",
  "markedAt": "2026-03-17T14:35:00+00:00",
  "bingo": {
    "pattern": "Row",
    "rank": 1
  }
}
```

| Property | Type | Nullable | Description |
|---|---|---|---|
| `row` | integer | no | Zero-based row index of the marked square |
| `column` | integer | no | Zero-based column index of the marked square |
| `isMarked` | boolean | no | Always `true` after a successful mark |
| `markedBy` | string (enum) | no | Who marked the square: `Player` or `Host` |
| `markedAt` | string (date-time) | no | ISO 8601 timestamp of when the square was marked |
| `bingo` | object | yes | Non-null if marking completed a winning pattern |
| `bingo.pattern` | string (enum) | no | The winning pattern: `Row`, `Column`, `Diagonal`, or `Blackout` |
| `bingo.rank` | integer | no | Player's rank on the leaderboard (1 = first to win) |

**401 Unauthorized**

```json
{
  "code": "unauthorized",
  "message": "Missing or invalid player token."
}
```

**403 Forbidden**

```json
{
  "code": "forbidden",
  "message": "You do not have permission to perform this action."
}
```

**404 Not Found** — Room

```json
{
  "code": "room_not_found",
  "message": "room with ID 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' was not found."
}
```

**404 Not Found** — Player

```json
{
  "code": "player_not_found",
  "message": "Player with ID 'f47ac10b-58cc-4372-a567-0e02b2c3d479' not found in this room."
}
```

**404 Not Found** — Square

```json
{
  "code": "square_not_found",
  "message": "No square at position (0, 4)."
}
```

**409 Conflict** — Wrong status

```json
{
  "code": "room_not_active",
  "message": "Cannot mark squares — room is in 'Lobby' state, expected 'Active'."
}
```

**409 Conflict** — Player already won

```json
{
  "code": "player_already_won",
  "message": "Cannot mark squares — player has already won."
}
```

**409 Conflict** — Already marked

```json
{
  "code": "square_already_marked",
  "message": "Square is already marked."
}
```

**409 Conflict** — Free space

```json
{
  "code": "square_is_free_space",
  "message": "Cannot mark a free space — it is always marked."
}
```

**409 Conflict** — Card not assigned

```json
{
  "code": "card_not_assigned",
  "message": "Player does not have a card assigned."
}
```

#### Error Codes

| Code | HTTP Status | Condition |
|---|---|---|
| `unauthorized` | 401 | Missing or invalid player token |
| `forbidden` | 403 | Caller is neither the target player nor the host; or `roomId` mismatch |
| `room_not_found` | 404 | Room does not exist |
| `player_not_found` | 404 | Player does not exist in the room |
| `square_not_found` | 404 | No square at the given row/column position |
| `room_not_active` | 409 | Room is not in `Active` status |
| `player_already_won` | 409 | Player has already achieved bingo |
| `card_not_assigned` | 409 | Player does not have a bingo card assigned |
| `square_already_marked` | 409 | Square is already marked |
| `square_is_free_space` | 409 | Target square is the center free space |

---

### 3.9 Unmark Square

| Field | Value |
|---|---|
| **Path** | `POST /api/v1/rooms/{roomId}/players/{playerId}/card/squares/{row}/{column}/unmark` |
| **operationId** | `UnmarkSquare` |
| **summary** | `Unmark a bingo square` |
| **description** | `Unmarks a previously marked square on a player's bingo card and re-evaluates win status. A player can unmark squares on their own card; the host can unmark squares on any player's card. If the player had previously won and unmarking breaks the winning pattern, the win is revoked, the player is removed from the leaderboard, and remaining ranks are recalculated.` |
| **tags** | `["Rooms"]` |
| **security** | `[{ "playerToken": [] }]` |

#### Parameters

| Name | In | Type | Required | Description | Example |
|---|---|---|---|---|---|
| `roomId` | path | string (uuid) | yes | Unique identifier of the room | `"a1b2c3d4-e5f6-7890-abcd-ef1234567890"` |
| `playerId` | path | string (uuid) | yes | Unique identifier of the player whose square is being unmarked | `"f47ac10b-58cc-4372-a567-0e02b2c3d479"` |
| `row` | path | integer | yes | Zero-based row index of the square | `0` |
| `column` | path | integer | yes | Zero-based column index of the square | `4` |

#### Request Body

None.

#### Responses

**200 OK** — No win revoked

Schema: `UnmarkSquareResponse`

```json
{
  "row": 0,
  "column": 4,
  "isMarked": false,
  "markedBy": null,
  "markedAt": null,
  "winRevoked": false
}
```

**200 OK** — Win revoked

```json
{
  "row": 0,
  "column": 4,
  "isMarked": false,
  "markedBy": null,
  "markedAt": null,
  "winRevoked": true
}
```

| Property | Type | Nullable | Description |
|---|---|---|---|
| `row` | integer | no | Zero-based row index of the unmarked square |
| `column` | integer | no | Zero-based column index of the unmarked square |
| `isMarked` | boolean | no | Always `false` after a successful unmark |
| `markedBy` | string (enum) | yes | Always `null` after unmarking |
| `markedAt` | string (date-time) | yes | Always `null` after unmarking |
| `winRevoked` | boolean | no | `true` if the player previously had a win and it was revoked by this unmark |

**401 Unauthorized**

```json
{
  "code": "unauthorized",
  "message": "Missing or invalid player token."
}
```

**403 Forbidden**

```json
{
  "code": "forbidden",
  "message": "You do not have permission to perform this action."
}
```

**404 Not Found** — Room

```json
{
  "code": "room_not_found",
  "message": "room with ID 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' was not found."
}
```

**404 Not Found** — Player

```json
{
  "code": "player_not_found",
  "message": "Player with ID 'f47ac10b-58cc-4372-a567-0e02b2c3d479' not found in this room."
}
```

**404 Not Found** — Square

```json
{
  "code": "square_not_found",
  "message": "No square at position (0, 4)."
}
```

**409 Conflict** — Wrong status

```json
{
  "code": "room_not_active",
  "message": "Cannot unmark squares — room is in 'Lobby' state, expected 'Active'."
}
```

**409 Conflict** — Not marked

```json
{
  "code": "square_not_marked",
  "message": "Square is not marked."
}
```

**409 Conflict** — Free space

```json
{
  "code": "square_is_free_space",
  "message": "Cannot unmark a free space."
}
```

**409 Conflict** — Card not assigned

```json
{
  "code": "card_not_assigned",
  "message": "Player does not have a card assigned."
}
```

#### Error Codes

| Code | HTTP Status | Condition |
|---|---|---|
| `unauthorized` | 401 | Missing or invalid player token |
| `forbidden` | 403 | Caller is neither the target player nor the host; or `roomId` mismatch |
| `room_not_found` | 404 | Room does not exist |
| `player_not_found` | 404 | Player does not exist in the room |
| `square_not_found` | 404 | No square at the given row/column position |
| `room_not_active` | 409 | Room is not in `Active` status |
| `card_not_assigned` | 409 | Player does not have a bingo card assigned |
| `square_not_marked` | 409 | Square is not currently marked |
| `square_is_free_space` | 409 | Target square is the center free space |

---

## 4. Schema Definitions

Every schema below must be defined in `components/schemas` with property descriptions, constraints, and examples.

### 4.1 CreateRoomRequest

| Property | Type | Required | Nullable | Description | Constraints | Example |
|---|---|---|---|---|---|---|
| `hostDisplayName` | string | yes | no | Display name of the player creating the room | Non-empty | `"Max"` |
| `season` | integer | yes | no | F1 season year | >= 1950 | `2026` |
| `grandPrixName` | string | yes | no | Name of the Grand Prix event | Non-empty | `"Bahrain Grand Prix"` |
| `sessionType` | string | yes | no | F1 session type | Enum: `SessionType` | `"Race"` |
| `matrixSize` | integer | no | yes | Bingo card grid size | 3–9, odd only. Default: 5 | `5` |
| `winningPatterns` | array of string | no | yes | Active win patterns | Non-empty array of `WinPatternType`. Default: `["Row", "Column", "Diagonal"]` | `["Row", "Column", "Diagonal"]` |

### 4.2 CreateRoomResponse

| Property | Type | Nullable | Description | Example |
|---|---|---|---|---|
| `roomId` | string (uuid) | no | Unique room identifier | `"a1b2c3d4-e5f6-7890-abcd-ef1234567890"` |
| `joinCode` | string | no | 6-character alphanumeric join code | `"BHR26R"` |
| `playerId` | string (uuid) | no | Unique player identifier for the host | `"f47ac10b-58cc-4372-a567-0e02b2c3d479"` |
| `playerToken` | string (uuid) | no | Opaque authentication token | `"550e8400-e29b-41d4-a716-446655440000"` |

### 4.3 JoinRoomRequest

| Property | Type | Required | Nullable | Description | Constraints | Example |
|---|---|---|---|---|---|---|
| `joinCode` | string | yes | no | Room join code shared by the host | Non-empty | `"BHR26R"` |
| `displayName` | string | yes | no | Display name for the joining player | Non-empty, unique within room (case-insensitive) | `"Lewis"` |

### 4.4 JoinRoomResponse

| Property | Type | Nullable | Description | Example |
|---|---|---|---|---|
| `roomId` | string (uuid) | no | Unique room identifier | `"a1b2c3d4-e5f6-7890-abcd-ef1234567890"` |
| `playerId` | string (uuid) | no | Unique player identifier | `"c9d0e1f2-a3b4-5678-cdef-901234567890"` |
| `playerToken` | string (uuid) | no | Opaque authentication token | `"661f9511-f3ac-52e5-b827-557766551111"` |
| `displayName` | string | no | Confirmed display name | `"Lewis"` |

### 4.5 ReconnectResponse

| Property | Type | Nullable | Description | Example |
|---|---|---|---|---|
| `roomId` | string (uuid) | no | Unique room identifier | `"a1b2c3d4-e5f6-7890-abcd-ef1234567890"` |
| `playerId` | string (uuid) | no | Unique player identifier | `"f47ac10b-58cc-4372-a567-0e02b2c3d479"` |
| `roomStatus` | string | no | Current room status | `"Active"` |

### 4.6 StartGameResponse

| Property | Type | Nullable | Description | Example |
|---|---|---|---|---|
| `roomId` | string (uuid) | no | Unique room identifier | `"a1b2c3d4-e5f6-7890-abcd-ef1234567890"` |
| `status` | string | no | New room status (always `Active`) | `"Active"` |

### 4.7 EndGameResponse

| Property | Type | Nullable | Description | Example |
|---|---|---|---|---|
| `roomId` | string (uuid) | no | Unique room identifier | `"a1b2c3d4-e5f6-7890-abcd-ef1234567890"` |
| `status` | string | no | New room status (always `Completed`) | `"Completed"` |

### 4.8 EditSquareRequest

| Property | Type | Required | Nullable | Description | Constraints | Example |
|---|---|---|---|---|---|---|
| `displayText` | string | yes | no | New display text for the square | Non-empty | `"Verstappen leads lap 1"` |

### 4.9 EditSquareResponse

| Property | Type | Nullable | Description | Example |
|---|---|---|---|---|
| `row` | integer | no | Zero-based row index | `1` |
| `column` | integer | no | Zero-based column index | `3` |
| `displayText` | string | no | Updated display text | `"Verstappen leads lap 1"` |
| `eventKey` | string | yes | Always `null` after editing (cleared on edit) | `null` |

### 4.10 MarkSquareResponse

| Property | Type | Nullable | Description | Example |
|---|---|---|---|---|
| `row` | integer | no | Zero-based row index | `0` |
| `column` | integer | no | Zero-based column index | `4` |
| `isMarked` | boolean | no | Always `true` | `true` |
| `markedBy` | string | no | `Player` or `Host` | `"Player"` |
| `markedAt` | string (date-time) | no | ISO 8601 UTC timestamp | `"2026-03-17T14:30:00+00:00"` |
| `bingo` | BingoInfo | yes | Non-null when marking completes a winning pattern | `null` |

### 4.11 BingoInfo

| Property | Type | Nullable | Description | Example |
|---|---|---|---|---|
| `pattern` | string | no | Winning pattern type | `"Row"` |
| `rank` | integer | no | Leaderboard rank (1 = first to win) | `1` |

### 4.12 UnmarkSquareResponse

| Property | Type | Nullable | Description | Example |
|---|---|---|---|---|
| `row` | integer | no | Zero-based row index | `0` |
| `column` | integer | no | Zero-based column index | `4` |
| `isMarked` | boolean | no | Always `false` | `false` |
| `markedBy` | string | yes | Always `null` after unmarking | `null` |
| `markedAt` | string (date-time) | yes | Always `null` after unmarking | `null` |
| `winRevoked` | boolean | no | Whether a previously achieved win was revoked | `false` |

### 4.13 GetRoomStateResponse

| Property | Type | Nullable | Description | Example |
|---|---|---|---|---|
| `roomId` | string (uuid) | no | Unique room identifier | `"a1b2c3d4-e5f6-7890-abcd-ef1234567890"` |
| `joinCode` | string | no | 6-character join code | `"BHR26R"` |
| `status` | string | no | Current room status | `"Active"` |
| `session` | SessionDto | no | F1 session details | (see below) |
| `configuration` | ConfigurationDto | no | Game configuration | (see below) |
| `hostPlayerId` | string (uuid) | no | Player ID of the host | `"f47ac10b-58cc-4372-a567-0e02b2c3d479"` |
| `players` | array of PlayerDto | no | All players in the room | (see below) |
| `leaderboard` | array of LeaderboardEntryDto | no | Ranked list of winners | (see below) |

### 4.14 SessionDto

| Property | Type | Nullable | Description | Example |
|---|---|---|---|---|
| `season` | integer | no | F1 season year | `2026` |
| `grandPrixName` | string | no | Grand Prix name | `"Bahrain Grand Prix"` |
| `sessionType` | string | no | Session type | `"Race"` |

### 4.15 ConfigurationDto

| Property | Type | Nullable | Description | Example |
|---|---|---|---|---|
| `matrixSize` | integer | no | Bingo card grid size | `5` |
| `winningPatterns` | array of string | no | Active winning pattern types | `["Row", "Column", "Diagonal"]` |

### 4.16 PlayerDto

| Property | Type | Nullable | Description | Example |
|---|---|---|---|---|
| `playerId` | string (uuid) | no | Unique player identifier | `"f47ac10b-58cc-4372-a567-0e02b2c3d479"` |
| `displayName` | string | no | Player's display name | `"Max"` |
| `hasWon` | boolean | no | Whether the player has achieved bingo | `false` |
| `card` | CardDto | yes | Player's bingo card (null if not yet assigned) | (see below) |

### 4.17 CardDto

| Property | Type | Nullable | Description | Example |
|---|---|---|---|---|
| `matrixSize` | integer | no | Grid dimension (e.g., 5 = 5x5) | `5` |
| `squares` | array of SquareDto | no | All squares on the card (matrixSize² items) | (see below) |

### 4.18 SquareDto

| Property | Type | Nullable | Description | Example |
|---|---|---|---|---|
| `row` | integer | no | Zero-based row index | `0` |
| `column` | integer | no | Zero-based column index | `0` |
| `displayText` | string | no | Text displayed on the square | `"Safety Car deployed"` |
| `eventKey` | string | yes | Predefined event identifier. `null` for free spaces and custom (player-edited) squares. | `"SAFETY_CAR"` |
| `isFreeSpace` | boolean | no | Whether this is the center free space | `false` |
| `isMarked` | boolean | no | Whether the square is currently marked | `true` |
| `markedBy` | string | yes | Who marked the square. `null` if unmarked. | `"Player"` |
| `markedAt` | string (date-time) | yes | When the square was marked. `null` if unmarked. | `"2026-03-17T14:30:00+00:00"` |

### 4.19 LeaderboardEntryDto

| Property | Type | Nullable | Description | Example |
|---|---|---|---|---|
| `playerId` | string (uuid) | no | Unique player identifier | `"c9d0e1f2-a3b4-5678-cdef-901234567890"` |
| `rank` | integer | no | Sequential rank (1 = first to win) | `1` |
| `winningPattern` | string | no | Pattern that completed the win | `"Row"` |
| `completedAt` | string (date-time) | no | ISO 8601 UTC timestamp of win | `"2026-03-17T14:35:00+00:00"` |

### 4.20 ErrorResponse

| Property | Type | Nullable | Description | Example |
|---|---|---|---|---|
| `code` | string | no | Machine-readable snake_case error code | `"validation_error"` |
| `message` | string | no | Human-readable error message | `"One or more validation errors occurred."` |
| `details` | array of string | yes | Validation error details. Only present for `validation_error` responses. | `["HostDisplayName: Host display name is required."]` |

---

## 5. Enum Definitions

Every enum must be defined as a `string` type with `enum` values in the OpenAPI spec.

### 5.1 SessionType

F1 session types.

| Value | Description |
|---|---|
| `FP1` | Free Practice 1 |
| `FP2` | Free Practice 2 |
| `FP3` | Free Practice 3 |
| `Qualifying` | Qualifying session |
| `SprintQualifying` | Sprint qualifying session |
| `Sprint` | Sprint race |
| `Race` | Main race |

### 5.2 WinPatternType

Patterns of marked squares that constitute a bingo win.

| Value | Description |
|---|---|
| `Row` | All squares in any single row are marked |
| `Column` | All squares in any single column are marked |
| `Diagonal` | All squares on either diagonal (main or anti) are marked |
| `Blackout` | All squares on the entire card are marked |

### 5.3 RoomStatus

Room lifecycle states.

| Value | Description |
|---|---|
| `Lobby` | Room is accepting players, cards can be edited, game has not started |
| `Active` | Game is in progress, squares can be marked/unmarked, win detection is active |
| `Completed` | Game is over, room is read-only |

### 5.4 SquareMarkedBy

Indicates who marked a square.

| Value | Description |
|---|---|
| `Api` | Square was auto-marked by the event feed |
| `Player` | Square was marked by the player who owns the card |
| `Host` | Square was marked by the room host on another player's card |

---

## 6. Error Response Schema

All error responses share a consistent shape:

```json
{
  "code": "string (snake_case error code)",
  "message": "string (human-readable message)",
  "details": ["string (optional, validation errors only)"]
}
```

### Error Mapping Rules

| Error Source | HTTP Status | `code` Pattern | `details` |
|---|---|---|---|
| FluentValidation failures | 400 | `validation_error` | Array of `"PropertyName: Error message."` strings |
| `Error.Validation()` factory | 400 | `validation_{code}` | Optional |
| `Error.Unauthorized()` factory | 401 | `unauthorized` | Not included |
| `Error.Forbidden()` factory | 403 | `forbidden` | Not included |
| `Error.NotFound()` factory | 404 | `{entity}_not_found` | Not included |
| `Error.Conflict()` factory | 409 | Custom (see catalog below) | Not included |
| `DomainConflictException` (middleware) | 409 | Custom (see catalog below) | Not included |
| `DomainNotFoundException` (middleware) | 404 | Custom (see catalog below) | Not included |
| `DomainException` (middleware, base) | 422 | Custom | Not included |
| Unhandled exception (middleware) | 500 | `unexpected` | Not included |

### Complete Error Code Catalog

#### Authentication & Authorization Errors

| Code | HTTP | Message | Endpoints |
|---|---|---|---|
| `unauthorized` | 401 | `Missing or invalid player token.` | All authenticated endpoints |
| `forbidden` | 403 | `You do not have permission to perform this action.` | StartGame, EndGame, GetRoomState, EditSquare, MarkSquare, UnmarkSquare |

#### Not Found Errors

| Code | HTTP | Message Pattern | Endpoints |
|---|---|---|---|
| `room_not_found` | 404 | `room with ID '{id}' was not found.` | All endpoints (except CreateRoom) |
| `player_not_found` | 404 | `Player with ID '{playerId}' not found in this room.` | MarkSquare, UnmarkSquare, EditSquare |
| `square_not_found` | 404 | `No square at position ({row}, {column}).` | EditSquare, MarkSquare, UnmarkSquare |

#### Validation Errors

| Code | HTTP | Message | Endpoints |
|---|---|---|---|
| `validation_error` | 400 | `One or more validation errors occurred.` | CreateRoom, JoinRoom, EditSquare |

#### Conflict Errors — Room Status

| Code | HTTP | Message Pattern | Endpoints |
|---|---|---|---|
| `room_not_in_lobby` | 409 | `Cannot {action} — room is in '{status}' state, expected 'Lobby'.` | JoinRoom, StartGame, EditSquare |
| `room_not_active` | 409 | `Cannot {action} — room is in '{status}' state, expected 'Active'.` | EndGame, MarkSquare, UnmarkSquare |

#### Conflict Errors — Player State

| Code | HTTP | Message | Endpoints |
|---|---|---|---|
| `display_name_taken` | 409 | `A player with display name '{name}' already exists in this room.` | JoinRoom |
| `player_already_won` | 409 | `Cannot mark squares — player has already won.` | MarkSquare |
| `players_missing_cards` | 409 | `Player '{name}' does not have a card assigned. All players must have cards before starting.` | StartGame |
| `card_not_assigned` | 409 | `Player does not have a card assigned.` | EditSquare, MarkSquare, UnmarkSquare |

#### Conflict Errors — Square State

| Code | HTTP | Message | Endpoints |
|---|---|---|---|
| `square_is_free_space` | 409 | Varies by operation: `Cannot mark a free space — it is always marked.` / `Cannot unmark a free space.` / `Cannot edit a free space.` | MarkSquare, UnmarkSquare, EditSquare |
| `square_already_marked` | 409 | `Square is already marked.` | MarkSquare |
| `square_not_marked` | 409 | `Square is not marked.` | UnmarkSquare |
| `square_is_custom` | 409 | `Custom squares cannot be auto-marked.` | MarkSquare (API-triggered only) |

#### Server Errors

| Code | HTTP | Message | Endpoints |
|---|---|---|---|
| `unexpected` | 500 | `An unexpected error occurred.` | Any endpoint (unhandled exceptions) |

---

## 7. Realistic Example Data

All request and response examples in the OpenAPI spec must use realistic F1 data. The following values must be used consistently across examples:

### Room Context

| Field | Value |
|---|---|
| Season | `2026` |
| Grand Prix | `"Bahrain Grand Prix"` |
| Session Type | `"Race"` |
| Matrix Size | `5` |
| Winning Patterns | `["Row", "Column", "Diagonal"]` |
| Join Code | `"BHR26R"` |

### Players

| Player | Display Name | Role |
|---|---|---|
| Player 1 | `"Max"` | Host |
| Player 2 | `"Lewis"` | Participant |
| Player 3 | `"Charles"` | Participant |

### Example UUIDs (use consistently)

| Entity | UUID |
|---|---|
| Room | `a1b2c3d4-e5f6-7890-abcd-ef1234567890` |
| Max (host) | `f47ac10b-58cc-4372-a567-0e02b2c3d479` |
| Lewis | `c9d0e1f2-a3b4-5678-cdef-901234567890` |
| Charles | `d5e6f7a8-b9c0-1234-5678-abcdef012345` |
| Max's token | `550e8400-e29b-41d4-a716-446655440000` |
| Lewis's token | `661f9511-f3ac-52e5-b827-557766551111` |
| Charles's token | `772a0622-04bd-63f6-c938-668877662222` |

### Example Bingo Square Display Texts and Event Keys

| Display Text | Event Key |
|---|---|
| `"Safety Car deployed"` | `SAFETY_CAR` |
| `"Red flag"` | `RED_FLAG` |
| `"Fastest lap by leader"` | `FASTEST_LAP_LEADER` |
| `"DRS failure"` | `DRS_FAILURE` |
| `"Driver of the Day shown"` | `DRIVER_OF_THE_DAY` |
| `"Pit stop under 2 seconds"` | `PIT_STOP_UNDER_2S` |
| `"Team radio played on broadcast"` | `TEAM_RADIO_BROADCAST` |
| `"Overtake into Turn 1"` | `OVERTAKE_TURN_1` |
| `"Penalty issued"` | `PENALTY_ISSUED` |
| `"Tyre strategy gamble"` | `TYRE_STRATEGY_GAMBLE` |
| `"Collision in midfield"` | `MIDFIELD_COLLISION` |
| `"Leader pits first"` | `LEADER_PITS_FIRST` |
| `"Virtual Safety Car"` | `VIRTUAL_SAFETY_CAR` |
| `"Blue flags shown"` | `BLUE_FLAGS` |
| `"Rain starts during race"` | `RAIN_DURING_RACE` |
| `"Top 3 finish on different tyres"` | `TOP3_DIFFERENT_TYRES` |
| `"Grid penalty served"` | `GRID_PENALTY` |
| `"Engine failure / retirement"` | `ENGINE_FAILURE` |
| `"Double stack pit stop"` | `DOUBLE_STACK` |
| `"Track limits warning"` | `TRACK_LIMITS` |
| `"Lap 1 incident"` | `LAP_1_INCIDENT` |
| `"Undercut attempt"` | `UNDERCUT_ATTEMPT` |
| `"Top 10 all within 5 seconds"` | `TOP10_WITHIN_5S` |
| `"DRS train forms"` | `DRS_TRAIN` |
| `"FREE"` | (none — free space) |

---

## 8. Compliance Checklist

The BE must verify every item before the OpenAPI spec is published.

### Metadata

- [ ] `info.title` is `"B1ngo API"`
- [ ] `info.version` is `"1.0.0"`
- [ ] `info.description` is a single paragraph describing what the API does
- [ ] `info.contact` includes name and email
- [ ] `info.license` specifies MIT
- [ ] `servers` array contains both development (`http://localhost:5000`) and production (`https://api.b1ngo.dev`) entries

### Authentication

- [ ] `securitySchemes.playerToken` is defined as `apiKey` in `header` named `X-Player-Token`
- [ ] Security scheme includes a description of the full token lifecycle
- [ ] CreateRoom and JoinRoom have `security: []` (no auth)
- [ ] All other endpoints reference `playerToken` security scheme

### Endpoints — Structure

- [ ] Every endpoint has an `operationId` in PascalCase matching the `[EndpointName]` attribute
- [ ] Every endpoint has a `summary` matching the `[EndpointSummary]` attribute
- [ ] Every endpoint has a `description` of 2–4 sentences
- [ ] Every endpoint has `tags: ["Rooms"]`
- [ ] Every endpoint documents all possible HTTP status codes (as listed in this spec)
- [ ] Every HTTP status code has a description of when it is returned
- [ ] Every HTTP status code has a response body schema
- [ ] Every HTTP status code has a realistic example response

### Endpoints — Complete List

- [ ] `POST /api/v1/rooms` — CreateRoom
- [ ] `POST /api/v1/rooms/join` — JoinRoom
- [ ] `POST /api/v1/rooms/reconnect` — Reconnect
- [ ] `POST /api/v1/rooms/{roomId}/start` — StartGame
- [ ] `POST /api/v1/rooms/{roomId}/end` — EndGame
- [ ] `GET /api/v1/rooms/{roomId}` — GetRoomState
- [ ] `PUT /api/v1/rooms/{roomId}/players/me/card/squares/{row}/{column}` — EditSquare
- [ ] `POST /api/v1/rooms/{roomId}/players/{playerId}/card/squares/{row}/{column}/mark` — MarkSquare
- [ ] `POST /api/v1/rooms/{roomId}/players/{playerId}/card/squares/{row}/{column}/unmark` — UnmarkSquare

### Parameters

- [ ] Every path parameter has `name`, `in`, `type`, `required`, `description`, and `example`
- [ ] `roomId` parameters are typed as `string (uuid)`
- [ ] `playerId` parameters are typed as `string (uuid)`
- [ ] `row` and `column` parameters are typed as `integer`

### Request Bodies

- [ ] Every request body has a named schema in `components/schemas`
- [ ] Every schema property has a `description`
- [ ] Every schema property has a `type`
- [ ] Optional/nullable properties are explicitly marked
- [ ] Every request body has a realistic example
- [ ] Constraint annotations (min, max, pattern, enum) are present

### Response Bodies

- [ ] Every response body has a named schema in `components/schemas`
- [ ] Every schema property has a `description`
- [ ] Nullable fields are explicitly marked (`nullable: true` or type union with `null`)
- [ ] Every response has a realistic example

### Schemas

- [ ] `CreateRoomRequest` schema defined with all properties
- [ ] `CreateRoomResponse` schema defined
- [ ] `JoinRoomRequest` schema defined with all properties
- [ ] `JoinRoomResponse` schema defined
- [ ] `ReconnectResponse` schema defined
- [ ] `StartGameResponse` schema defined
- [ ] `EndGameResponse` schema defined
- [ ] `EditSquareRequest` schema defined
- [ ] `EditSquareResponse` schema defined
- [ ] `MarkSquareResponse` schema defined
- [ ] `BingoInfo` schema defined
- [ ] `UnmarkSquareResponse` schema defined
- [ ] `GetRoomStateResponse` schema defined
- [ ] `SessionDto` schema defined
- [ ] `ConfigurationDto` schema defined
- [ ] `PlayerDto` schema defined
- [ ] `CardDto` schema defined
- [ ] `SquareDto` schema defined
- [ ] `LeaderboardEntryDto` schema defined
- [ ] `ErrorResponse` schema defined

### Enums

- [ ] `SessionType` enum: `FP1`, `FP2`, `FP3`, `Qualifying`, `SprintQualifying`, `Sprint`, `Race`
- [ ] `WinPatternType` enum: `Row`, `Column`, `Diagonal`, `Blackout`
- [ ] `RoomStatus` enum: `Lobby`, `Active`, `Completed`
- [ ] `SquareMarkedBy` enum: `Api`, `Player`, `Host`
- [ ] All enum values have descriptions

### Error Responses

- [ ] `ErrorResponse` schema has `code` (string), `message` (string), `details` (nullable array of string)
- [ ] Error response schema is used consistently across all error status codes
- [ ] Every error code from the catalog (Section 6) appears in at least one endpoint's response documentation
- [ ] Error examples use realistic messages matching the actual error factory output

### Validation

- [ ] OpenAPI spec validates against the OpenAPI 3.1 JSON Schema
- [ ] All `$ref` references resolve correctly
- [ ] No unused schemas in `components/schemas`
- [ ] All examples match their declared schemas
