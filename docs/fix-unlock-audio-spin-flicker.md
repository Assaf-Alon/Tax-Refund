# Fix Audio Unlock Gesture State Flicker Design

## 1. What
Fix the split-second vinyl spinning flicker bug that occurs when tapping a new record in `ItsAHitRiddle`.

## 2. Why
### Context & Problem
When tapping a vinyl record, `unlockAudio()` is executed synchronously to prime the browser's audio context using a silent 0.1-second WAV data URI (`data:audio/wav;base64,...`). 
When the `<audio>` element starts playing this silent WAV file, the global `audio.onplaying` event listener fires and updates `status` to `'playing'`, causing `isPlaying` to become `true`. Consequently, `VinylCard` starts playing its spinning animation.

Shortly after (~200ms), `prepare()` finishes checking local audio files and sets `status` to `'ready'`, which turns `isPlaying` back to `false` and resets the vinyl rotation. Moments later, `playExcerpt()` begins actual playback of the MP3 file, setting `status` to `'playing'` again and restarting the spinning animation.

### Alternatives Considered & Rejected
1. **Delaying `setActiveSong` until after `prepare` / `playExcerpt`**: Rejected because delaying UI response to user touch input makes the app feel sluggish and unresponsive.
2. **Removing `unlockAudio`**: Rejected because iOS Safari and mobile Chrome enforce strict autoplay restrictions requiring audio element priming within the synchronous user gesture callback.

### Chosen Approach
Ignore HTML5 `<audio>` media event transitions (`onplaying`, `onpause`, `ontimeupdate`, `onended`, `onerror`) whenever the audio source is the silent unlock data URI (`data:audio/wav...`) or while `isUnlockingRef` is active.

## 3. How
Modify `useAudioStream.ts`:
- In `<audio>` event handlers (`onplaying`, `onpause`, `ontimeupdate`, `onended`, `onerror`), check if `audio.src` starts with `"data:audio"` or `isUnlockingRef.current` is true.
- If it is the silent unlock clip, skip player status state mutations (`setStatus('playing')`, `setStatus('paused')`, `handleTimeUpdate`, `handleEnded`).
- Ensure `isUnlockingRef.current` remains `true` throughout silent WAV playback and only resets after unlock completion or error.

### Code Changes Summary
In `src/shared/hooks/useAudioStream.ts`:
- Update `onplaying`, `onpause`, `ontimeupdate`, `onended`, `onerror` listeners to filter out silent unlock data URIs: `if (audio.src && audio.src.startsWith('data:audio')) return;`.

## 4. Verification
1. Tap a new record on `ItsAHitRiddle`.
2. Verify that the vinyl record does NOT start spinning during the 200ms preparation phase.
3. Verify that once the MP3 audio actually begins playing, the vinyl starts spinning smoothly without resetting or interrupting.
4. Verify audio playback still succeeds on mobile devices (iOS/Android) requiring gesture unlock.
