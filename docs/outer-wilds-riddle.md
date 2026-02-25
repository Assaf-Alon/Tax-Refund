# Outer Wilds Ventures - Riddle Design

## 1. What is being changed/added
We are adding a new riddle called "Outer Wilds Ventures", inspired by the indie game *Outer Wilds*. The riddle will follow the standard multi-stage structure (similar to the Spider Lair):
- **Welcome Page**: A themed entry point requiring the player to click a button to begin.
- **Stage 1**: A "drag to draw" riddle where the player must connect dots on a 6-dot grid to draw the numbers "2906" in order.
- **Stage 2**: A text-based question: "The sun explodes in how many minutes?". The player must answer "22".
- **Congratulations Page**: A completion screen.

We will also extract some components to be reusable primitives for future riddles.

## 2. Why this approach was chosen
Instead of duplicating heavily themed elements (like Spider Lair's `EntranceStage` and `CongratsPage`), we will create generic versions (`WelcomeStage`, `CongratsStage`) in `src/shared/stages` that accept theme props (e.g., colors, title, copy). This allows us to rapidly stamp out new riddles with distinct visual identities without code duplication.

For the drawing stage, building on the existing proof-of-concept, we will formalize it into a `LineDrawStage` or a specific `OuterWildsDrawStage` that accepts an expected sequence of inputs. The text input stage will reuse our already established `TextAnswerStage`.

## 3. How it will be implemented

### Generalizing Components
1. **WelcomeStage (`src/shared/stages/WelcomeStage.tsx`)**:
   - Accepts props: `title` (node), `subtitle` (node), `buttonText` (string), `onAdvance` (function), and styling props (e.g., text colors, button glow colors).
2. **CongratsStage (`src/shared/stages/CongratsStage.tsx`)**:
   - Accepts props: `title` (node), `subtitle` (node), `children` (optional custom images/text), and theme styling props.
   - *Note on Refactoring*: We will exclusively build and use these generic components for the Outer Wilds riddle. Refactoring the `SpiderLair` to use them is explicitly **out of scope** for this change to prevent scope creep.

### Implementing the Drag-to-Draw Stage
1. **DrawSequenceStage (`src/shared/stages/DrawSequenceStage.tsx`)**:
   - Building off the POC code (though we will delete `OuterWildsPoc.tsx` and its route afterward).
   - Props: `expectedDigits` (an array of canonical representations or accepted valid paths for each digit), `onAdvance` (function).
   - **Single Drawing Board**: There will be only one 6-dot drawing board on the screen. The user draws digits one after the other. 
   - **Rendering the Lines**: Borrowing directly from the POC, render the connecting lines visually using an absolute `<svg>` element overlaid on the container, manually mapping each dot index to static `(x, y)` coordinates to draw `<line>` strokes between collected dots.
   - **Canonical Path Representation**: A digit can be drawn in multiple ways (e.g., from top-left to bottom-right, or vice versa). To seamlessly handle any valid drawing order, the drawn path will be converted to a set of undirected edges. 
     - *Algorithm*: When a user connects two dots, record the edge by joining the sorted dot indices (e.g., `Math.min(start, end) + '-' + Math.max(start, end)`). Accumulate these into a `Set<string>`. On `pointerUp`, convert the set to an array, sort it alphabetically, and compare it strictly against the sorted expected array. **Important**: Only accept dot connections that are adjacent neighbors based on the 2x3 grid. Also, ensure dots are only pushed to the state if they aren't the previous dot, preventing duplicate nodes and jump artifacts when swiping on touch devices.
     - Expected edge set for `2`: `["0-1", "1-3", "2-3", "2-4", "4-5"]`
     - Expected edge set for `9`: `["0-1", "0-2", "1-3", "2-3", "3-5"]`
     - Expected edge set for `0`: `["0-1", "0-2", "1-3", "2-4", "3-5", "4-5"]`
     - Expected edge set for `6`: `["0-2", "2-3", "2-4", "3-5", "4-5"]`
   - **Touch Device Support**: Use `onPointerDown={(e) => e.currentTarget.releasePointerCapture(e.pointerId)}` on the dots, and add `style={{ touchAction: 'none' }}` to the drawing container to prevent scrolling during native touch drags (derived from the POC).
   - **UI Feedback & State**:
     - A React state (e.g., `currentDigitIndex`) must be maintained to track which digit in `expectedDigits` the user is currently attempting to draw. Visually convey this progress to the user (e.g., displaying placeholders or indicators for how many digits have been successfully drawn).
     - *Success*: If the evaluated edge set matches the current expected digit, the drawn lines should briefly flash green (e.g., stroke `#22c55e`), wait `500ms`, clear the board, and increment `currentDigitIndex` to await the next digit.
     - *Failure*: If the drawn path completes but is incorrect, flash the lines red (stroke `#ef4444`) for `400ms` and clear the board immediately to restart the current digit.
   - When all digits (`2, 9, 0, 6`) are drawn correctly in sequence, `onAdvance` is triggered.

### The Outer Wilds Riddle Component
1. **OuterWilds.tsx (`src/features/riddles/outer-wilds/OuterWilds.tsx`)**:
   - Manages state using the `getRiddleProgress` / `updateRiddleProgress` pattern.
   - **Theme**: Dark space blue background (`radial-gradient(circle, #0f172a 0%, #000000 100%)`), campfire orange highlights (`#f97316`). Use `OuterWildsLogo.png` in the application header or WelcomeStage.
   - **Music**: Once the player finishes the first riddle (draw sequence), start playing background music conditionally using the `useAudio` hook based on state (e.g., `useAudio(riddleProgress >= 2 ? outerWildsTrack : null)`). Import the audio file directly from `./assets/Outer Wilds.mp3`, following the identical pattern established in Spider Lair. It should loop continuously, and `useAudio` handles playback automatically for non-null sources along with cleanup on unmount.
   - **Stage 0**: `WelcomeStage` with "Outer Wilds Ventures", the logo, and "Join the expedition".
   - **Stage 1**: `DrawSequenceStage` expecting `2906` using the canonical representations defined above.
   - **Stage 2**: `TextAnswerStage` asking "The sun explodes in how many minutes?". Accepts exactly `["22"]` (strict string match after typical whitespace trimming; "22 minutes" or words are not accepted). *Implementation Note*: The underlying `TextAnswerStage` utilizes a fuzzy matching utility (`isCloseEnough`) with a 60% similarity threshold. Since "22" must be exact, add an `exactMatchOnly` boolean prop to `TextAnswerStage` (and pipe to `isCloseEnough`) to bypass fuzzy matching natively.
   - **Stage 3**: `CongratsStage` showing mission accomplished.

### Cleanup
1. Delete `OuterWildsPoc.tsx` and remove its route from `App.tsx`.
2. Delete `docs/outer-wilds-poc.md` (or consider it superseded by this document).

### Routing / Wiring
1. Update `src/App.tsx` routes. Change `/outer-wilds-poc` to `/outer-wilds` pointing to `<OuterWilds />`.
2. Add the riddle entry to `src/features/taxes/riddleRegistry.ts` so it appears on the map (if applicable).

## 4. Verification
- Validate the new riddle can be accessed via routing.
- Validate `WelcomeStage` correctly passes through to Stage 1.
- Validate drawing `2`, `9`, `0`, `6` on the dots correctly advances the stage, and mistakes immediately flash red and reset the current digit drawing.
- Validate touching and dragging on mobile devices correctly connects dots without scrolling the page.
- Validate the background music begins playing after successfully passing Stage 1, and stops once navigating away.
- Validate entering `22` in the next stage advances to the `CongratsStage`.
- Validate error states (wrong text input, wrong drawn path) display correctly.
