# Design Document: "It's a hit" Mobile Audio Debugging & Mini Terminal

## 1. What is being changed/added

This document proposes adding a verbose, mobile-friendly **Mini Debug Terminal** overlay to the "It's a hit" riddle (`ItsAHitRiddle.tsx`) and enhanced logger instrumentation inside `useAudioStream.ts` and `VinylCard.tsx`.

The goal is to diagnose and verify the root causes of the mobile playback bug where:
1. Tapping a vinyl record highlights it with a green aura (`isActive = true`) but fails to start audio playback on the first tap.
2. Tapping a second time starts audio, but the vinyl card remains static and does not spin (`isPlaying` state mismatch/stale UI).

### Components to modify/add:
1. `src/shared/components/Debug/MiniDebugTerminal.tsx` [NEW]: A floating, interactive mini terminal overlay visible directly on mobile screens with clear severity styling (errors highlighted in bold red).
2. `src/shared/hooks/useAudioStream.ts` [MODIFY]: Verbose event logging for user gesture context, state changes, stream proxy selection, YouTube Iframe API state transitions, and audio play promise rejections.
3. `src/features/riddles/its-a-hit/ItsAHitRiddle.tsx` [MODIFY]: Mounting the `MiniDebugTerminal`, adding explicit event-flow logging (tap detection, `dnd-kit` pointer triggers vs `onClick`, state transitions).

---

## 2. Why this approach was chosen & Root Cause Theories

### Theory 1: Mobile Autoplay Policy & Loss of User Gesture Context across Async Boundary
* **Mechanism**: In `ItsAHitRiddle.tsx`, `handleSelectSong` is an `async` callback. On the first click of an un-cached record, it executes:
  ```ts
  setActiveSong(song); // Sync: Green aura activates
  stop();              // Sync: Audio stops
  await prepare(song.youtubeId); // ASYNC: Network fetch / YT iframe initialization
  playExcerpt(song.youtubeId, song.startTime, 0); // ASYNC BOUNDARY CROSSED
  ```
* **Why it fails on Mobile**: iOS Safari and Android Chrome require `HTMLAudioElement.play()` or `ytPlayer.playVideo()` to execute strictly inside a **synchronous user gesture stack** (e.g. `onClick` / `touchend`). The `await prepare()` pauses execution across microtasks/macrotasks. By the time `playExcerpt` is called, the browser has revoked the user gesture token and silently blocks playback.
* **Why second tap works partially**: Tapping the record a second time triggers `currentActiveId === clickedSongId`, calling `togglePlayback()`. Because `prepare` finished during the first tap, `togglePlayback()` executes `.play()` / `.playVideo()` synchronously within the second click handler turn.

### Theory 2: Touch / Pointer Event Interception by `dnd-kit`
* **Mechanism**: `SortableVinylItem` attaches `{...attributes}` and `{...listeners}` from `dnd-kit`'s `useSortable` directly to the wrapper `div` containing `onClick={() => onSelect(song)}`.
* **Why it fails on Mobile**: `dnd-kit`'s `PointerSensor` / `TouchSensor` intercepts `pointerdown`/`touchstart` to handle drag sorting. On mobile browsers, this can consume pointer events, delay synthetic `onClick` triggers, or cause race conditions between drag activation and selection.

### Theory 3: Off-screen YouTube IFrame Throttling & Stale `isPlaying` State
* **Mechanism**: `VinylCard` determines disc rotation using `isPlaying={isPlaying && isActive}`. `isPlaying` is derived from `status === 'playing'` in `useAudioStream.ts`.
* **Why it fails on Mobile**: In `useAudioStream.ts`, `status` is set to `'playing'` only when YouTube fires `onStateChange = YT.PlayerState.PLAYING` or native audio fires `onplaying`. On mobile devices, off-screen hidden IFrames (`top: -1000px`) are heavily throttled by mobile browser rendering engines. If the initial `.playVideo()` call was suppressed by autoplay policy or delayed by iframe loading, `onStateChange` never fires, leaving `status` as `'ready'` or `'paused'`. Consequently, `isPlaying` remains `false`, and the record does not spin.

### Alternatives Considered & Rejected:
* **Browser Console Only (`console.log`)**: Rejected because inspecting mobile browser logs (e.g. Safari Web Inspector over USB or Chrome Remote Debugging) requires external hardware setups that are difficult for quick on-device testing. An on-screen Mini Debug Terminal provides instant visibility.
* **Alert Popups (`alert()`)**: Rejected because blocking modal alerts interrupt touch flow and break user gesture handling.

---

## 3. How it will be implemented

### Step 1: Create `MiniDebugTerminal.tsx`
Create `src/shared/components/Debug/MiniDebugTerminal.tsx`:
- Render a bottom-docked or collapsible floating container with `z-index: 9999`.
- Store log entries in state with `{ id, timestamp, level: 'info' | 'warn' | 'error' | 'success', message, details }`.
- Display color-coded log entries:
  - **ERROR**: Dark red background (`bg-rose-950/80`), bright red text (`text-rose-400`), bold error icon / border.
  - **WARN**: Dark amber background (`bg-amber-950/50`), yellow text (`text-amber-300`).
  - **INFO**: Slate/Cyan text (`text-cyan-400`).
  - **SUCCESS**: Emerald text (`text-emerald-400`).
- Provide controls: Expand/Collapse, Clear Logs, Filter by Level, Auto-scroll to bottom toggle.
- Listen to a global event emitter or custom hook `useDebugLogger()`.

### Step 2: Global Logger / Event Bus Hook
Enhance `window._audioLogs` or introduce a lightweight logger utility (`src/shared/utils/logger.ts`) that publishes log events to subscribers (such as `MiniDebugTerminal`).
Update `useAudioStream.ts` to log detailed steps:
- User gesture initiation timestamp.
- Stream URL fetch timing (cache hit vs network fetch latency).
- Synchronous vs asynchronous execution bounds.
- Catching `.play()` promise rejections (`NotAllowedError: play() failed because the user didn't interact with the document first`).
- Native vs YouTube engine switching.
- `onStateChange` YT player events.

### Step 3: Integrate Terminal into `ItsAHitRiddle.tsx`
- Import and render `<MiniDebugTerminal />` at the root of `ItsAHitRiddle.tsx`.
- Wrap record tap handlers with logging:
  - Tapping a record: Log timestamp, `song.id`, `hasUserGesture`, current `activeSong.id`, whether `prepare` is needed.
  - dnd-kit `onDragStart` / `onDragEnd` logs to trace touch interference.

---

## 4. Verification Plan

### Automated Tests
- Run `npm run test` or `vitest` to ensure no existing riddle logic or test suites are broken.

### Manual Verification on Mobile & Desktop
1. Open the "It's a hit" riddle page on mobile (or Chrome Mobile Emulation with touch enabled).
2. Verify the Mini Debug Terminal is visible and can be expanded/collapsed.
3. Tap an unselected vinyl record:
   - Observe log output: Check if `Autoplay Blocked` or `NotAllowedError` error appears in red.
   - Trace gesture timeline from `onClick`/`pointerdown` to `prepare` and `playExcerpt`.
4. Tap the record a second time:
   - Observe `togglePlayback` log output and YouTube state transition logs.
   - Verify if `isPlaying` status matches the visual spinning animation of `VinylCard`.
5. Perform drag-and-drop sorting on mobile to verify if `dnd-kit` pointer listeners log interference during record selection.
