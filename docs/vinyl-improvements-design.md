# Vinyl Timeline Improvements Design

This document outlines the planned improvements for the Vinyl Timeline mini-game, focusing on audio controls, visual polish, and performance optimizations.

## 1. What is being changed?

The following features and fixes will be implemented:
1.  **Audio Pause/Resume**: A feature to pause and resume the current song snippet.
2.  **Continuous Playback During Drag**: Fixing a bug where dragging the vinyl pauses the audio.
3.  **Visual Cleanup (Halo)**: Removing the "ghost" copy of the vinyl that remains in the original position during a drag.
4.  **Optimized Preloading**: Improving the loading UI and pre-fetching logic to eliminate wait times between turns.
5.  **Image Quality**: Upgrading YouTube thumbnails to higher resolution and reducing excessive blur.
6.  **Progress Indicator**: Adding a progress bar to show the remaining time of the song excerpt.

## 2. Why this approach? (Rationale)

### 2.1 Audio Controls (Pause/Resume/Dragging)
- **Rationale**: The current "interrupt-only" model for dragging is jarring. Music is the core of this game; interrupting it during the primary gameplay action (positioning) breaks immersion. Adding pause/resume gives users more control over their listening experience.
- **Alternative**: We considered just letting the audio end and then playing it again, but this feels clunky and wastes the user's "focused listening" time.

### 2.2 Visual Polish (Halo & Images)
- **Rationale**: The "halo" is a common `dnd-kit` side effect when both the original element and the `DragOverlay` are visible. Hiding the original preserves the "physicality" of picking up the vinyl. 
- **Rationale (Images)**: `0.jpg` is a legacy YouTube thumbnail format. Switching to `hqdefault` or `maxresdefault` ensures the art is crisp, fitting the "premium" aesthetic requirement.

### 2.3 Performance & Preloading
- **Rationale**: We want a "zero-wait" experience. `useAudioStream` already fetches proxy URLs, but the UI reflects "loading" prematurely. By checking if a URL is already in cache, we can transition the UI to "Ready" immediately, even if the browser takes a few milliseconds more to buffer the start.

## 3. How it will be implemented

### 3.1 useAudioStream.ts Updates
1.  **Progress Tracking**: Add `progress` (0 to 100) and `currentTime` state. Update them via `onTimeUpdate`.
2.  **Toggle Method**: Implement `togglePlayback()` which calls `audio.play()` or `audio.pause()`.
3.  **Resume Support**: 
    - Modify `playExcerpt` to check: `if (audio.src && audio.currentTime > start && audio.currentTime < end)`. 
    - If true, just `play()`. If false, reset `currentTime = start` before playing.
4.  **Instant Ready**: Modify `isReady` to return `true` if `status === 'ready' || urlCache.current.has(videoId)`. This prevents the spinner if we already have the URL.

### 3.2 UI Logic (VinylTimelinePage.tsx)
1.  **Drag Event**: Remove the `stop()` call from `handleDragStart` to keep music playing.
2.  **Playback Button**:
    - If `status === 'playing'`, show `Pause` icon.
    - If `status === 'paused' || status === 'ready'`, show `Play` icon.
3.  **Progress Bar**: Add a thin (2px) progress bar container above the play button.
    - Background: `bg-white/10`.
    - Inner bar: `bg-rose-500` with width tied to `progress`.

### 3.3 Components (DraggableVinylCard.tsx & VinylCard.tsx)
1.  **Halo Fix**: In `DraggableVinylCard`, set `opacity: isDragging ? 0 : 1` on the original element.
2.  **High-Res Images**: 
    - Update `VinylCard` to use `hqdefault.jpg`.
    - In the "Back Side", add a new `div` for the "Cover Art" that uses the thumbnail with `blur-none` and `rounded-lg`, positioned above the blurred background to provide clarity.

## 4. Verification

### 4.1 Functional Tests
- **Pause/Resume**: Play -> Pause at 5s -> Play -> Confirm it starts at 5s, not 0s.
- **Continuous Drag**: Start music -> Drag vinyl across screen -> Music should not stop.
- **Drag Visuals**: Lift vinyl -> Confirm original position is completely empty (no "halo").

### 4.2 Performance Tests
- **Preloading**: Rapidly move from Turn 1 to Turn 2. Confirm the Play button is clickable instantly without a "Loading" spinner if pre-fetching worked.

### 4.3 Visual Audit
- **Progress Bar**: Music ends -> Progress bar is exactly at 100%.
- **Clarity**: Reveal card -> Confirm the centered cover art is sharp and readable.
