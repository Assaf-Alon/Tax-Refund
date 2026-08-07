# Design Document: Local Audio File Clips & Mobile Audio Autoplay Fix

## 1. What is being changed/added

This document outlines the design for fixing mobile audio playback in the "It's a Hit" riddle (`ItsAHitRiddle.tsx` / `useAudioStream.ts`).

1. **Revert Recent Proxy/Pre-fetch Attempts**:
   - Revert the `prefetchStreams` function and the "Power On Turntable" overlay screen added to `ItsAHitRiddle.tsx` and `useAudioStream.ts`.
   - Remove background stream URL pre-fetching which relied on third-party Piped API proxies.

2. **Implement Local Audio File Clips (Option 2)**:
   - Add native support in `useAudioStream.ts` for playing local `.mp3` audio files located under `/public/audio/` (e.g. `/public/audio/[songId].mp3`).
   - When a song is selected, `useAudioStream` checks if a local audio clip exists at `${import.meta.env.BASE_URL}audio/${songId}.mp3`.
   - If present, the engine plays the local clip directly via HTML `<audio>`, providing instant (<10ms) playback within the initial user gesture turn.
   - If absent, it gracefully falls back to the existing YouTube / stream proxy engine.

---

## 2. Why this approach was chosen & Context

### Problem Context & Mobile Autoplay Restrictions
Mobile web browsers (iOS Safari and Android Chrome Mobile) strictly enforce **User Gesture Autoplay Policies**:
1. HTML `<audio>` elements can only begin playback synchronously within a direct user interaction event turn (such as `pointerdown` or `click`).
2. Fetching YouTube stream URLs via third-party proxies (e.g., Piped API instances) introduces 1–3+ second network delays. By the time the proxy fetch completes, the browser context token has expired, causing `.play()` to fail with `NotSupportedError: Native audio play() blocked by browser`.
3. Public Piped API proxy servers are notoriously unreliable on mobile networks, often timing out or returning CORS / rate-limit errors.

### Rejected Alternatives
- **Pre-fetching Stream URLs (Rejected)**: Failed because Piped proxy instances frequently time out or fail CORS on mobile devices.
- **Turntable "Power On" Overlay (Rejected)**: Added unnecessary UI friction without resolving underlying proxy timeout failures on mobile.
- **YouTube Iframe Embed on Mobile (Rejected)**: Programmatic `player.playVideo()` calls on embedded YouTube `<iframe>` elements are heavily restricted outside direct user touch turns on mobile browsers.

---

## 3. How it will be implemented

### 1. Audio Engine Updates (`src/shared/hooks/useAudioStream.ts`)
- **Revert Proxy/Pre-fetch Code**:
  - Remove `prefetchStreams` and `prefetch` functions.
  - Remove background pre-fetch URL cache (`streamCacheRef` / `urlCache`).
- **Local Clip Detection & Priority**:
  - Update `prepare` and `playExcerpt` functions to accept `songId` (number or string) alongside `youtubeId`.
  - When preparing or playing a song:
    1. Construct local asset URL: `const localUrl = `${import.meta.env.BASE_URL}audio/${songId}.mp3``.
    2. Check if local MP3 exists via a fast `fetch(localUrl, { method: 'HEAD' })` or setting `audio.src = localUrl`.
    3. If local file exists:
       - Set engine to `'native'`.
       - Assign `audioRef.current.src = localUrl`.
       - Trigger `audioRef.current.play()` synchronously.
    4. If local file does not exist (404 response):
       - Fallback to YouTube API / Piped API proxy streaming logic.

### 2. Riddle Component Simplification (`src/features/riddles/its-a-hit/ItsAHitRiddle.tsx`)
- **Remove "Power On Turntable" Overlay**:
  - Remove `isPoweredOn` state.
  - Remove the overlay screen so users directly enter the riddle interface upon location check-in.
- **Simplify Song Selection**:
  - In `handleSelectSong`, call `prepare(song.id, song.youtubeId)` and `playExcerpt(song.id, song.youtubeId, song.startTime, song.endTime)`.
  - Playback starts immediately using local audio clip if present.

---

## 4. Verification Plan

### Automated Tests
- Run `npm test` to ensure existing unit tests pass without regressions.

### Manual Verification
1. Place a sample MP3 clip (e.g. `101.mp3`) under `public/audio/`.
2. Open the "It's a Hit" riddle stage.
3. Tap the vinyl record corresponding to song `101`:
   - Verify playback begins **instantly (<10ms)** without any loading delay.
   - Verify record spin animation activates immediately (`isPlaying = true`).
4. Tap a vinyl record without a local MP3 file:
   - Verify engine falls back to YouTube / stream proxy cleanly.
