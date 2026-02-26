# Outer Wilds Ventures - Riddle Design

## 1. What This Is

The "Outer Wilds Ventures" riddle is an 8-stage puzzle sequence inspired by the indie game *Outer Wilds*. It tests game lore and puzzle mechanics through generalized text-answer stages, custom mechanics based on physical rules (quantum mechanics, ghost matter), and a canvas-based "drag to draw" stage for inputting spatial coordinates.

The Riddle Flow consists of:
0. **Welcome Stage**: A themed entry point requiring the player to click a button to begin.
1. **Title: End of the Loop**: A text-based question. "The sun explodes in how many minutes?". (Answer: "22" strict)
2. **Title: The Reckless Traveler**: "Who plays the harmonica deep inside a corrupted seed?" (Answer: "feldspar")
3. **The Rule of Quantum Imaging**: A custom stage where a shard image drops out of the viewport on scroll, triggering a state change when the player "looks away".
4. **Title: The Ancient Architects**: "They arrived on The Vessel and built the Ash Twin Project. Who are they?" (Answer: "nomai" or "the nomai")
5. **Title: The Ultimate Power**: "What powers the Ash Twin Project?" (Answer: "supernova", "the sun", "the sun exploding", "sun")
6. **The Ghost Matter River**: A "Memory Maze" tracing puzzle where the player must "launch a scout" to reveal invisible hazards and draw a safe path to the end.
7. **Rule of Quantum Entanglement**: A puzzle that requires the player to minimize or hide the browser tab (cease observation), utilizing the Page Visibility API.
8. **Title: The Blind Terror**: "F*ck this planet." (Answer: "dark bramble")
9. **Coordinates Stage**: A "drag to draw" riddle where the player must connect dots on a 6-dot grid to draw "2906" in order.
10. **Congratulations Stage**: A completion screen ("Mission Accomplished").

## 2. Why this approach was chosen

Instead of duplicating heavily themed elements across different riddles, generalized versions (`WelcomeStage`, `CongratsStage`) in `src/shared/stages` are utilized with injected theme props. This allows for rapid iteration without code duplication.

- The `TextAnswerStage` allows for rapid addition of lore questions without complex custom UI.
- The **"Quantum Shard"** mechanic brilliantly repurposes the browser's native `IntersectionObserver` API to mimic the in-game mechanic of quantum objects changing state when not observed.
- The **"Rule of Quantum Entanglement"** mimics the requirement to be in total darkness to travel with a quantum object by utilizing the Page Visibility API (`document.hidden`).
- **"Ghost Matter River"** recreates the fear of navigating invisible Ghost Matter. A dark grid hides the path; the player must "Launch Scout" to temporarily illuminate hazards in green, memorize the safe route, and blindly trace a path (leaving a cyan ripple trail) without touching the Ghost Matter.
- Ending the sequence with the **coordinate puzzle** matches the thematic pacing of the actual game (where entering coordinates into the Vessel is the final puzzle).

## 3. How it is implemented

### General Components
1. **WelcomeStage (`src/shared/stages/WelcomeStage.tsx`)**: Accepts UI props and specific styling for the entry text/logo.
2. **CongratsStage (`src/shared/stages/CongratsStage.tsx`)**: Accepts completion text props.
3. **TextAnswerStage (`src/shared/stages/TextAnswerStage.tsx`)**: Used for text questions. Utilizes a shared fuzzy matching utility (`isCloseEnough`). It accepts an `exactMatchOnly` toggle for strict numeric answers (e.g., 22).

### Specific Outer Wilds Logic
1. **QuantumStage (`src/features/riddles/outer-wilds/stages/QuantumStage.tsx`)**:
   - Casts a container with immense vertical height (e.g., `min-h-[200vh]`), forcing scroll.
   - Uses `IntersectionObserver` via a React hook/ref to track when the shard image completely exits the viewport.
   - Toggles a `hasLookedAway` state when removed from view. Upon scrolling back up, the shard is gone, replaced by an `onAdvance` button.
2. **GhostMatterRiverStage (`src/features/riddles/outer-wilds/stages/GhostMatterRiverStage.tsx`)**:
   - A 10x5 HTML element grid rendering `hazard`, `safe`, `start`, and `goal` nodes.
   - A `launchScout` function triggers a 2.5s timeout that conditionally changes CSS to reveal hazard tiles.
   - Dragging logic relies on `pointerdown`, `pointermove`, and `pointerup` on the container, using `document.elementFromPoint` to track the exact tile under the finger and update a `Set` to render a ripple trail.
   - *Note on mobile handling:* To prevent the browser's native "pull-to-refresh" rubber-banding which dragged the entire viewport down prematurely when ending a trace, the container uses the Tailwind `overscroll-none` class, explicitly releases the pointer capture `releasePointerCapture(e.pointerId)` on cleanup, and triggers `window.scrollTo(0, 0)` on success.
3. **QuantumEntanglementStage (`src/features/riddles/outer-wilds/stages/QuantumEntanglementStage.tsx`)**:
   - Uses a `useEffect` hook to attach a `visibilitychange` event listener to the `document`.
   - Tracks if the document becomes hidden (`document.hidden`). Once it returns to visible, triggers `onAdvance()`.
4. **DrawSequenceStage (`src/shared/stages/DrawSequenceStage.tsx`)**:
   - Accepts an `expectedDigits` array containing canonical valid drawn paths for numbers (`2`, `9`, `0`, `6`) on a 2x3 grid.
   - Renders SVG lines dynamically by translating paths into undirected edge sets. On pointer release, the accumulated edge set is ordered and verified strictly against canonical versions.

### Main Orchestrator (`OuterWilds.tsx`)
1. **State & Theming**: Orchestrates the `stage` prop mapping to components via a standard `switch(stage)` array. Mutates `localStorage` progress via `updateRiddleProgress`. Background is a deep space radial gradient (`#0f172a 0%`, `#000000 100%`).
2. **Dynamic Audio**: Imports `outerWildsTheme` passing it through the shared `useAudio` hook. It specifically ensures the music plays continuously across step transitions, stopping only on the final congratulations screen to heighten dramatic effect.

## 4. Verification
- **Routing**: Ensure direct links to `/outer-wilds` render the riddle properly.
- **Scroll Hijacking (Quantum)**: Assure the Quantum Shard disappearance occurs flawlessly via browser API across different device viewports.
- **Background API (Entanglement)**: Verify minimizing the browser tab successfully triggers the advancement.
- **Touch Capabilities (Draw / Ghost Matter)**: Validate that tracing paths on mobile devices does not trigger unintended page navigation (pull-to-refresh) or pinch-zoom, and correctly resets upon hitting a hazard element.
- **Continuous Flow**: Ensure `TextAnswerStage` components ignore minor casing/punctuation. Background music must sustain looping seamlessly between steps.
