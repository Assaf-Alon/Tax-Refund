# Simon OST Stage — Design Document

## 1. What

A new **multiple-choice stage** for the Expedition 33 riddle that asks:

> *"What's the OST that plays when we fight Simon?"*

The stage references an inside joke where the boss fight OST sounds like **"אל תבכי"** ("Don't Cry" in Hebrew). Both **"We Lost"** (the real track name) and **"Don't Cry" / "אל תבכי"** are accepted as correct answers.

During this stage, the background music **crossfades** from `Lumiere.mp3` to `We Lost.mp3`. Once the player answers correctly, the music **crossfades back** to `Lumiere.mp3`, **from the exact point where it paused**.

**Visuals**:
- Simon's portrait (`simon.png`, already in assets) is displayed.
- A looped, muted video of Simon's annoying attack (`sword-of-lumiere.mp4`) will be played alongside the question.

## 2. Why

- **Inside joke**: The "אל תבכי" joke is an inside joke that fits perfectly as a riddle stage.
- **Music switching**: Adds atmospheric immersion — the player hears the answer while being asked about it.
- **Audio state preservation**: Resuming the OST exactly where we left off enhances the immersion and makes the transition seamless without restarting the 3-minute track from the beginning.
- **Multiple-choice format**: Makes the stage interactive while a large number of fake answers prevent brute-forcing by spam-clicking.

## 3. How

### Overview of Changes

The new stage is inserted as **stage 7** (after Fading Memory, before The Final Choice), bumping the total from 9 to 10 stages.

---

### `src/shared/utils/useAudio.ts` — No Changes Needed

`useAudio` already caches `HTMLAudioElement` instances globally via a module-level `audioCache` Map (line 10) and performs a cache lookup before creating new elements (lines 87-91). The crossfade logic pauses the old track without resetting `currentTime`, so playback position is naturally preserved. When the `src` switches back to `Lumiere.mp3`, `useAudio` retrieves the exact same `Audio` element and `.play()` resumes from the paused position.

> **No modifications required** — the crossfade + resume behavior works out of the box.

---

### [NEW] `src/features/riddles/expedition-33/stages/SimonOstStage.tsx`

A self-contained multiple-choice stage component.

**Prerequisite**: Ensure `sword-of-lumiere.mp4` has been moved from `tmp/` to `src/features/riddles/expedition-33/assets/` before implementing.

**Imports**:
```tsx
import simonPortrait from '../assets/simon.png';
import swordOfLumiereVid from '../assets/sword-of-lumiere.mp4';
```

**Props**: `{ onAdvance: () => void }`

**UI Layout**:
- **Title**: `"Simon's Melody"`
- **Media Row**: Shows `simon.png` alongside the looping `sword-of-lumiere.mp4` video (muted, loops automatically).
- **Prompt text**: `"What's the OST that plays when we fight Simon?"`
- A grid of **13 multiple-choice buttons** in a 2-column or 3-column layout, shuffled on each render:
  - ✅ `"We Lost"` (correct)
  - ✅ `"אל תבכי (Don't Cry)"` (correct)
  - ❌ `"Lumière"`
  - ❌ `"L'Appel du Vide"`
  - ❌ `"Paintress Waltz"`
  - ❌ `"Expedition March"`
  - ❌ `"Clair de Lune"`
  - ❌ `"Gommage"`
  - ❌ `"Monoko's Requiem"`
  - ❌ `"Expedition 0"`
  - ❌ `"The 33rd Year"`
  - ❌ `"Echoes of the Paintress"`
  - ❌ `"Symphony of the End"`

**Behavior**:
- On **correct** answer: the selected button glows green/emerald, a brief success message appears, then `onAdvance()` fires after ~1.5s delay.
- On **wrong** answer: the selected button flashes red briefly, a shake animation plays, and it becomes disabled (grayed out) so the player can't re-click it.
- Answers are shuffled using `useMemo` so order is randomized per mount.

**Styling Reference** (Tailwind classes):
- Grid layout: `grid grid-cols-2 md:grid-cols-3 gap-3`
- Default button: `bg-black/40 border border-emerald-500/30 text-emerald-100 px-4 py-3 rounded transition-all duration-300 hover:bg-emerald-900/40`
- Correct answer glow: `bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.4)]`
- Wrong answer shake: apply a CSS `@keyframes shake` animation (`0%,100%{transform:translateX(0)} 25%{transform:translateX(-6px)} 75%{transform:translateX(6px)}`) for ~0.4s, then transition to disabled state
- Disabled button: `opacity-40 pointer-events-none`

---

### [MODIFY] `Expedition33.tsx`

1. **Move Assets**: Copy `tmp/sword-of-lumiere.mp4` to `src/features/riddles/expedition-33/assets/`.
2. **Import** `SimonOstStage` and `weLostOst` (`We Lost.mp3`).
3. **Make `useAudio` src reactive** — replace the current `useAudio(lumiereOst, { loop: true })` call with a stage-dependent src, following the same pattern used in `SpiderLair.tsx` (lines 24-31) for its `spiderDanceOriginal` → `spiderDanceCover` switch:
   ```tsx
   const audioSrc = stage === 7 ? weLostOst : lumiereOst;
   useAudio(audioSrc, { loop: true });
   ```
   When the player advances past stage 7, `audioSrc` automatically switches back to `lumiereOst`, and `useAudio` handles the crossfade + resume transparently (the cached `Lumiere.mp3` element resumes from where it was paused).
4. **Insert the new stage** as `case 7` in the router. Bump `FinalChoiceStage` to `case 8` and `CongratsStage` to `case 9`.
5. **Update DevSkipButton** total to `10`.

---

### [MODIFY] `src/shared/logic/riddleRegistry.ts`

- Update `totalStages` for `expedition-33` to `10`.
- Insert `'Simon OST'` into `stageLabels` at index 7.

## 4. Verification

### Manual Verification

1.  Navigate to `/xp-33`.
2.  Skip to Stage 7 using the Dev Tools.
3.  Validate:
    -   **Audio Switch**: `Lumiere.mp3` crossfades smoothly into `We Lost.mp3`.
    -   **Video**: `sword-of-lumiere.mp4` plays seamlessly on loop without audio (check devtools mute state).
    -   **Gameplay**: All 13 buttons are present, shuffled. Clicking wrong answers disables them and shakes. Clicking a correct answer glows green and advances.
    -   **Audio Resume**: Upon advancing to Stage 8, `We Lost.mp3` fades out, and `Lumiere.mp3` fades back in **exactly where it left off**.

### Automated Tests

- Verify the existing `vitest` suite passes (`npx vitest run`).
- No changes to `useAudio.ts` are being made, so no new unit tests are needed for the hook itself.
- Optionally, add a test to `useAudio.test.ts` that verifies `window.Audio` is only constructed once per unique `src` when re-rendering with a previously-used src (i.e., caching works). This can be done by:
    1.  Rendering with `src='a.mp3'`, then rerendering with `src='b.mp3'`, then rerendering back to `src='a.mp3'`.
    2.  Asserting `window.Audio` was called exactly **2** times total (once for `a.mp3`, once for `b.mp3`), not 3.
