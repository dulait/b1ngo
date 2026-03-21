## BUG-001: EditSquare API does not clear EventKey

**Severity:** Medium
**Story:** BNG-006 (Edit Square)
**Test:** AC-2: editing clears EventKey (square becomes custom)
**Status:** Open

### Expected Behavior

Per domain invariant S8: "Editing clears the EventKey (square becomes custom)".

When a player edits a square's display text via `PUT /api/v1/rooms/{roomId}/players/me/card/squares/{row}/{col}`, the response and subsequent `GET /api/v1/rooms/{roomId}` should return `eventKey: null` for that square.

### Actual Behavior

After a successful edit, `getRoomState` returns the square with the original `eventKey` (e.g., `"FP_LONG_RUN"`). The `displayText` is correctly updated to the new value, but `eventKey` is not cleared.

The frontend works around this by locally setting `eventKey: null` in the store after a successful edit (see `lobby.ts:78-81`), so the UI appears correct. But the backend persists the stale `eventKey`.

### Impact

- Auto-marking logic (if implemented) could incorrectly auto-mark a square that the player has customized.
- Domain invariant S8 is violated.
- The E2E test `AC-2` correctly asserts the expected behavior and will fail until this is fixed.

### Reproduction

1. Create a room, enter lobby
2. Edit square (0,0) to custom text via UI or API
3. Call `GET /api/v1/rooms/{roomId}` and inspect the square
4. `eventKey` is still the original value instead of `null`
