# Design: Audio Preloading and Instant Playback Optimization

Currently, the "Its-a-Hit" riddle experiences a significant delay (7-8 seconds on mobile) before the first song starts playing. This is caused by the following factors:
1. **Broken Pre-warming Loop**: The component calls `prepare(song.youtubeId)` for all stage songs in a sequential loop. Because the YouTube player state and active video IDs are tracked globally as single values inside `useAudioStream.ts`, calling `prepare` in a loop causes concurrent initialization calls that overwrite `activeIdRef.current` and destroy/re-create the YouTube player iframe repeatedly. Only the last song is actually loaded, while the others are aborted.
2. **On-demand Player Initialization**: When a user selects a vinyl record, if it is not the last song in the stage (which was the only one that finished preparing), it must initialize the YouTube player on the spot.
3. **No Prefetch in Production**: The `prefetch` method in `useAudioStream.ts` is explicitly restricted to development mode (`!import.meta.env.PROD`), meaning stream caching is completely disabled in production.

This document proposes an optimization to preload and cache direct audio stream URLs in the background for both the current and the next stage, allowing instant native audio playback in production when stream URLs are available, while keeping the YouTube player as a fallback.

---

## 1. Objectives
- Achieve near-instant (<500ms) audio playback for the current stage's songs once the user selects them.
- Pre-cache the audio stream URLs of the next stage in the background to ensure a seamless transition between stages.
- Fix the broken initialization race condition caused by preparing multiple songs concurrently.
- Maintain the reliability of the YouTube player fallback in production if stream URL proxies are blocked or fail.

---

## 2. Proposed Approach

We will optimize the system in two parts:

### A. Enable Production Prefetching and Cache-First Playback in `useAudioStream.ts`
1. Update `prefetch` to allow fetching in both development and production.
2. When `prepare(videoId)` is called, check if a stream URL for `videoId` is already present in `urlCache`.
3. If a cached URL is found, immediately switch the active engine to `native`, set the audio element's `.src` to the cached stream URL, and set the status to `ready`. This bypasses the YouTube player initialization overhead completely.
4. If no cached URL is found, proceed with the existing primary logic (YouTube player in PROD, native fallback in DEV).

### B. Implement Background Stage Prefetching in `ItsAHitRiddle.tsx`
1. Destructure the `prefetch` method from `useAudioStream()`.
2. Replace the broken `prepare` loop in `loadStage` with parallel calls to `prefetch` for all songs in the current stage.
3. Also prefetch all songs in the next stage (`idx + 1`) to warm the cache before the user advances.

---

## 3. Implementation Details

### Changes to [useAudioStream.ts](file:///c:/Code/Tax-Refund/src/shared/hooks/useAudioStream.ts)

- Update `prefetch` to run in production:
```typescript
prefetch: useCallback(async (id: string) => {
  if (id) {
    await getStreamUrl(id);
  }
}, [])
```

- Update `prepare` to check for cached stream URLs first:
```typescript
  const prepare = useCallback(async (videoId: string, force = false, retryCount = 0) => {
    if (!videoId) return;
    
    // Check if we already have this video stream URL in cache
    const cachedUrl = urlCache.current.get(videoId);
    if (cachedUrl && !force) {
      Log.info(`Using cached stream URL for native playback: ${videoId}`);
      isLoadingRef.current = null;
      activeIdRef.current = videoId;
      setEngine('native');
      if (audioRef.current) {
        audioRef.current.src = cachedUrl;
        audioRef.current.load();
      }
      statusRef.current = 'ready';
      setStatus('ready');
      setLastError(null);
      setCurrentVideoId(videoId);
      setProgress(0);
      setCurrentTime(0);
      return;
    }

    if (!force && videoId === activeIdRef.current && (statusRef.current === 'ready' || isLoadingRef.current === videoId)) return;
    // ... rest of prepare logic
```

### Changes to [ItsAHitRiddle.tsx](file:///c:/Code/Tax-Refund/src/features/riddles/its-a-hit/ItsAHitRiddle.tsx)

- Update `loadStage` to use `prefetch` and load both the current and the next stage's songs:
```typescript
  const loadStage = (idx: number, allSongs: SongItem[]) => {
    const stage = IT_STAGE_DATA[idx];
    if (!stage) return;

    const filtered = allSongs.filter(s => stage.songIds.includes(s.id));
    
    const shuffled = [...filtered].sort(() => Math.random() - 0.5);
    
    setUserOrder(shuffled);
    setIsRevealed(false);
    setActiveSong(null);
    setIsStageUnlocked(false);
    setValidationResults({});
    setIsButtonShaking(false);

    // Prefetch all songs for the current stage in parallel
    filtered.forEach(song => {
      prefetch(song.youtubeId);
    });

    // Prefetch songs for the next stage (if any)
    if (idx + 1 < IT_STAGE_DATA.length) {
      const nextStage = IT_STAGE_DATA[idx + 1];
      const nextStageSongs = allSongs.filter(s => nextStage.songIds.includes(s.id));
      nextStageSongs.forEach(song => {
        prefetch(song.youtubeId);
      });
    }
  };
```

---

## 4. Verification Plan

### Manual Verification
1. Open the "Its-a-Hit" riddle in local development/production mode.
2. Verify in the Browser Console that prefetch requests are triggered for the current stage (and next stage) songs upon page load.
3. Verify that selecting a vinyl starts playback within ~500ms (instant playback).
4. Verify that transition to the next stage pre-loads songs successfully in the network tab.
