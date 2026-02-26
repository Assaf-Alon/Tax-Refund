# Outer Wilds Ventures - Riddle Design

## 1. What This Is

The "Outer Wilds Ventures" riddle is an 8-stage puzzle sequence inspired by the indie game *Outer Wilds*. It tests game lore and puzzle mechanics through generalized text-answer stages, a custom "Quantum Shard" scrolling puzzle, and a canvas-based "drag to draw" stage for inputting spatial coordinates.

The Riddle Flow consists of:
0. **Welcome Stage**: A themed entry point requiring the player to click a button to begin.
1. **Title: End of the Loop**: A text-based question. "The sun explodes in how many minutes?". (Answer: "22" strict)
2. **Title: The Reckless Traveler**: "Who plays the harmonica deep inside a corrupted seed?" (Answer: "feldspar")
3. **Title: The Blind Terror**: "F*ck this planet." (Answer: "dark bramble")
4. **Title: The Ancient Architects**: "They arrived on The Vessel and built the Ash Twin Project. Who are they?" (Answer: "nomai" or "the nomai")
5. **The Quantum Rule**: A custom stage where a shard image drops out of the viewport on scroll, triggering a state change when the player "looks away".
6. **Coordinates Stage**: A "drag to draw" riddle where the player must connect dots on a 6-dot grid to draw "2906" in order.
7. **Congratulations Stage**: A completion screen ("Mission Accomplished").

## 2. Why this approach was chosen

Instead of duplicating heavily themed elements across different riddles (like the original Spider Lair's `EntranceStage` and `CongratsPage`), generalized versions (`WelcomeStage`, `CongratsStage`) in `src/shared/stages` are utilized with injected theme props. This allows for rapid iteration without code duplication.

- The `TextAnswerStage` allows for rapid addition of lore questions without complex custom UI.
- The "Quantum Shard" mechanic brilliantly repurposes the browser's native `IntersectionObserver` API to mimic the in-game mechanic of quantum objects changing state when not observed. It achieves a memorable interaction with very little code overhead.
- Ending the sequence with the coordinate puzzle matches the thematic pacing of the actual game (where entering coordinates into the Vessel is the final puzzle).

## 3. How it is implemented

### General Components
1. **WelcomeStage (`src/shared/stages/WelcomeStage.tsx`)**: Accepts UI props and specific styling for the entry text/logo.
2. **CongratsStage (`src/shared/stages/CongratsStage.tsx`)**: Accepts completion text props.
3. **TextAnswerStage (`src/shared/stages/TextAnswerStage.tsx`)**: Used for steps 1-4. Utilizes a shared fuzzy matching utility (`isCloseEnough`). It accepts an `exactMatchOnly` toggle for strict numeric answers (e.g., 22).

### Specific Outer Wilds Logic
1. **QuantumStage (`src/features/riddles/outer-wilds/stages/QuantumStage.tsx`)**:
   - Casts a container with immense vertical height (e.g., `min-h-[200vh]`), forcing scroll.
   - Uses `IntersectionObserver` via a React hook/ref to track when the shard image completely exits the viewport.
   - Toggles a `hasLookedAway` state when removed from view. Upon scrolling back up, the shard is gone, replaced by an `onAdvance` button.
2. **DrawSequenceStage (`src/shared/stages/DrawSequenceStage.tsx`)**:
   - Accepts an `expectedDigits` array containing canonical valid drawn paths for numbers (`2`, `9`, `0`, `6`) on a 2x3 grid.
   - Renders SVG lines dynamically by translating paths into undirected edge sets (e.g., `"0-1", "1-3"`). On mouse/pointer release, the accumulated edge set is ordered and verified strictly against canonical versions.
   - Includes color-flashing failure/success UI states. Uses `touch-action: none` and `releasePointerCapture` to block the browser's default scroll behavior during swiping.

### Main Orchestrator (`OuterWilds.tsx`)
1. **State & Theming**: Orchestrates the `stage` prop mapping to components via a standard `switch(stage)` array. Mutates `localStorage` progress via `updateRiddleProgress`. Features a deep space radial gradient background (`#0f172a 0%`, `#000000 100%`) with orange focal highlights.
2. **Dynamic Audio**: Imports `outerWildsTheme` (`assets/Outer Wilds.mp3`) passing it through the shared `useAudio` hook. It specifically ensures the music plays continuously as long as `stage >= 1 && stage < 7`, muting on the final congratulations screen to heighten dramatic effect.

## 4. Verification
- **Routing**: Ensure direct links to `/outer-wilds` render the riddle properly.
- **Scroll Hijacking**: Assure the Quantum Shard disappearance occurs flawlessly via browser API across different device viewports, verifying `min-h` styling constraints.
- **Touch Capabilities**: Validate that dragging strokes on the 6-dot canvas works reliably across iOS and Android browsers without triggering unintended page navigation or pinch-zoom.
- **Continuous Flow**: Ensure `TextAnswerStage` components ignore minor casing/punctuation while the 22-minute constraint correctly enforces an exact match. Background music must sustain looping seamlessly between steps.
