# Design Document: It's a Hit! Keyword Mechanism

## 1. Goal
The goal of this change is to prevent players from advancing through the "It's a Hit!" riddle in Herzliya Park without physically moving to each location. This will be achieved by requiring a "Keyword" that can only be found at the physical location to unlock each stage's riddle and the final congrats page.

## 2. Context & Rationale
Currently, the "It's a Hit!" riddle only requires solving a chronological music puzzle and decoding a location name. Once a player decodes the name (e.g., "LAKE"), they can immediately type it into the app and proceed to the next stage's riddle, even if they haven't physically moved to the lake yet.

By adding a keyword requirement:
- Players must be at the location to find the keyword.
- The scavenger hunt becomes more robust and physically engaged.
- The experience feels more like a real-world game.

## 3. Implementation Plan

### 3.1. Data Model Changes
We will update the `RiddleStage` interface in `src/features/riddles/its-a-hit/data/stages.ts` to include an `entryKeyword` field.

```typescript
export interface RiddleStage {
  // ... existing fields
  entryKeyword: string;
}
```

We will then populate `IT_STAGE_DATA` with the keywords provided:
- **Start (Entrance)**: "anime"
- **Lake**: "popular"
- **Train Station**: "anime again"
- **Lovers Bench**: "poets"
- **Congrats (at Hill)**: "Raanana"

### 3.2. UI Logic Changes
In `ItsAHitRiddle.tsx`, we will implement the following flow:

1.  **Stage Unlocking**:
    - Add a state `isStageUnlocked` (boolean) and `isCongratsUnlocked` (boolean).
    - When a stage loads (including on initial mount), the stage starts as "locked".
    - A `TextAnswerStage` will be shown first, asking for the "Keyword found at [Location Name]".
    - Once the correct keyword is entered, the actual riddle (Vinyl cards) will be revealed.

2.  **Stage Transitions**:
    - When `nextStage` is called (after solving the riddle and entering the next location), `isStageUnlocked` will be reset to `false`.
    - This ensures the next stage also starts with a keyword requirement.

3.  **Congrats Page**:
    - When all stages are complete, instead of showing the `CongratsStage` immediately, we will show a final `TextAnswerStage` asking for the keyword found at the Hill ("Raanana").
    - Once entered, the final congrats message will be shown.

### 3.3. Content Updates
The `CongratsStage` will be updated with the message:
> "Up next - Raanana Park! Might want to check out the lake there as well..."

## 4. Proposed Changes

### `src/features/riddles/its-a-hit/data/stages.ts`
- Update interface `RiddleStage`.
- Add `entryKeyword` to all stages in `IT_STAGE_DATA`.

### `src/features/riddles/its-a-hit/ItsAHitRiddle.tsx`
- Add state `isStageUnlocked` and `isCongratsUnlocked`.
- Modify the render logic to show the keyword entry screen if not unlocked.
- Update `nextStage` to reset the unlock state.
- Implement the "Congrats" keyword check.
- Update the congrats message.

## 5. Verification
1.  **Automated/Manual Verification**:
    - Open the riddle. Verify it asks for "anime" before showing the first riddle.
    - Enter "anime", solve the riddle (L-A-K-E), type "lake".
    - Verify it then asks for "popular" before showing the Lake riddle.
    - Repeat for all stages.
    - Verify the final "Raanana" keyword check.
    - Verify the final message appears correctly.
2.  **Edge Cases**:
    - Refreshing the page: Should re-ask for the keyword of the current stage.
    - Wrong keyword: Should show an error message and stay locked.
