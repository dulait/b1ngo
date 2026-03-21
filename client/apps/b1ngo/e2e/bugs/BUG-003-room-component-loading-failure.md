## BUG-003: Room component intermittently stuck in loading skeleton

**Severity:** Medium
**Stories:** BNG-013 (Reconnect), BNG-011 (End Game)
**Tests:** AC-2 (reconnect to lobby), AC-3 (reconnect to active), end game UI confirmation
**Status:** Investigating

### Expected Behavior

After `navigateToRoom` sets the PlayerToken cookie and localStorage session then navigates to `/room/{roomId}`, the room component should fetch room state from `GET /api/v1/rooms/{roomId}` and render the appropriate view (lobby, game, or results).

### Actual Behavior

Intermittently, the room component remains in the loading skeleton state showing only "Your Card" and "Players" headers without content. The `getRoomState` API call likely failed (429 rate limit or network timing), and the error state renders empty skeleton-like sections.

### Evidence

Page snapshot on failure shows:
```yaml
- main:
  - region "Your Card":
    - generic: Your Card
  - region "Players":
    - generic: Players
```

No matrix, no join code, no player list. This is the fallback/error rendering.

### Reproduction

Intermittent. More likely under concurrent test execution (workers: 4). Seen in:
- `reconnect.spec.ts AC-2` (reconnect to Lobby)
- `reconnect.spec.ts AC-3` (reconnect to Active)
- `end-game.spec.ts` (end game UI confirmation)

### Possible Causes

1. **Rate limiting (429)**: With 4 workers creating rooms concurrently, the API may rate-limit some requests including the room component's `getRoomState` call.
2. **Cookie timing**: The `context.addCookies()` may not propagate to the page before the Angular app makes its API call, causing a 401.
3. **Race condition**: The page navigates to `/room/{roomId}` before localStorage session is fully committed.
