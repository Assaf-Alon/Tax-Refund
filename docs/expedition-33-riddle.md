# Expedition 33 - Riddle Design

## 1. What This Is

The "Expedition 33" riddle is a sequence inspired by the upcoming game *Clair Obscur: Expedition 33*. It blends text-based knowledge checks about the game's lore (characters, antagonists) with custom interactive stages that perfectly mimic the game's distinct mechanics—such as reactive parrying and the thematic weight of the "Gommage" (Erasure) and the number 33.

The Riddle Flow consists of **7 Stages**:

0. **Welcome Stage**: A themed entry point for Lumière.
1. **The Engineer**: 
   - *Prompt:* "A brilliant engineer and inventor who lost his arm, replacing it with his own mechanical design." 
   - *Answer:* `gustave`
2. **Esquie's Rest (Custom Stage)**: 
   - *Concept:* The wholesome companion Esquie is sleeping. We must wake him up with exactly 33 pets.
   - *Mechanic:* A picture of Esquie is presented. The player must click him exactly 33 times. A visual progress counter `(x/33)` is shown. Every time he is clicked, there is a 50% chance a floating CSS `❤️` spawns, and a 50% chance the text `"Whee!"` floats up from his image. 
3. **The Reactive Parry (Custom Stage)**: 
   - *Concept:* Mimics the reactive turn-based combat of the game.
   - *Mechanic:* An incoming "Ink Attack" from a Picto is shown visually as a shrinking circle or slider. The player must click `[PARRY]` at the exact right millisecond (a tight window, e.g., 200ms). If they succeed, they advance. If they miss, a CSS "fade to dust" animation plays and the stage resets.
4. **The Antagonist**: 
   - *Prompt:* "I stand in your way, cane in hand, guarding the Paintress to protect my own. Who am I?" 
   - *Answers:* `['reunuar', 'renoir']`
5. **The Fading Memory (Custom Stage)**: 
   - *Concept:* A replacement for the Canvas Gommage idea. This represents "The Erasure" mechanics. 
   - *Mechanic:* A lore question is presented, but the text itself is actively "erasing" (letters are sequentially fading out or turning into `\u00A0` spaces via a `useEffect` interval). The player must quickly read the prompt before it completely disappears and guess the answer.
   - *Prompt Before Fading:* "A cheerful farmer turned teacher who fights using 'Foretell' stacks." 
   - *Answer:* `sciel`
6. **Congratulations Stage**: The "Mission Accomplished" completion screen.

*Note: The Lumière OST plays continuously in the background via the `useAudio` hook.*

## 2. Why this approach was chosen

- The **Esquie's Rest** stage was specifically designed around the "33" motif and the user's desire for a cute, wholesome breather stage with floating particles.
- The **Reactive Parry** translates the game's core gameplay hook into a web-native API `requestAnimationFrame` timing game.
- The **Fading Memory** stage is a much cleaner implementation of "The Gommage" (Erasure) compared to the canvas scratch-off, inducing panic through a `setInterval` hook without requiring complex canvas context manipulation.
- Reusing `TextAnswerStage` and standard generic components keeps horizontal iteration fast.

## 3. How it will be implemented

### General Components
1. **TextAnswerStage (`src/shared/stages/TextAnswerStage.tsx`)**: Reused for standard text questions.
2. **WelcomeStage / CongratsStage (`src/shared/stages/WelcomeStage.tsx`)**: Reused and themed.

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
3. **FadingTextStage (`src/features/riddles/expedition-33/stages/FadingTextStage.tsx`)**:
   - Wraps standard `TextAnswerStage` input UI.
   - The text prompt uses a `useEffect` that runs every `100ms`, picking a random visible character and making it invisible via a `<span>` with `opacity-0` transition, until the entire string is gone.
   - Pass this specialized disappearing text block as a `ReactNode` into the `prompt` prop of `<TextAnswerStage />` (since `TextAnswerStage` supports rich-text `ReactNode` prompts out-of-the-box).
4. **Main Orchestrator (`src/features/riddles/expedition-33/Expedition33.tsx`)**:
   - Define a constant `RIDDLE_ID = 'expedition-33'`.
   - Use `getRiddleProgress(RIDDLE_ID)` and `updateRiddleProgress(RIDDLE_ID, nextStage)` from `src/shared/logic/gameState` to persist the player's stage across reloads.
   - Holds the classic `switch(stage)` router to render the correct view for the active stage.
   - Maps the Lumière MP3 (`useAudio(lumiereOst, { loop: true })`).
   - Include the `<DevSkipButton riddleId={RIDDLE_ID} currentStage={stage} totalStages={7} onSkip={handleAdvance} />` at the root wrapper to allow for convenient testing/skipping.
5. **App Routing & Admin Registration**
   - **`src/App.tsx`**: Add `<Route path="/expedition-33" element={<Expedition33 />} />` (placed outside of `RiddleLayout` to allow full custom screen typography/styling).
   - **`src/shared/logic/riddleRegistry.ts`**: Add a new `RiddleMeta` entry to the `RIDDLE_REGISTRY` constant with `id: 'expedition-33'`, `totalStages: 7`, and an array of exactly 7 `stageLabels` (e.g., `['Entrance', 'The Engineer', 'Esquie Rest', 'Reactive Parry', 'Antagonist', 'Fading Memory', 'Completed']`). *Note: This automatically adds it to the Admin Dashboard for resetting/skipping without needing to touch AdminDashboard.tsx!*
   - **Assets**: Ensure `Lumiere.mp3`, `Esquie.png`, and any other static assets are cleanly placed in `src/features/riddles/expedition-33/assets/` and explicitly imported in the React components.

## 4. Verification

- **Esquie UI**: Ensure clicking 33 times perfectly triggers the floating animations without lagging or causing memory leaks (verify particles unmount).
- **Parry UI**: Ensure the `requestAnimationFrame` loop handles background tabbing gracefully or resyncs properly. Verify the "sweet spot" timing window isn't too frustrating.
- **Fading Text**: Ensure the text erasure rate is balanced (not too fast/slow).
- **Audio**: Verify `assets/Lumiere.mp3` loops flawlessly across all state transitions.
