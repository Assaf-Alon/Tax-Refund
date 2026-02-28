# Expedition 33 - Riddle Design

## 1. What This Is

The "Expedition 33" riddle is a sequence inspired by the upcoming game *Clair Obscur: Expedition 33*. It blends text-based knowledge checks about the game's lore (characters, antagonists) with custom interactive stages that perfectly mimic the game's distinct mechanics—such as reactive parrying and the thematic weight of the "Gommage" (Erasure) and the number 33.

The Riddle Flow consists of **10 Stages**:

0. **Welcome Stage**: A themed entry point for Lumière.
1. **Lovely Feet**: 
   - *Prompt:* "She has lovely feet... 🦧" 
   - *Answer:* `lune`
2. **Esquie's Dance (Custom Stage)**: 
   - *Concept:* The wholesome companion Esquie is dancing. We must give him exactly 33 victory pets.
   - *Mechanic:* A picture of Esquie is presented. The player must click him exactly 33 times. A visual progress counter `(x/33)` is shown. Every time he is clicked, there is a 50% chance a floating CSS `❤️` spawns, and a 50% chance the text `"Whee!"` floats up from his image. 
3. **The Reactive Parry (Custom Stage)**: 
   - *Concept:* Mimics the reactive turn-based combat of the game.
   - *Mechanic:* An incoming "Ink Attack" from a Picto is shown visually as a shrinking circle or slider. The player must click `[PARRY]` at the exact right millisecond. There is an optional inside joke where the player can click a `[DODGE]` button, which temporarily disables parrying and shows "We don't do that here", but playing along is not required to parry successfully.
4. **The Antagonist**: 
   - *Prompt:* "I stand in your way, cane in hand, guarding the Paintress to protect my own. Who am I?" 
   - *Answers:* `['reunuar', 'renoir']`
5. **Team Builder (Custom Stage)**:
   - *Concept:* A drag-and-drop "Create the Perfect Team!" stage. The player is shown 5 character portraits from Act 2 and must drag the correct 3 into labelled team slots.
   - *Mechanic:* 5 characters are shown in a roster. 3 slots labelled "Free Aim Spammer", "Offense / Damage", "Support" must be filled correctly. Supports both drag-and-drop and touch events. Includes a defensive Simon "Gommage" easter egg if Simon is dragged to a slot.
6. **The Fading Memory (Custom Stage)**: 
   - *Concept:* A replacement for the Canvas Gommage idea. This represents "The Erasure" mechanics. 
   - *Mechanic:* A lore question is presented, but the text itself is actively "erasing". The player must quickly read the prompt before it completely disappears and guess the answer.
   - *Prompt Before Fading:* "A cheerful farmer turned teacher who fights using 'Foretell' stacks." 
   - *Answer:* `sciel`
7. **Simon's Melody (Custom Stage)**:
   - *Concept:* A multiple-choice audio stage about the Simon boss fight OST.
   - *Mechanic:* The background music crossfades from `Lumiere.mp3` to `We Lost.mp3`. A looping video of Simon's attack plays alongside the prompt. The player chooses from 13 options. Both "We Lost" and "Don't Cry" are accepted (referencing an inside joke). After success, the music crossfades back exactly where it paused.
8. **The Final Choice (Custom Stage)**:
   - *Concept:* The Verso vs. Maelle choice stage from the Act 3 finale.
   - *Mechanic:* The player must long-press and hold on the character they want to keep for 5 seconds. A radial progress indicator fills, the unchosen character slowly fades to dust, and the phone vibrates. If they lift their finger early, it resets.
9. **Congratulations Stage**: The "Mission Accomplished" completion screen.

*Note: The Lumière OST plays continuously in the background via the `useAudio` hook.*

## 2. Why this approach was chosen

- The **Esquie's Dance** stage was specifically designed around the "33" motif and the user's desire for a cute, wholesome breather stage with floating particles.
- The **Reactive Parry** translates the game's core gameplay hook into a web-native API `requestAnimationFrame` timing game, complete with an optional inside joke for dodge enthusiasts.
- The **Team Builder** stage provides a satisfying interactive drag-and-drop "loadout" fantasy.
- The **Fading Memory** stage is a much cleaner implementation of "The Gommage" (Erasure) compared to the canvas scratch-off, inducing panic through a `setInterval` hook without requiring complex canvas context manipulation.
- The **Simon OST** stage preserves audio state and adds atmospheric immersion by switching the background music seamlessly.
- The **Final Choice** stage creates a deliberately uncomfortable, meaningful moment mirroring the gravity of the in-game choice by forcing a 5-second long press.
- Reusing `TextAnswerStage` and standard generic components keeps horizontal iteration fast.

## 3. How it will be implemented

### General Components
1. **TextAnswerStage (`src/shared/stages/TextAnswerStage.tsx`)**: Reused for standard text questions.
2. **WelcomeStage / CongratsStage (`src/shared/stages/WelcomeStage.tsx`)**: Reused and themed.
3. **MultipleChoiceStage (`src/shared/components/stages/MultipleChoiceStage.tsx`)**: Reused for Simon OST stage.

### Specific Expedition 33 Logic
1. **EsquieStage (`src/features/riddles/expedition-33/stages/EsquieStage.tsx`)**:
   - Maintains a `pets (number)` state.
   - Maintains a `particles` array state: `{ id: number, x: number, y: number, type: 'heart' | 'text' }`.
   - On click, `pets` increments. A new particle is pushed to state. A `setTimeout` is triggered to remove that specific particle ID after 1 second (matching the CSS fade-up animation duration). 
   - Once `pets === 33`, `onAdvance()` is called.
2. **ReactiveParryStage (`src/features/riddles/expedition-33/stages/ReactiveParryStage.tsx`)**:
   - A shrinking ring `div` overlaying a target ring.
   - Uses `requestAnimationFrame` to animate a `scale` CSS transform from `2.0` down to `1.0` and lower over 3 seconds.
   - When the player clicks `PARRY`, the exact `scale` at that timestamp is calculated. If the scale is within `[0.9, 1.1]`, it's a success -> `onAdvance()`. If outside, state sets to `failed = true`, triggering a red error animation, and resets the timer.
   - Includes an optional dodging mechanic where clicking the dodge button pauses the UI and shows a joke message.
3. **TeamBuilderStage (`src/features/riddles/expedition-33/stages/TeamBuilderStage.tsx`)**:
   - Uses HTML5 drag and drop and custom touch event handlers (`onTouchStart`, etc) to support smooth dragging on mobile.
   - Automatically validates the assigned characters to slots once all 3 are populated, replacing the manual confirm step.
   - Includes logic to wipe out Simon in a dramatic "Gommage" white-out effect if dropped in a slot.
4. **FadingTextStage (`src/features/riddles/expedition-33/stages/FadingTextStage.tsx`)**:
   - Wraps standard `TextAnswerStage` input UI.
   - The text prompt uses a `useEffect` that runs every `100ms`, picking a random visible character and making it invisible via a `<span>` with `opacity-0` transition, until the entire string is gone.
   - Pass this specialized disappearing text block as a `ReactNode` into the `prompt` prop of `<TextAnswerStage />` (since `TextAnswerStage` supports rich-text `ReactNode` prompts out-of-the-box).
5. **SimonOstStage (`src/features/riddles/expedition-33/stages/SimonOstStage.tsx`)**:
   - Renders the `MultipleChoiceStage` component with 13 shuffled options.
   - The `useAudio` hook handles crossfading to `We Lost.mp3` and preserving the `Lumiere.mp3` playback position upon success.
6. **FinalChoiceStage (`src/features/riddles/expedition-33/stages/FinalChoiceStage.tsx`)**:
   - Listens to `onPointerDown` and `onPointerUp` to track hold duration in a `requestAnimationFrame` loop.
   - Drives SVG `strokeDashoffset` and CSS particle transforms using the `progress` state.
   - Triggers `navigator.vibrate` to provide haptic feedback.
7. **Main Orchestrator (`src/features/riddles/expedition-33/Expedition33.tsx`)**:
   - Define a constant `RIDDLE_ID = 'expedition-33'`.
   - Use `getRiddleProgress(RIDDLE_ID)` and `updateRiddleProgress(RIDDLE_ID, nextStage)` from `src/shared/logic/gameState` to persist the player's stage across reloads.
   - Holds the classic `switch(stage)` router to render the correct view for the active stage.
   - Maps the Lumière MP3 (`useAudio(lumiereOst, { loop: true })`).
   - Include the `<DevSkipButton riddleId={RIDDLE_ID} currentStage={stage} totalStages={10} onSkip={handleAdvance} />` at the root wrapper to allow for convenient testing/skipping.
8. **App Routing & Admin Registration**
   - **`src/App.tsx`**: Add `<Route path="/expedition-33" element={<Expedition33 />} />` (placed outside of `RiddleLayout` to allow full custom screen typography/styling).
   - **`src/shared/logic/riddleRegistry.ts`**: Add a new `RiddleMeta` entry to the `RIDDLE_REGISTRY` constant with `id: 'expedition-33'`, `totalStages: 10`, and an array of exactly 10 `stageLabels` (e.g., `['Entrance', 'Lovely Feet', 'Esquie Dance', 'Reactive Parry', 'Antagonist', 'Team Builder', 'Fading Memory', 'Simon OST', 'The Final Choice', 'Completed']`). *Note: This automatically adds it to the Admin Dashboard for resetting/skipping without needing to touch AdminDashboard.tsx!*
   - **Assets**: Ensure `Lumiere.mp3`, `Esquie.png`, and any other static assets are cleanly placed in `src/features/riddles/expedition-33/assets/` and explicitly imported in the React components.

## 4. Verification

- **Esquie UI**: Ensure clicking 33 times perfectly triggers the floating animations without lagging or causing memory leaks (verify particles unmount).
- **Parry UI**: Ensure the `requestAnimationFrame` loop handles background tabbing gracefully or resyncs properly. Verify the "sweet spot" timing window isn't too frustrating.
- **Team Builder UI**: Ensure dragging and dropping on desktop and mobile aligns correctly. Verify the roster is shuffled and the mobile layout constraints fit 3 slots on smaller screens without scrolling horizontally.
- **Fading Text**: Ensure the text erasure rate is balanced (not too fast/slow).
- **Simon OST UI**: Verify all 13 options fit on a screen horizontally and vertically without scrolling, especially on mobile. Verify the message is on screen for exactly 4 seconds before advancing.
- **Final Choice UI**: Verify holding Verso/Maelle for exactly 5 seconds completes the interaction.
- **Audio**: Verify `assets/Lumiere.mp3` loops flawlessly across all state transitions, and correctly crossfades to `We Lost.mp3` and back during the Simon stage.
