# Design Document: Pre-fetched Stream URLs & Turntable Power-On Audio Priming (Mobile Fix)

## 1. What is being changed/added

This document details the complete technical implementation for solving mobile audio autoplay rejections in the "It's a Hit" riddle (`ItsAHitRiddle.tsx` / `useAudioStream.ts`).

We are implementing a dual-strategy approach:
1. **Turntable "Power On" Overlay / Gesture Priming (Solution 3)**: An initial user touch interaction ("Power On Turntable" button / overlay) when entering the riddle stage. This user gesture unlocks the HTML `<audio>` element (`audioRef.current`) and Web Audio API `AudioContext` with a silent audio buffer during a direct, unambiguous user gesture.
2. **Pre-fetching Stream URLs at Stage Load (Solution 1)**: As soon as the stage mounts (or when the turntable is powered on), the app pre-fetches the stream URLs for all 4 riddle songs in the background using `getStreamUrl()`. When the user taps a record, the stream URL is already cached in memory, eliminating network latency and allowing `audio.src = cachedUrl` and `audio.play()` to fire instantly in 0ms within the touch event.

---

## 2. Why this approach was chosen & Root Cause Context

### Context & Mobile Autoplay Restrictions
Mobile web browsers (iOS Safari and Android Chrome) enforce strict **Autoplay Policies**:
1. Media element `.play()` calls must be synchronously initiated by a user gesture turn (e.g. `pointerdown` / `click`).
2. If an app tries to fetch stream URLs asynchronously over the network (e.g. fetching YouTube stream URLs from Piped API proxies taking 1-3 seconds), by the time `fetch()` completes, the browser considers the user gesture turn expired and rejects `play()` with `NotSupportedError: Native audio play() blocked by browser`.

### Rejected Alternatives
- **On-the-fly streaming on tap**: Fails on mobile because proxy fetches take 1-3 seconds, losing the gesture context token.
- **YouTube Iframe API on mobile**: Programmatic `player.playVideo()` on YouTube `<iframe>` elements outside direct user touch turns is strictly blocked by iOS Safari / Chrome Mobile.
- **Local Audio Clips**: Rejected for now to avoid downloading/bundling copyright-protected song MP3s into repo assets, keeping YouTube stream pre-fetching as the primary source.

---

## 3. How it will be implemented

### 1. Stream URL Caching & Pre-fetching (`src/shared/hooks/useAudioStream.ts`)
- **Add Stream URL Cache**: Introduce `streamCacheRef` (`Map<string, string>`) in `useAudioStream`.
- **Add Pre-fetch API**: Expose `prefetchStreams(videoIds: string[]): Promise<void>` from `useAudioStream`.
  - Loops over `videoIds`, checks if already in `streamCacheRef`.
  - Calls `getStreamUrl(videoId)` concurrently for un-cached IDs.
  - Caches resolved URLs in `streamCacheRef`.
- **Instant Playback in `prepare()` / `playExcerpt()`**:
  - When `prepare(videoId)` or `playExcerpt(videoId, ...)` is called, check `streamCacheRef.get(videoId)`.
  - If cached, immediately set `audioRef.current.src = cachedUrl` and trigger `audioRef.current.play()`.

### 2. "Power On Turntable" Audio Priming (`src/features/riddles/its-a-hit/ItsAHitRiddle.tsx`)
- **Stage State**: Add `isPoweredOn` state (boolean) to `ItsAHitRiddle.tsx`.
- **Overlay UI**: When `isPoweredOn` is false:
  - Display a sleek, themed overlay: **"Tap to Power On Turntable"** with a glowing power button and record player styling.
- **Power On Action**:
  - Tapping "Power On" calls `unlockAudio()` (playing silent WAV audio to permanently unlock `audioRef.current` in the browser session).
  - Sets `isPoweredOn(true)`.
  - Triggers `prefetchStreams(allSongVideoIds)` in the background so all 4 song URLs load into cache immediately while the user looks at the records.

### 3. Record Selection & Feedback Logic
- When `isPoweredOn` is true and user taps a vinyl record:
  - `handleSelectSong` calls `unlockAudio()` synchronously on touch.
  - If stream is cached (which it will be from pre-fetching), `audio.play()` starts instantly and `isPlaying` turns `true`, spinning the record with smooth CSS animation.
  - If a stream is still pre-fetching (e.g. slow network), show a subtle loading spinner on the record badge until stream resolves, then play.

---

## 4. Verification Plan

### Automated Tests
- Run `npm test` to verify unit tests for `useAudioStream`, `ItsAHitRiddle`, and all other stage tests pass cleanly.

### Manual Verification
1. Open "It's a hit" riddle.
2. Verify "Tap to Power On Turntable" overlay appears.
3. Tap "Power On":
   - Verify `unlockAudio` succeeds.
   - Verify background pre-fetching starts for all 4 song IDs in debug terminal.
4. Tap any record:
   - Verify playback begins **instantly on first tap**.
   - Verify record spin animation activates immediately (`isPlaying = true`).
