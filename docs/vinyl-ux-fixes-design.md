# Vinyl Timeline UX Fixes & Performance Design

This document outlines the fixes and improvements for the Vinyl Timeline mini-game to address audio state inconsistencies, UI timing issues, and performance bottlenecks.

## 1. What is being changed?

The following fixes and improvements will be implemented:
1.  **Audio Termination on State Change**: Ensuring music stops when the game ends, restarts, or returns to the menu.
2.  **Play/Pause State Synchronization**: Fixing the "sticky" pause state and ensuring the UI reflects the actual playback state across turns.
3.  **Reveal Animation Timing**: Delaying the success/fail modal to allow the card's "flip" animation to complete.
4.  **Performance (Pre-loading)**: Enhancing the pre-loading system to achieve near-instant playback for upcoming songs.
5.  **Audio "Glitch" Fix**: Investigating and fixing the race condition where a fraction of a song plays when transitioning stages.

## 2. Why this approach? (Rationale)

### 2.1 Audio Cleanup
- **Rationale**: Currently, `useAudioStream` only cleans up on unmount. Since the `VinylTimelinePage` stays mounted while the game transitions from `playing` -> `revealing` -> `gameOver` / `setup`, we need an explicit observer of the game status to kill the audio.

### 2.2 Sticky "Pause" Button
- **Rationale**: The `VinylTimelinePage` uses a `localIsPlaying` state which is set to `true` when a snippet starts. If a turn ends (e.g., the user drops the card) while music is playing, the `onEnd` callback for `playExcerpt` might never be called (or is called in a stale context), leaving the button in a "Pause" state for the next turn.

### 2.3 Reveal Sequence
- **Rationale**: Immersion is broken when a "Correct!" modal instantly covers the card reveal. A short delay (800ms) matches the CSS transition time of the card flip, making the reveal feel earned.

### 2.4 Pre-loading (The "Next Card" Queue)
- **Rationale**: Currently, we pre-fetch URLs but don't force the browser to buffer the audio data. By moving the "Next Mystery Card" selection into the game engine's state *ahead of time*, we can begin `audio.load()` in the background before the turn starts.

## 3. How it will be implemented

### 3.1 `useVinylGame.ts` Updates
1.  **Next Card Buffer**: 
    - Update `VinylGameState` type to include `nextMysteryCard: SongItem | null`.
    - In `startRound`, select both `mysteryCard` (from current `nextMysteryCard` or pool) AND `nextMysteryCard` (random from remaining pool).
    - This allows the UI to know what's coming next.

### 3.2 `useAudioStream.ts` Updates
1.  **Refined `prepare()`**: 
    - Explicitly set `status` to `'loading'` immediately.
    - If `audio.src` is already the requested URI, don't reload it unnecessarily, but ensure status is correct.
    - Ensure `onplaying` and other events are handled carefully.
2.  **Reset Method**: Add a `reset()` method to stop all audio and reset states to `uninitialized`.

### 3.3 `VinylTimelinePage.tsx` Updates
1.  **Effect: Game Status Observer**:
    ```typescript
    useEffect(() => {
      if (state.status === 'setup' || state.status === 'gameOver') {
        stop();
      }
      if (state.status === 'playing') {
        setLocalIsPlaying(false); // Reset sticky state
      }
    }, [state.status, stop]);
    ```
2.  **Effect: Pre-load Next Card**:
    - Use `state.nextMysteryCard` to trigger `prefetch` or even a hidden `prepare`.
3.  **Modal Delay**:
    - Add `const [showResultModal, setShowResultModal] = useState(false);`
    - Use an effect to set `setShowResultModal(true)` with a delay when `state.status === 'revealing'`.
    - Reset it when moving to the next turn.

### 3.4 Audio Glitch Investigation
- The glitch likely happens because `audio.src` changes but the browser's audio pipeline isn't fully flushed.
- **Fix**: In `prepare`, we will use `audio.pause(); audio.src = ""; audio.load();` and then wait a tick before setting the new `src`.

## 4. Verification

### 4.1 Functional Tests
- **Restart/Menu**: Start music -> Click 'Reset' -> Music must stop immediately.
- **Game Over**: Fail last life while music plays -> Game over screen -> Music must stop.
- **Turn Transition**: Start music -> Drop card -> Success -> Next Turn -> Button must show "Play Snippet", not "Pause".

### 4.2 UI Sequence
- **Reveal**: Drop card -> Watch card flip -> Modal should appear *after* the flip completes (~800ms).

### 4.3 Performance
- **Pre-loading**: Note the time from "Next Turn" click to "Ready" status. Target < 500ms for cached/pre-fetched tracks.
