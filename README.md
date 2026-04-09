# b1ngo

![GitHub Release](https://img.shields.io/github/v/release/dulait/b1ngo) ![.NET](https://img.shields.io/badge/.NET-10.0-512BD4) ![Angular](https://img.shields.io/badge/Angular-21-DD0031) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-4169E1) ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4) ![SignalR](https://img.shields.io/badge/SignalR-10-512BD4)

Multiplayer bingo for Formula 1 sessions. Create a room, invite friends, and mark off events as they happen during practice, qualifying, or the race.

Play at **[b1ngo.live](https://b1ngo.live)**

## How it works

1. **Create a room** / pick a season, Grand Prix, and session type. You get a 6-character join code to share.
2. **Friends join** with the code and get a randomized bingo card filled with F1 events relevant to that session.
3. **Start the game** once everyone's in. Mark squares as events happen on track.
4. **First to complete a pattern wins.** Rows, columns, diagonals, or full blackout / configurable per room.

Rooms support up to 20 players. The host can mark or unmark squares for any player, and the app detects wins automatically with a live leaderboard.

Cards are 5x5 by default (with a free center square), but 3x3 is available for shorter sessions. Players can swap out squares on their card before the game starts.

## Project structure

```
client/
  apps/
    b1ngo/          Main Angular app
    showcase/       Design system catalog (dev only)
  packages/
    bng-ui/         Shared UI component library

server/
  src/
    B1ngo.Domain.Core/           Domain primitives
    B1ngo.Domain.Game/           Room, Player, BingoCard, win detection
    B1ngo.Application.Common/    CQRS interfaces, ports
    B1ngo.Application.Features/  Command & query handlers
    B1ngo.Infrastructure/        EF Core, SignalR, card generation
    B1ngo.Web/                   Controllers, hubs, middleware
  tests/                         Unit, integration, E2E
  tools/
    DataSync/                    Imports F1 reference data

docs/
  openapi.v1.json               API spec
```

## API docs

The API spec lives at `docs/openapi.v1.json`. When running locally, Scalar docs are available at the `/scalar` endpoint.
