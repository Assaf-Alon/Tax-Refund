# LinkedIn Games Improvements Design

This document outlines the proposed changes to the LinkedIn games (Pinpoint and Crossclimb) to address user feedback and fix bugs.

## What is being changed?

1.  **Pinpoint**: The guess textbox will now reset (clear) after an incorrect guess, allowing the user to immediately type a new guess without manual deletion.
2.  **Crossclimb**: The drag-and-drop interaction will be optimized for smoother performance on PC by refining sensors and transitions.

## Why this approach?

### Pinpoint Textbox Reset
The lack of reset forces users to manually delete their previous guess, which is a poor UX pattern in a fast-paced game. Clearing the input on failure is the standard behavior in LinkedIn's native games.

### Crossclimb Smoothness
The current "jankiness" on PC is likely due to:
-   **Competing Transitions**: The `SortableRow` component has its own CSS transition (`transition-all duration-300`) which competes with `dnd-kit`'s inline styling during dragging.
-   **Sensor Sensitivity**: The `PointerSensor` might be too sensitive or lacking appropriate constraints for mouse users.
-   **Layout Shifts**: Lack of vertical axis restriction can lead to horizontal "drifting" during drag, which feels unpolished.

**Alternative Considered**: Using `react-beautiful-dnd`.
**Rejected**: `@dnd-kit` is already integrated and is generally more performant and modern. Adjusting its configuration is a lighter and more targeted fix.

How it will be implemented

### 0. Prerequisites
- Install `@dnd-kit/modifiers` to provide standard vertical axis restriction and window boundary enforcement.

### 1. Pinpoint Fix

In `PinpointStage.tsx`, modify `handleGuess`:
-   Add `setGuess('');` inside the `else` block (incorrect guess).
-   Ensure the reset happens immediately or after a slight delay to allow the "shake" animation to be visible with the old text if desired (though immediate reset is usually better for typing).

### 2. Crossclimb Fix
### Crossclimb Game Optimization
#### [MODIFY] [package.json](file:///home/cowclaw/Tax-Refund/package.json)
- Add `@dnd-kit/modifiers` to dependencies.

#### [MODIFY] [CrossclimbStage.tsx](file:///home/cowclaw/Tax-Refund/src/features/riddles/linkedin/stages/CrossclimbStage.tsx)
- Import `restrictToVerticalAxis` and `restrictToWindowEdges` from `@dnd-kit/modifiers`.
- Add `modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}` to `<DndContext>`.
In `CrossclimbStage.tsx`:
-   **Remove `transition-all` from sortable items during drag**: Use the `transition` provided by `useSortable` more effectively and disable the component's internal transition while `isDragging` is true.
-   **Add Vertical Constraints**: Use `@dnd-kit/modifiers` (specifically `restrictToVerticalAxis` and `restrictToWindowEdges`) to ensure the row stays aligned.
-   **Refine Pointer Sensor**: Adjust `activationConstraint` if needed.
-   **Hardware Acceleration**: Ensure `transform: translate3d(...)` is used (default in `dnd-kit`'s `CSS.Transform.toString`).

## Verification

### Automated Tests
-   Verify `PinpointStage` resets the guess state on incorrect submission.
-   (Optional) Check `CrossclimbStage` still functions correctly with new modifiers.

### Manual Verification
-   **Pinpoint**: Open the game, type a wrong guess, and confirm the textbox clears.
-   **Crossclimb**: Test drag and drop on PC. Verify it feels "snappier" and stays strictly vertical.
-   **Mobile Check**: Test on a mobile viewport (Chrome DevTools) to ensure touch interaction is still smooth.
