# Design Doc: Vinyl Game Modes & "One Listen Only"

## 1. What is being changed/added
We are introducing two major configuration options to the Vinyl Timeline setup:
1.  **Game Modes**:
    *   **Survivor**: (Classic) Players have 3 lives. If they guess wrong, they lose a life. The game ends when all players are eliminated or the pool is empty.
    *   **Points**: Players play for a fixed number of rounds (e.g., 5 cards each). No lives are lost; wrong guesses just yield 0 points.
2.  **One Listen Only**: A high-difficulty toggle. If enabled, the "Play Snippet" button is disabled after the audio has been played once (or when it finishes/is paused).

## 2. Why this approach?
- **Survivor** is great for competitive "last man standing" vibes, while **Points** is better for casual play where everyone wants to see the whole game.
- **One Listen** adds a "hardcore" layer for music buffs, preventing them from scrubbing through the clip multiple times to find a specific lyric.
- **Setup UI**: Keeping these as simple toggles in the player entry screen ensures the UI remains clean.

## 3. How it will be implemented

### A. State Updates (`shared/types/music.ts` & `useVinylGame.ts`)
*   Update `VinylGameState` type:
    ```typescript
    export interface VinylGameState {
      // ... existing
      mode: 'survivor' | 'points';
      oneListenOnly: boolean;
      listenedCurrentRound: boolean;
    }
    ```
*   Update `setupGame` to accept these new params.
*   Update `checkPlacement` to handle "Points" mode logic (don't decrement lives).
*   Add a logic to track rounds in "Points" mode to determine when the match ends.

### B. Setup UI (`VinylTimelinePage.tsx`)
*   Add a "Match Settings" section to `renderSetup`.
*   Use a modern, glass-morphism style selector for the mode.
*   Add a custom checkbox for "One Listen Only".

### C. Snippet Logic (`VinylTimelinePage.tsx`)
*   In `handlePlaySnippet`, if `state.oneListenOnly` is true:
    *   Set a local `hasListened` state to `true` when the play starts or the snippet finishes.
    *   Disable the play button if `hasListened` is true.
*   **Safety**: Only consume the listen if `actualIsPlaying` was true at some point (to avoid wasting it on loading errors).

## 4. Verification
- **Survivor**: Guess wrong 3 times -> Confirm player is eliminated.
- **Points**: Guess wrong -> Confirm lives don't change, score doesn't increase.
- **One Listen**: Click Play -> Wait for end/pause -> Confirm button is disabled and shows "Listen Used".
- **One Listen Error**: Simulate error -> Confirm button stays retry-able.
