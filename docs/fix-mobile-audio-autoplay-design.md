# Design Document: Fix Mobile Audio Autoplay Rejection & Audio Priming

## 1. What is being changed/added

This document details the root cause fix for the mobile audio playback rejection issue in the "It's a hit" riddle (`ItsAHitRiddle.tsx` / `useAudioStream.ts`).

### Symptoms identified in recent mobile logs:
1. On the first tap of a vinyl record, `unlockAudio()` is called to prime the media element. However, `unlockAudio()` fails with `AbortError` (`Play attempt ignored or restricted`).
2. Subsequent call to `playExcerpt()` after `await prepare()` (760ms later) fails with `NotSupportedError: Native audio play() blocked by browser (Autoplay Policy)`.
3. Tapping a second time triggers `togglePlayback()`, which fails with `NotSupportedError` because YouTube iframe API or native element was never unlocked during a valid user gesture.

---

## 2. Why this approach was chosen & Root Cause Analysis

### Root Cause 1: `unlockAudio()` Aborted by `audioRef.current.src = ""`
- **Mechanism**: In `useAudioStream.ts`, `unlockAudio()` sets `audioRef.current.src` to a 0.1s silent WAV data URL (`data:audio/wav;base64,...`) and calls `audioRef.current.play()`.
- **Failure Point**: `handleSelectSong` immediately calls `stop()` and `prepare(videoId)`. Line 269 in `prepare()` executes:
  ```ts
  if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ""; }
  ```
- **Result**: Setting `audio.src = ""` while `audio.play()` is pending causes browser media engine to reject the `play()` promise with an `AbortError`. Because the silent play promise was aborted before completion, `audioRef.current` fails to gain user-gesture authorization token from the browser.

### Root Cause 2: Asynchronous Boundary Expiration & Autoplay Policy Rejection
- **Mechanism**: After `unlockAudio()` is aborted, `prepare()` performs async network fetches (`await ensureYTAPI()` or fetching stream URLs across 5 Piped API instances), which takes 760ms+.
- **Failure Point**: By the time `prepare()` completes and calls `playExcerpt()`, execution has crossed multiple microtask/macrotask boundaries. The browser's ephemeral user gesture context is lost.
- **Result**: `audioRef.current.play()` is rejected with `NotSupportedError: Native audio play() blocked by browser (Autoplay Policy)`.

### Root Cause 3: Mobile Restrictions on YouTube IFrame API
- **Mechanism**: On iOS Safari and Android Chrome, programmatic `playVideo()` calls on YouTube `<iframe>` elements outside of direct user gesture turns are blocked by mobile autoplay policies.
- **Result**: `ytPlayerRef.current.playVideo()` fails on mobile when cued asynchronously. Conversely, an HTML5 `<audio>` element (`HTMLAudioElement`) CAN remain unlocked across `src` changes once initialized with a gesture token.

---

## 3. How it will be implemented

### 1. `src/shared/hooks/useAudioStream.ts`
- **Track Unlock State**: Maintain `isUnlockedRef` boolean ref.
- **Safe `unlockAudio()` Execution**:
  - `unlockAudio()` will play the silent WAV data URL on `audioRef.current`.
  - Once `play()` succeeds, set `isUnlockedRef.current = true`.
- **Prevent Aborting Gesture Token**:
  - Update `prepare()` and `stop()` to NOT clear `audioRef.current.src = ""` or call `.pause()` if `unlockAudio()` is currently in-flight.
- **Seamless Native Audio Stream Transition**:
  - When `getStreamUrl()` resolves with a stream URL, update `audioRef.current.src = url` directly.
  - If `audioRef.current` was already unlocked (or `pendingPlayRef` is set), execute `audioRef.current.play()`. Because the `HTMLAudioElement` instance is already unlocked by the user gesture, setting a new `src` and calling `.play()` will succeed without triggering browser autoplay policy blocks.
- **Optimize Proxy Fetching**:
  - Refactor `getStreamUrl` to fail fast on proxy errors to avoid cascading 3-second timeouts during prefetching.

### 2. `src/features/riddles/its-a-hit/ItsAHitRiddle.tsx`
- **Synchronous Tap Flow**:
  - On record tap (`handleSelectSong`), synchronously call `unlockAudio()`.
  - Avoid calling `stop()` prior to `prepare()`, letting `prepare()` handle track switching without destroying the media element token.

---

## 4. Verification Plan

### Automated Tests
- Run `npm test` to verify all 14 test suites and 90 unit tests pass without regressions.

### Manual Verification
1. Test record selection on mobile / Chrome mobile emulation:
   - Tap vinyl record #1: Verify `unlockAudio: Audio element successfully unlocked` appears without `AbortError`.
   - Verify audio begins playing immediately on the first tap.
   - Verify vinyl record spinning animation activates (`isPlaying = true`).
2. Test rapid tapping and track switching to confirm audio context stays unlocked and responsive.
