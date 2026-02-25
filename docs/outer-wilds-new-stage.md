# Outer Wilds - Additional Stages Design

## 1. What is being changed/added
We are inserting four new stages into the Outer Wilds riddle flow. These stages test game lore and utilize existing text answer mechanics, with one custom "Quantum" stage involving scrolling. The stages will be reordered to create a better flow.

**Current flow:**
0. Entrance Stage
1. Draw Sequence Stage
2. Text Answer Stage (22 minutes)
3. Congrats

**New flow:**
0. Entrance Stage
1. Text Answer Stage: End of the Loop (22 minutes)
2. Text Answer Stage: The Reckless Traveler (Feldspar)
3. Text Answer Stage: The Blind Terror (Dark Bramble)
4. Text Answer Stage: The Ancient Architects (Nomai)
5. Custom Stage: The Quantum Rule
6. Draw Sequence Stage (Coordinates)
7. Congrats

## 2. Why this approach was chosen
The user wants more stages to pad out the Outer Wilds riddle section.
* Using the existing `TextAnswerStage` allows for rapid addition of high-quality lore questions without complex custom UI.
* The "Quantum Shard" mechanic is an iconic Outer Wilds puzzle. Using the browser's native Intersection Observer API provides a slick, clever way to replicate "looking away" in a web browser with very little code overhead.
* Moving the coordinate drawing puzzle to the end makes thematic sense, as finding the coordinates of the Eye of the Universe is the final puzzle in the actual game.

## 3. How it will be implemented

### 3.1 New Components
Create `src/features/riddles/outer-wilds/stages/QuantumStage.tsx`.

* **Functionality**:
    * Render an image of a quantum shard in a container with a lot of vertical space (e.g., `min-h-[200vh]`), forcing the user to scroll to see the whole page.
    * Use `IntersectionObserver` (or a React library/hook if already available, otherwise a simple `useRef` and `useEffect` with the native API) to track when the shard image is 100% out of the viewport.
    * Maintain a state `hasLookedAway` (boolean).
    * When the shard exits the viewport, `hasLookedAway` becomes true.
    * When the user scrolls back up (or if the viewport area holding the shard comes back into view):
        * If `hasLookedAway` is `false`, render the shard image.
        * If `hasLookedAway` is `true`, render an empty space or a button that calls `onAdvance()`.
    * Add some instructional text at the top ("I exist... but the moment you look away, I am gone.") and at the very bottom ("You are no longer observing. Scroll back up.") to guide the user.

### 3.2 Updating `OuterWilds.tsx`
Update `renderStage` in `src/features/riddles/outer-wilds/OuterWilds.tsx` to handle the new state indices (0 through 7). 

**Important:** Extract the `theme` prop currently used in the 22 Minutes `TextAnswerStage` into a constant (e.g., `const SHARED_TEXT_THEME = { ... }`) outside the component to reuse it across all text stages instead of duplicating it.

* **Stage 0 (Keep Existing)**: Welcome Stage
* **Stage 1 (Formerly Stage 2)**: 22 Minutes
    * Use `exactMatchOnly={true}`.
* **Stage 2 (New)**: The Reckless Traveler
    * Title: "The Reckless Traveler"
    * Prompt: "Who plays the harmonica deep inside a corrupted seed?"
    * Accepted Answers: `["feldspar"]`
    * Use `exactMatchOnly={false}` to allow for fuzzy matching.
* **Stage 3 (New)**: The Blind Terror
    * Title: "The Blind Terror"
    * Prompt: "F*ck this planet."
    * Accepted Answers: `["dark bramble"]`
    * (No image, just text). `exactMatchOnly={false}`.
* **Stage 4 (New)**: The Ancient Architects
    * Title: "The Ancient Architects"
    * Prompt: "They arrived on The Vessel and built the Ash Twin Project. Who are they?"
    * Accepted Answers: `["nomai", "the nomai"]`
    * `exactMatchOnly={false}`.
* **Stage 5 (New)**: The Quantum Rule
    * Render the new `<QuantumStage onAdvance={handleAdvance} />`
* **Stage 6 (Formerly Stage 1)**: Draw Sequence Stage
    * Render `<DrawSequenceStage ... />` with existing props.
* **Stage 7 (Formerly Stage 3)**: Congrats Stage

Update `totalStages` in `<DevSkipButton>` to `8` (since we now have stages 0 through 7).
Update the music logic to ensure `outerWildsTheme` plays from stage 1 through stage 6 (`stage >= 1 && stage < 7`).

### 3.3 Assets
Find or generate a placeholder image for the Quantum Shard if a specific asset doesn't exist, and place it in `src/features/riddles/outer-wilds/assets/`. Provide it via generic import from within `QuantumStage`.

## 4. Verification
1. **Manual Testing**:
    * Enter the Outer Wilds riddle from the admin dashboard or direct link.
    * Verify the new order: Entrance -> 22 Minutes -> Feldspar -> Dark Bramble -> Nomai -> Quantum -> Draw -> Congrats.
    * Verify the Text Answer stages accept the correct answers (ignoring case, utilizing the existing component logic).
    * Specifically test the `<QuantumStage />`:
        * Ensure the page scrolls.
        * Ensure the shard is visible initially.
        * Scroll down until the shard is completely off-screen.
        * Scroll back up to the top.
        * Verify the shard is gone and the "Advance" / "Proceed" button has appeared in its place.
        * Verify clicking the button advances to the drawing stage.
2. **Audio Check**: Verify the main theme continues to loop correctly across all 7 active riddle stages and stops/clears out on the Congrats screen (if that is the intended behavior).
