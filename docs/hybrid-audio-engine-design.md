# Design: Hybrid Production Audio Engine

Currently, audio streaming in the "Vinyl Timeline" game is unstable in production (GitHub Pages) because it relies on third-party proxies (Piped/Invidious) which are prone to CORS blocks, rate limiting, and YouTube's IP-binding restrictions.

This document proposes a robust "Hybrid Audio Engine" for `useAudioStream.ts` that uses the official YouTube IFrame API in production, with a resilient proxy-based fallback.

## 1. Objectives
- Eliminate CORS and rate-limiting issues in production.
- Maintain fast development iteration with local proxies.
- Provide a reliable fallback for videos that restrict embedding (Error 150).
- Keep the consumer API of `useAudioStream` unchanged.

## 2. Proposed Approach: Dual-Engine Hook

The hook will manage two internal playback mechanisms and switch between them based on the environment and video support.

### A. Engine 1: Invisible YouTube IFrame (Primary Production)
- **Why**: IFrames are exempt from CORS for content display. Traffic goes through official Google endpoints.
- **Implementation**: 
    - A hidden `div` (managed by the hook) is used to initialize `YT.Player`.
    - Audio is controlled via `cueVideoById`, `seekTo`, `playVideo`.
    - Progress is tracked by polling `getCurrentTime()` every 100ms.

### B. Engine 2: Native Audio Element (Dev / Fallback)
- **Why**: Low overhead, works with standard stream URLs.
- **Implementation**: Uses standard `HTMLAudioElement` with source URLs fetched from Piped or local proxies.

## 3. Implementation Details

### IFrame API Management
We will ensure the YouTube IFrame API script is loaded exactly once.
```typescript
const ensureYTAPI = () => {
    if (window.YT) return Promise.resolve();
    return new Promise<void>((resolve) => {
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
        window.onYouTubeIframeAPIReady = () => resolve();
    });
};
```

### Refactored Hook Logic: `prepare(videoId)`
1. **Prod Mode**: 
   - Load YT API.
   - Initialize/Update `YT.Player`.
   - If `onError` fires with code `150` (embedding restricted), proceed to **Fallback**.
2. **Fallback / Dev Mode**:
   - Fetch stream URL using the improved `getStreamUrl` (with proxy rotation).
   - Load into `<audio>` element.

### Proxy Rotation Strategy
If the primary Piped fetch fails, we will try alternative proxies:
1. `api.allorigins.win/raw?url=`
2. `api.codetabs.com/v1/proxy?quest=`
3. Google Gadget Proxy (fast but picky).

## 4. Verification Plan

### Automated Tests
- Verify that `prepare` returns `ready` status for a standard video.
- Verify that `stop` correctly halts both the Audio element and the YT Player.
- Mock an `Error 150` in the YT Player and verify the hook switches to the Audio element.

### Manual Verification
1. **Dev Environment**: Inspect Network tab to ensure `/api/stream` (local proxy) is being used.
2. **Prod Simulation (build + serve)**:
   - Ensure a hidden IFrame is created.
   - Verify audio plays even on videos that previously had CORS issues.
   - Test on Mobile: Trigger playback via a button click to ensure "user interaction" requirements are met.
