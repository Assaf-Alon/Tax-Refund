# Design Document: Expedition 33 Riddle Hints

## 1. What is being changed/added
We are adding hints and wait times to all active stages of the "Expedition 33" riddle (`src/features/riddles/expedition-33/`), following the pattern established in Outer Wilds and Spider Lair.

Specifically:
1. **Infrastructure Extensions**:
   - Adding `hint` and `hintCooldown` support to `ActionRingStage` and `MultipleChoiceStage` so shared stage components natively support hint overlays.
   - Adding `HintButton` support to custom Expedition 33 stage components (`EsquieStage`, `TeamBuilderStage`, `FinalChoiceStage`).

2. **Hints and Wait Times per Stage**:
   - **Stage 1 (Lovely Feet - TextAnswerStage)**:
     - *Hint*: `"Similar to Luna"`
     - *Wait time*: 15s
   - **Stage 2 (Esquie's Dance - EsquieStage)**:
     - *Hint*: `"Just... Just PET HIM ALREADY!"`
     - *Wait time*: 20s
   - **Stage 3 (Incoming Attack - ReactiveParryStage / ActionRingStage)**:
     - *Hint*: `"You got this. I believe in you"`
     - *Wait time*: 15s
   - **Stage 4 (The Antagonist - TextAnswerStage)**:
     - *Hint*: `"There's a fashion store named after him"`
     - *Wait time*: 25s
   - **Stage 5 (Create the Perfect Team! - TeamBuilderStage)**:
     - *Hint*: `"Support and Offense are females. Girls get it done!"`
     - *Wait time*: 30s
   - **Stage 6 (The Fading Memory - FadingTextStage / TextAnswerStage)**:
     - *Hint*: `"Support from previous phase"`
     - *Wait time*: 20s
   - **Stage 7 (Simon's Melody - SimonOstStage / MultipleChoiceStage)**:
     - *Hint*: `"The track title reflects our defeat... or tells you not to shed tears"`
     - *Wait time*: 30s
   - **Stage 8 (The Final Choice - FinalChoiceStage)**:
     - *Hint*: `"You know what to do. It's an easy one"`
     - *Wait time*: 15s

## 2. Why this approach was chosen (context)
- **Consistency**: Matches the UX in Spider Lair and Outer Wilds, ensuring users never get permanently stuck.
- **Obviousness vs. Wait Time Alignment**: Per guidelines ("the more obvious it should be, the higher the wait time"), hints that give clearer structural guidance (e.g. Stage 5 at 30s, Stage 7 at 30s, Stage 4 at 25s) feature longer wait times, whereas encouraging/subtle hints feature shorter wait times (15s - 20s).
- **Shared Infrastructure**: Extending `ActionRingStage` and `MultipleChoiceStage` allows present and future riddles to declare hints cleanly via props without duplicating timer state.

### Alternatives Considered & Rejected
- **Hardcoding inline hint timers inside custom stages**: Rejected to maintain clean state separation and reuse the proven `HintButton` component.
- **No wait time (instant hints)**: Rejected because wait times encourage players to engage with the puzzle before seeking assistance.

## 3. How it will be implemented

### A. Infrastructure Updates
1. `src/shared/components/stages/ActionRingStage.tsx`:
   - Add optional `hint?: string` and `hintCooldown?: number` to `ActionRingStageProps`.
   - Render `HintButton` inside container if `hint` is provided.

2. `src/shared/components/stages/MultipleChoiceStage.tsx`:
   - Add optional `hint?: string` and `hintCooldown?: number` to `MultipleChoiceStageProps`.
   - Render `HintButton` inside container if `hint` is provided.

3. `src/features/riddles/expedition-33/stages/EsquieStage.tsx`:
   - Add optional `hint?: string` and `hintCooldown?: number` props and render `HintButton`.

4. `src/features/riddles/expedition-33/stages/TeamBuilderStage.tsx`:
   - Add optional `hint?: string` and `hintCooldown?: number` props and render `HintButton`.

5. `src/features/riddles/expedition-33/stages/FinalChoiceStage.tsx`:
   - Add optional `hint?: string` and `hintCooldown?: number` props and render `HintButton`.

### B. Stage Configuration in `Expedition33.tsx`
- Update each stage invocation in `renderStage()` (or within stage components) to pass the designated `hint` and `hintCooldown`.

## 4. Verification
1. Run `npx vitest` / `npm run test` to verify no regressions in tests.
2. Verify TypeScript compilation (`npx tsc --noEmit` or `npm run build`).
3. Manually test/verify each stage's hint button countdown and revealed text behavior.
