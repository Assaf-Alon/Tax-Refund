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

### Root Cause 3: Mobile Restrictions on YouTube IFrame API vs Native Audio Engine
- **Mechanism**: On iOS Safari and Android Chrome, programmatic `playVideo()` calls on YouTube `<iframe>` elements outside of direct user gesture turns are strictly blocked by mobile autoplay policies.
- **Log Observation**: The recent logs show `unlockAudio: Audio element successfully unlocked` was achieved! However, because `prepare()` selected `engine = 'youtube'` in production mode, subsequent `togglePlayback()` calls targeted `ytPlayerRef.current.playVideo()`, bypassing the unlocked `HTMLAudioElement` (`audioRef.current`).
- **Solution**: Mobile/touch devices cannot play YouTube `<iframe>` elements programmatically via JS. `useAudioStream` must automatically route mobile/touch devices to the **Native Audio Engine** (`fallbackToNative`), which directly utilizes the unlocked `HTMLAudioElement`. Once `getStreamUrl()` resolves, `audioRef.current.src = url` and `audioRef.current.play()` execute seamlessly on the unlocked audio element.

---

## 3. How it will be implemented

### 1. `src/shared/hooks/useAudioStream.ts`
- **Mobile Device Detection**: Detect touch/mobile environment (`'ontouchstart' in window || navigator.maxTouchPoints > 0 || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)`).
- **Force Native Audio Streaming on Mobile**: Update `prepare()` to route mobile/touch devices directly to `fallbackToNative(videoId)`.
- **Seamless Stream Playback on URL Resolution**: In `fallbackToNative()`, when `getStreamUrl()` resolves, assign `audioRef.current.src = url`. If `pendingPlayRef` or `activeIdRef` matches the video ID, call `audioRef.current.play()`. Because `audioRef.current` was unlocked by `unlockAudio()`, playback begins immediately without triggering autoplay errors.
- **Optimize Proxy Fetching**: Fail fast on slow/errored Piped API instances to minimize latency between tap and playback.

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
