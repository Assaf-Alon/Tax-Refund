# Outer Wilds Ventures - Stage Additions

## 1. What This Is

This document outlines the addition of two new stages to the existing Outer Wilds riddle flow. These stages introduce new interactive mechanics based on browser APIs and SVG manipulation, staying true to the game's core gameplay loop of learning rules and applying them.

The new stages to be added are:
1.  **Ghost Matter River**: An SVG tracing puzzle where the player must "drag and draw" a path safely through a hazardous area.
2.  **Quantum Entanglement**: A puzzle that requires the player to minimize or hide the browser tab, utilizing the Page Visibility API.

Additionally, a new text-based question will be added: "What powers the Ash Twin Project?".

## 2. Why this approach was chosen

The goal is to elevate the riddle sequence beyond simple text-based questions and introduce mechanics that mimic the actual gameplay of Outer Wilds, specifically its focus on learning and applying physical "rules".

*   **Ghost Matter River**: Captures the feeling of carefully navigating dangerous environments (like Dark Bramble or Ghost Matter patches). Utilizing SVG tracing provides a tactile, "drag to draw" experience that fits the existing mechanics (like the coordinate drawing).
*   **Quantum Entanglement**: Mimics the "Rule of Quantum Entanglement" (where you must be in pitch black to travel with a quantum object). Using the Page Visibility API (`document.hidden`) is a clever, meta way to achieve this "not looking" mechanic in a web environment, similar to how Intersection Observer was used for the "Look Away" rule.
*   **"What powers the Ash Twin Project?"**: A concise question that tests a major lore revelation (the Supernova) without requiring extensive context.

## 3. How it is implemented

### The New Flow

The updated flow will look like this:
0.  Welcome Stage
1.  Title: End of the Loop. "The sun explodes in how many minutes?" (Answer: "22")
2.  Title: The Reckless Traveler. "Who plays the harmonica deep inside a corrupted seed?" (Answer: "feldspar")
3.  The Rule of Quantum Imaging. (Existing Intersection Observer stage)
4.  Title: The Ancient Architects. "They arrived on The Vessel and built the Ash Twin Project. Who are they?" (Answer: "nomai" or "the nomai")
5.  **[NEW] Title: The Ultimate Power**. "What powers the Ash Twin Project?" (Answer: "supernova", "the sun", "the sun exploding", "sun")
6.  **[NEW] The Ghost Matter River**. SVG tracing puzzle.
7.  **[NEW] Rule of Quantum Entanglement**. (Page Visibility API stage)
8.  Title: The Blind Terror. "F*ck this planet." (Answer: "dark bramble")
9.  Coordinates Stage. (Existing 6-dot drawing puzzle)
10. Congratulations Stage.

### Implementation Details: The Ultimate Power (Text Answer)

This will utilize the existing `TextAnswerStage` component.
*   **Question**: "What powers the Ash Twin Project?"
*   **Valid Answers**: `["supernova", "the sun", "the sun exploding", "sun"]`

### Implementation Details: Ghost Matter River (`src/features/riddles/outer-wilds/stages/GhostMatterRiverStage.tsx`)

This new component will require:
1.  **SVG Canvas**: An SVG element with at least two paths:
    *   `safe-path` (e.g., water/river)
    *   `hazard-path` (e.g., ghost matter/dirt)
2.  **Pointer Tracking**: Listeners for `pointerdown`, `pointermove`, and `pointerup` (or `touchstart`/`touchmove`/`touchend`).
3.  **Collision Detection**: As the pointer moves, we need to determine if it is remaining within the `safe-path` bounds. We can investigate using `document.elementFromPoint(x, y)` during the drag, or mathematical checks if the paths are simple enough. *Self-correction: pure mathematical checks might be complex. Relying on SVG pointer events might be tricky due to capturing. The most robust way for a "drag to trace" might involve creating invisible "checkpoints" along the safe path that the user must drag over in sequence without touching a "hazard" area.*
    *   **Revised Approach**: Instead of complex path tracing, let's use a grid or distinct bounding boxes. The player must trace a continuous line (like the coordinate stage) but must avoid "ghost matter" nodes and only touch "water" nodes to cross from top to bottom.
    *   *Alternative Revised Approach (Closer to original intent)*: A canvas-based approach might be easier for collision detection. Draw the safe zone in one color (e.g., invisible bounding box), hazard in another. On drag, check the pixel data under the pointer. If they hit the hazard, reset.
    *   Let's stick to the simplest, most robust web approach first: A maze built of HTML elements. Dragging starts at the top. `onPointerEnter` on "wall" elements triggers a reset/flash. Taking the pointer up before the end triggers a reset. Successfully reaching the bottom triggers `onAdvance`.

### Implementation Details: Rule of Quantum Entanglement (`src/features/riddles/outer-wilds/stages/QuantumEntanglementStage.tsx`)

This component will be simpler than the scroll stage.
1.  **UI**: Display text: "To reach the Sixth Location, you must cease observing your surroundings entirely." Perhaps display an image of a Quantum Shard or the Tower of Quantum Trials.
2.  **Logic**:
    *   Use a `useEffect` hook to attach a `visibilitychange` event listener to the `document`.
    *   Track State: `hasHidden` (boolean).
    *   If `document.hidden` or `document.visibilityState === 'hidden'` becomes true, set `hasHidden` to true.
    *   When the event fires again and `document.visibilityState === 'visible'`, check if `hasHidden` is true. If yes, trigger `onAdvance()`.
    *   Ensure the event listener is cleaned up on unmount.

## 4. Verification

1.  **Ultimate Power**: Ensure the accepted answers correctly trigger advancement, and variations (like "A supernova") are handled if necessary, or strictly checked.
2.  **Ghost Matter River**:
    *   Verify tracking starts correctly on pointer down.
    *   Verify touching the hazard area immediately resets the puzzle (visually flash green/white) and requires starting from the beginning.
    *   Verify leaving the puzzle area or lifting the pointer prematurely resets the puzzle.
    *   Verify reaching the end successfully advances the stage.
    *   Test heavily on mobile devices (touch events) to prevent default scrolling while dragging.
3.  **Quantum Entanglement**:
    *   Verify the stage does *not* advance if the user just waits.
    *   Verify minimizing the browser, switching to another tab, or locking a mobile device and then returning successfully triggers the advancement.
4.  **Audio**: Ensure the background music continues to play seamlessly across all these new stages without resetting or stopping.
5.  **State Management**: Verify that refreshing the page on any of the new stages correctly resumes them from `localStorage`.
