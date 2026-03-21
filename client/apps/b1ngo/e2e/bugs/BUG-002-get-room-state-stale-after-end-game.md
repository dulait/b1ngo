## BUG-002: GET room state returns stale status after EndGame

**Severity:** High
**Story:** BNG-012 (Results View), BNG-011 (End Game)
**Test:** AC-1: results show leaderboard with winners (and all results-view UI tests)
**Status:** Investigating

### Expected Behavior

After `POST /api/v1/rooms/{roomId}/end` returns 200 OK, an immediately subsequent `GET /api/v1/rooms/{roomId}` should return `status: "Completed"`.

### Actual Behavior

`GET /api/v1/rooms/{roomId}` sometimes returns `status: "Active"` immediately after a successful `endGame` call. This causes the Angular app to render the game view instead of the results view when navigating to the room.

### Impact

- Users who navigate to the room immediately after the host ends the game may see the game view instead of results.
- E2E tests that call `endGame` then navigate to the room page fail because the results view doesn't render.

### Workaround

Tests use `ensureCompleted()` to poll `getRoomState` until status is `Completed` before navigating. This masks the underlying issue.

### Possible Causes

- Write-read consistency issue in the database (eventual consistency between write and read replicas).
- Transaction not committed before the 200 response is sent.
- Caching layer returning stale state.
