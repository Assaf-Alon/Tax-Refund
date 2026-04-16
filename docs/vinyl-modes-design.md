# Design Document: Shuffle and Hard Modes for Vinyl Game

## 1. What is being changed?

This change introduces two new gameplay modes to the "Vinyl Timeline" game:
- **Shuffle Mode**: Instead of playing fixed song segments (e.g., the intro or chorus), a random 20-second segment is selected from the track.
- **Hard Mode**: The length of the played snippet is reduced to 10 seconds.
- **Improved Randomization**: When Shuffle Mode is off, the game will now randomly choose between the primary (`startTime`-`endTime`) and alternative (`altStartTime`-`altEndTime`) clips if available.
- **Stacking**: These modes can be enabled simultaneously, resulting in a random 10-second snippet.

## 2. Why this approach?

### Context
The current game is predictable because it always plays the same segment of a song. Users who have played multiple times might recognize songs based on specific snippets.

### Alternatives Considered
- **Dynamic Segment Generation in `useAudioStream`**: We could have logic in the audio hook to randomize segments. However, keeping this in the game state (`useVinylGame`) ensures that the "Listen Used" state and pre-loading logic remain synchronized with the specific segment being played.
- **Fetching Duration via API**: To accurately ensure a 20s buffer before the end of the song in Shuffle Mode, we need the song's duration. Since our current JSON doesn't consistently provide duration, we will use a heuristic (e.g., assuming 90s for anime songs if unknown, or using `altEndTime` as a reference) and refine it later if needed.

### Decision
We will calculate and store the `playbackStart` and `playbackEnd` in the game state for **both** the current `mysteryCard` and the `nextMysteryCard`. This ensures that even in Shuffle Mode, the next round is fully deterministic and ready for pre-loading before the turn transition occurs.

## 3. How it will be implemented

### 3.1 Type Definitions
Modify `src/shared/types/music.ts`:
- Add `shuffleMode: boolean` and `hardMode: boolean` to `VinylGameState`.
- Add `playbackStart?: number` and `playbackEnd?: number` to `VinylGameState`.
- Add `nextPlaybackStart?: number` and `nextPlaybackEnd?: number` to `VinylGameState`.

### 3.2 Logic Updates (`useVinylGame.ts`)
- Update `INITIAL_STATE` to include `shuffleMode: false`, `hardMode: false`, and the new playback bounds.
- Modify `setupGame` to accept `shuffleMode` and `hardMode` and initialize them in state.
- Create a helper function `calculatePlaybackRange(song: SongItem, shuffle: boolean, hard: boolean)` that implements the logic defined in the analysis.
- Update `startRound`:
    - If an `incomingMystery` is provided (usual the `state.nextMysteryCard`), use the `state.nextPlaybackStart/End` if they exist, otherwise calculate them.
    - Calculate the range for the **newly selected** `nextMysteryCard` and store it in `nextPlaybackStart/End`.
- **State Migration**: Ensure `getInitialState` handles old saved states by providing defaults for the new flags.

### 3.3 UI Updates (`VinylTimelinePage.tsx`)
- Add two new toggle switches in the "Settings Section" of the setup screen.
- **Pattern**: Follow the existing JSX pattern for "One Listen Only" (lines 219-231).
- **Icons**: Use `Shuffle` (from `lucide-react`) for Shuffle Mode and `Zap` or `Gauge` for Hard Mode.
- **Hook Calls**: Update `handlePlaySnippet` to use `state.playbackStart` and `state.playbackEnd` in the `playExcerpt` call:
  ```typescript
  playExcerpt(
    state.mysteryCard.youtubeId, 
    state.playbackStart ?? state.mysteryCard.startTime, 
    state.playbackEnd ?? state.mysteryCard.endTime,
    // ...
  );
  ```

## 4. Verification

### 4.1 Automated Tests
- Since this is a UI-heavy change, manual verification is primary, but we will ensure state transitions are tested if unit tests exist for `useVinylGame`.

### 4.2 Manual Testing
- Start a game with **Shuffle Mode** and verify snippets start at different times across multiple songs.
- Start a game with **Hard Mode** and verify snippets are exactly 10s long (check progress bar and audio cutoff).
- Start a game with **Both** and verify it's a random 10s snippet.
- Verify **One Listen Only** logic still works correctly with these modes.
- Verify **Normal Mode** (both OFF) now occasionally uses the alternative starting point if available.
