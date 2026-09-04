# Design Document: Deployed Version Fixes (Leaderboard CEO, Debug Terminal, Vinyl Dragging)

## 1. What is being changed/added

This document addresses three distinct issues discovered in the deployed version (`origin/master`):

1. **LinkedIn Leaderboard CEO Duplication**:
   - In `src/features/riddles/linkedin/stages/LeaderboardStage.tsx`, Bill Gates was appearing at rank 4 in both Crossclimb (Stage 1) and Pinpoint (Stage 2).
   - In Pinpoint, rank 4 should be **Steve Jobs** (`name: "Steve Jobs"`, `avatarUrl: "/images/leaderboard/steve-jobs.png"`), consistent with the existing `MEMBER_SINCE_YEARS` mapping (`"Steve Jobs": 2011`) and pre-existing asset `public/images/leaderboard/steve-jobs.png`.
   - Update tests in `LeaderboardStage.test.tsx` to verify Steve Jobs appears in Pinpoint stage.

2. **Debug Terminal Visibility in Production**:
   - In `src/shared/config/featureFlags.ts`, `SHOW_DEBUG_TERMINAL` was evaluated as `import.meta.env.VITE_SHOW_DEBUG_TERMINAL !== 'false'`, which evaluated to `true` when the environment variable was undefined (the default in production builds).
   - Revert to strict opt-in check: `SHOW_DEBUG_TERMINAL: import.meta.env.VITE_SHOW_DEBUG_TERMINAL === 'true'`, ensuring the floating debug terminal is completely hidden by default in production.

3. **Vinyl Dragging in Herzliya Park Riddle ("It's A Hit")**:
   - In `src/features/riddles/its-a-hit/ItsAHitRiddle.tsx`, recent changes added an `onPointerDown` logging handler to the draggable element *after* spreading `{...listeners}`:
     ```tsx
     <div
       {...attributes}
       {...listeners}
       onPointerDown={(e) => { ... }}
     ```
     Because JSX attributes are evaluated in order, `onPointerDown` overwrote `@dnd-kit`'s internal `listeners.onPointerDown` handler, preventing `@dnd-kit` from detecting pointer start gestures and completely disabling dragging.
   - We will preserve `@dnd-kit`'s event listener by calling `listeners?.onPointerDown?.(e)` or eliminating the redundant interceptor, and configure both `PointerSensor` (with distance constraint 8px) and `TouchSensor` (with delay 200ms, tolerance 5px) matching established patterns in `VinylTimelinePage.tsx` and `CrossclimbStage.tsx` for smooth mobile tap (audio play) vs drag (reorder).

---

## 2. Why this approach was chosen (context)

### Issue 1: Leaderboard CEO
- **Context**: The LinkedIn riddle features three mini-games, each featuring a satirical cameo by a prominent tech CEO in 4th place:
  - Crossclimb (Stage 1): Bill Gates (Microsoft)
  - Pinpoint (Stage 2): Steve Jobs (Apple)
  - Queens (Stage 3): Jeffrey Bezos (Amazon)
  Steve Jobs was already configured in `MEMBER_SINCE_YEARS` with the year 2011 and `steve-jobs.png` already exists in `public/images/leaderboard/`, but Bill Gates was inadvertently pasted into Pinpoint's competitor array.
- **Rejected Alternatives**:
  - *Adding Elon Musk / Mark Zuckerberg*: Requires sourcing/generating new assets and year entries when Steve Jobs was already prepared and intended.

### Issue 2: Debug Terminal Flag Default
- **Context**: The mobile mini debug terminal was introduced during touch audio debugging. Production builds do not define `VITE_SHOW_DEBUG_TERMINAL`, so any check that defaults to `true` when the variable is absent exposes internal debug overlays to end users.
- **Rejected Alternatives**:
  - *Checking `import.meta.env.DEV`*: While DEV mode works for local `npm run dev`, QA on mobile devices often uses production preview/staging builds where `DEV === false` but debugging is still desired via environment variables. Using `import.meta.env.VITE_SHOW_DEBUG_TERMINAL === 'true'` provides clear explicit opt-in for all environments.

### Issue 3: Vinyl Dragging
- **Context**: In React and `@dnd-kit`, `{...listeners}` passes event listeners (`onPointerDown`, `onKeyDown`, etc.) to the target element. Placing another `onPointerDown` handler after `{...listeners}` without delegating to `listeners.onPointerDown(e)` silently swallows the pointer events required for drag gesture detection.
- **Rejected Alternatives**:
  - *Moving `onPointerDown` to parent container*: Overrides the parent container or fails to bubble properly to `@dnd-kit`.
  - *Disabling PointerSensor entirely*: PointerSensor is required for mouse dragging on desktop. By ensuring `{...listeners}` handles the event and adding `TouchSensor` for mobile, both desktop mouse dragging and mobile touch dragging work seamlessly without interfering with song playback clicks.

---

## 3. How it will be implemented

A junior developer can implement this in one shot:

### 3.1 Update `src/shared/config/featureFlags.ts` [MODIFY]
Change `SHOW_DEBUG_TERMINAL` definition:
```typescript
export const FEATURE_FLAGS = {
  /**
   * Controls the visibility of the mobile mini debug terminal overlay.
   * Default: false. Can be enabled via VITE_SHOW_DEBUG_TERMINAL=true in env.
   */
  SHOW_DEBUG_TERMINAL: import.meta.env.VITE_SHOW_DEBUG_TERMINAL === 'true',
} as const;

export const SHOW_DEBUG_TERMINAL = FEATURE_FLAGS.SHOW_DEBUG_TERMINAL;
```

### 3.2 Update `src/features/riddles/linkedin/stages/LeaderboardStage.tsx` [MODIFY]
In `competitors` useMemo under `gameName === "Pinpoint"`, change rank 4 from Bill Gates to Steve Jobs:
```typescript
} else if (gameName === "Pinpoint") {
    return [
        { name: "Roy Peled", time: displayTime * 0.65, rank: 1, avatarUrl: "/images/leaderboard/roy-peled.jpg" },
        { name: "Meshi Peled", time: userTime, rank: 2, isUser: true, avatarUrl: "/images/leaderboard/meshi-peled.jpg" },
        { name: "Zero", time: displayTime * 1.15, rank: 3, avatarUrl: "/images/leaderboard/zero.png" },
        { name: "Steve Jobs", time: displayTime * 1.42, rank: 4, avatarUrl: "/images/leaderboard/steve-jobs.png" },
        { name: "Yves (Eve) Godin", time: displayTime * 1.68, rank: 5, avatarUrl: "/images/leaderboard/yves-godin.png" },
    ];
```

### 3.3 Update `src/features/riddles/linkedin/stages/__tests__/LeaderboardStage.test.tsx` [MODIFY]
Add test assertion checking that Pinpoint leaderboard renders "Steve Jobs" (and Crossclimb renders "Bill Gates", Queens renders "Jeffrey Bezos").

### 3.4 Update `src/features/riddles/its-a-hit/ItsAHitRiddle.tsx` [MODIFY]
1. Import `TouchSensor` from `@dnd-kit/core`:
```typescript
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  DragOverlay
} from '@dnd-kit/core';
```

2. In `SortableVinylItem`, preserve `listeners.onPointerDown`:
```tsx
      <div
        {...attributes}
        {...listeners}
        onPointerDown={(e) => {
          listeners?.onPointerDown?.(e);
          logger.info(`[Touch/Pointer] PointerDown on vinyl #${song.id}`, { pointerType: e.pointerType, isPrimary: e.isPrimary });
        }}
        onClick={() => {
          logger.info(`[Touch/Pointer] onClick triggered on vinyl #${song.id}`);
          onSelect(song);
        }}
      >
```

3. Update sensors in `ItsAHitRiddle`:
```typescript
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 }
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 }
    })
  );
```

---

## 4. Verification Plan

### Automated Tests
1. Run `npm run test` (vitest) to ensure all tests pass:
   - `LeaderboardStage.test.tsx` passes with Steve Jobs verification.
   - All other existing tests pass.
2. Run `npm run build` to verify TypeScript type checking and bundling succeed without errors.

### Manual Verification
1. **Debug Terminal**:
   - Run `npm run dev` with standard environment: verify `<MiniDebugTerminal />` is not rendered anywhere.
   - Run with `VITE_SHOW_DEBUG_TERMINAL=true npm run dev`: verify debug terminal appears.
2. **LinkedIn Leaderboard**:
   - Open LinkedIn riddle and skip to Stage 1 (Crossclimb) leaderboard: Rank 4 is Bill Gates.
   - Skip to Stage 2 (Pinpoint) leaderboard: Rank 4 is Steve Jobs with avatar `steve-jobs.png` and "Member since 2011".
   - Skip to Stage 3 (Queens) leaderboard: Rank 4 is Jeffrey Bezos.
3. **Herzliya Park Vinyl Dragging**:
   - Navigate to "It's A Hit" riddle.
   - Drag vinyl records up and down: verify they drag smoothly and swap positions in the sequence.
   - Click a vinyl record: verify it selects the record and starts playing audio.
   - Reorder cards into chronological order and click "Verify Chronology": verify success sequence unlocks.
