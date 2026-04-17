# Implementation Plan - Fixing Vinyl Audio Mismatch and Glitches

The user reported a sporadic bug where the played audio didn't match the correct song, and the audio level dipped shortly after starting. Investigation revealed a race condition in the audio engine's `prepare` logic and potential stale state usage in the game hook.

## Problem Analysis

1.  **Song Mismatch**: 
    - When transitioning from "Setup" to "Playing", multiple `prepare` calls can occur (one for preloading the candidate, one for the actual mystery song).
    - If these calls happen in quick succession, the YouTube `onReady` callback from the *first* (stale) song might trigger after the *second* (current) song has already started its loading process.
    - Since `onReady` didn't check if the video ID was still the "active" one, it would set the engine status to `ready`.
    - The UI, seeing `ready`, would allow playback. However, the player might still be pointing to the first song, or in a half-transitioned state.
    
2.  **Audio Dimming / Glitches**:
    - Multiple `YT.Player` instances were being created on the same DOM element without destroying the previous ones.
    - This can lead to multiple iframes playing simultaneously or conflicting with each other, causing phasing (which sounds like dimming/hollowness) and volume fluctuations.

## Proposed Changes

### 1. Hardening `useAudioStream.ts`
- **Callback Guarding**: Add checks in `onReady`, `onStateChange`, and `onError` to ensure they only act if the `videoId` they were created for is still the `activeIdRef.current`.
- **Player Lifecycle**: Explicitly `destroy()` any existing YouTube player before creating a new one to prevent orphaned iframes and conflicting listeners.
- **Engine State Integrity**: Ensure `setEngine` and `setStatus` are only called for the most recent request.

### 2. Stabilizing `useVinylGame.ts`
- **Setup Race Guard**: In `setupGame`, ensure we don't use a stale `candidateMystery` if the categories have changed or if a reset just happened.
- **State Cleanup**: Clear preloaded candidate state when `setupGame` begins to avoid crossover between "Setup" preloading and "Playing" initialization.

## Verification Plan

### Manual Testing
1.  **Rapid Start**: Open the setup screen, change categories, and immediately click "Start Game". Verify the correct song plays.
2.  **Category Swapping**: Rapidly click different categories and then "Start". Verify no audio "overlap" or dimming occurs.
3.  **Error Recovery**: Simulate a YouTube block (force native fallback) and verify it doesn't interfere with subsequent song preloading.
