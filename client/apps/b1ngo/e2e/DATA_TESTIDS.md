# Data Test IDs

All `data-testid` attributes added for E2E testing.

## Home Page

### Create Room Form (`create-room-form.html`)

| Test ID | Element | Purpose |
|---------|---------|---------|
| `create-room-card` | `<bng-card>` | Create room form container |
| `create-room-name` | `<bng-input>` | Host display name input |
| `create-room-season` | `<bng-select>` | Season dropdown |
| `create-room-gp` | `<bng-select>` | Grand Prix dropdown |
| `create-room-session` | `<bng-select>` | Session type dropdown |
| `create-room-more-options` | `<bng-button>` | Toggle advanced options |
| `create-room-matrix-sizes` | `<div>` | Matrix size radio group container |
| `matrix-size-{n}` | `<button>` | Individual matrix size option (e.g. `matrix-size-3`) |
| `create-room-win-patterns` | `<div>` | Winning patterns toggle group |
| `create-room-submit` | `<bng-button>` | Submit create room form |

### Join Room Form (`join-room-form.html`)

| Test ID | Element | Purpose |
|---------|---------|---------|
| `join-room-card` | `<bng-card>` | Join room form container |
| `join-room-code` | `<bng-code-input>` | Room join code input |
| `join-room-name` | `<bng-input>` | Player display name input |
| `join-room-submit` | `<bng-button>` | Submit join room form |

## Room Views

### Lobby (`lobby.html`)

| Test ID | Element | Purpose |
|---------|---------|---------|
| `lobby-join-code` | `<bng-code-input>` | Join code display |
| `lobby-card` | `<bng-card>` | Player's card section |
| `lobby-player-list` | `<bng-card>` | Player list section |
| `lobby-start-game` | `<bng-button>` | Start game button (host only) |
| `edit-square-input` | `<bng-input>` | Edit square text input (bottom sheet) |
| `edit-square-cancel` | `<bng-button>` | Cancel edit (bottom sheet) |
| `edit-square-save` | `<bng-button>` | Save edit (bottom sheet) |

### Game (`game.html`)

| Test ID | Element | Purpose |
|---------|---------|---------|
| `game-leaderboard` | `<bng-card>` | Leaderboard/winners section |
| `game-players` | `<bng-collapsible>` | Collapsible player list |
| `game-end-game` | `<bng-button>` | End game button (host only) |
| `end-game-cancel` | `<bng-button>` | Cancel end game (confirmation sheet) |
| `end-game-confirm` | `<bng-button>` | Confirm end game (confirmation sheet) |

### Results (`results.html`)

| Test ID | Element | Purpose |
|---------|---------|---------|
| `results-game-over` | `<p>` | Game Over heading |
| `results-rank` | `<p>` | Player's final rank display |
| `results-leaderboard` | `<bng-card>` | Final standings leaderboard |
| `results-card` | `<bng-card>` | Player's final card |
| `results-new-room` | `<bng-button>` | New Room button |
| `results-share` | `<bng-button>` | Share Result button |

## Shared Components (`bng-ui`)

### Matrix (`matrix.component.ts`)

| Test ID | Element | Purpose |
|---------|---------|---------|
| `square-{row}-{col}` | `<bng-square>` | Individual square (e.g. `square-0-2`) |

### Leaderboard (`leaderboard.component.ts`)

| Test ID | Element | Purpose |
|---------|---------|---------|
| `leaderboard-entry-{rank}` | `<div>` | Leaderboard entry by rank (e.g. `leaderboard-entry-1`) |

### Player List (`player-list.component.ts`)

| Test ID | Element | Purpose |
|---------|---------|---------|
| `player-chip-{displayName}` | `<div>` | Player chip by name (e.g. `player-chip-Alice`) |

### Header (`header.component.ts`)

| Test ID | Element | Purpose |
|---------|---------|---------|
| `app-header` | `<header>` | App header container |
| `app-logo` | `<span>` | B1NGO logo text |
| `theme-button` | `<button>` | Theme picker toggle |
| `header-session-bar` | `<div>` | Session info sub-bar |
| `header-session-info` | `<span>` | Session info text |

### Theme Picker (`theme-picker.component.ts`)

| Test ID | Element | Purpose |
|---------|---------|---------|
| `theme-option-{name}` | `<button>` | Theme option button (e.g. `theme-option-dark`) |

### Status Badge (`status-badge.component.ts`)

| Test ID | Element | Purpose |
|---------|---------|---------|
| `status-badge` | `<div>` | Room status badge |
