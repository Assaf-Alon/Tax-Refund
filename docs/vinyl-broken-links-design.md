# Design Doc: Vinyl Timeline Broken Link Support

## 1. What is being changed/added
We are adding a recovery mechanism for songs that fail to stream (e.g., dead YouTube links).
1.  **Skip Mechanism**: A way to discard the current mystery card and pick a new one from the pool without penalty.
2.  **Error UI**: A clearer notification in the `VinylTimelinePage` when a song fails to load, displaying the song name and info.
3.  **Test Injection**: A temporary "dummy" song with a broken ID will be forced as the first mystery card for testing purposes.

## 2. Why this approach?
- Hardening against external API failures (YouTube/Proxy) is critical for a smooth user experience.
- The "Skip" action ensures the game can continue even if specific content is unavailable.

## 3. How it will be implemented

### A. Engine Updates (`useVinylGame.ts`)
*   Add `skipCurrentMystery()`:
    *   Picks a new mystery card from the remaining `pool`.
    *   Updates `state.mysteryCard` and `state.nextMysteryCard`.
*   Note: The broken song ID should be added to `usedIds` to prevent it from reappearing.

### B. UI Updates (`VinylTimelinePage.tsx`)
*   Modify the error display:
    *   If `playerStatus === 'error'`, show a modal or prominent banner.
    *   Include: "Couldn't load [Song Name] from link: https://youtube.com/watch?v=[ID]".
    *   Button: "Skip & Try Another Song".

### C. Test Case Injection
*   In `setupGame`, manually inject a `SongItem` with `youtubeId: 'INVALID_ID_TEST'`.

## 4. Verification
- Start game -> Observe error UI for the invalid song.
- Click "Skip" -> Confirm game selects a new valid song.
- Verify no score/lives change.
