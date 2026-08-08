# Fix Audio Unlock Gesture State & Record Selection Flicker Design

## 1. What
Fix the split-second vinyl spinning flicker bug that occurs when selecting a record in `ItsAHitRiddle`.

## 2. Why
### Context & Problem
There were two distinct causes for the split-second vinyl spinning flicker:

1. **Audio Unlock Event Triggering (`unlockAudio`)**:
   When tapping a vinyl record for the first time, `unlockAudio()` plays a silent 0.1s WAV data URI. The native `<audio>` element fired `onplaying`, setting `status` to `'playing'`, which caused the vinyl to spin during the preparation phase before setting `status` to `'ready'` (stopping spin) and then starting actual playback.

2. **Selecting a New Record While a Song is Currently Playing**:
   When song A is playing (`isPlaying = true`) and the user taps song B:
   - `setActiveSong(songB)` immediately changes the active song to song B.
   - Because `isPlaying` was `true` from song A, React rendered song B with `isActive = true` and `isPlaying = true`. Song B immediately started spinning.
   - `prepare(songB)` asynchronously checked local MP3 files (~95ms), loaded song B's source, and set `status` to `'ready'`.
   - Setting `status` to `'ready'` turned `isPlaying` to `false`. Song B stopped spinning and reset to 0 degrees.
   - `playExcerpt(songB)` started song B playback, setting `status` to `'playing'` (`isPlaying = true`). Song B started spinning again.

### Chosen Approach
1. Ignore HTML5 `<audio>` media event transitions (`onplaying`, `onpause`, `ontimeupdate`, `onended`, `onerror`) whenever the audio source is the silent unlock data URI (`data:audio/wav...`) or while `isUnlockingRef` is active.
2. Synchronously invoke `stop()` before `setActiveSong(songB)` in `handleSelectSong`. This resets `status` to `'paused'` (`isPlaying = false`) in the same React render batch as updating `activeSong`. Song B remains stationary during `prepare()` and only starts spinning once `playExcerpt()` actually commences audio playback.

## 3. How
1. In `src/shared/hooks/useAudioStream.ts`:
   - Filter out `data:audio` URIs and `isUnlockingRef.current` in audio event listeners.
   - Remove redundant `activeIdRef.current` auto-play triggers in `prepare()` and `fallbackToNative()`.
2. In `src/features/riddles/its-a-hit/ItsAHitRiddle.tsx`:
   - Call `stop()` synchronously before `setActiveSong(song)` inside `handleSelectSong`.

## 4. Verification
1. Tap vinyl A while no audio is playing. Verify it starts spinning smoothly when audio begins.
2. While vinyl A is playing, tap vinyl B.
3. Verify vinyl A stops spinning, vinyl B becomes active in stationary state, and vinyl B starts spinning smoothly only when its audio begins playing.
