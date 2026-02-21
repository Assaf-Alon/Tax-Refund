# Spider Lair — Additional Stages

Expand from 6 stages (entrance + 4 riddles + congrats) to 12 stages (entrance + 10 riddles + congrats).

## Stage Order (new)

| Stage | Type | Description | Answer(s) |
|-------|------|-------------|-----------|
| 0 | Entrance | As-is | — |
| 1 | Passcode | As-is (2468) | 2468 |
| 2 | Lyrics | As-is (Spider Dance) | lyrics text |
| 3 | Skarrsinger | As-is (Karmelita) | skarrsinger karmelita, karmelita |
| 4 | Text | "How many acts are there to Silksong?" | 3 |
| 5 | Text | "In what act does Pharloom get aids?" | 3 |
| 6 | Text | "I use them to help against tough opponents..." | friends, cogfly |
| 7 | Image | Clawmaiden/Silk Monster (as-is) | silk monster, clawmaiden |
| 8 | Image | slab.png — "What's the name of the place..." | the slab, slab |
| 9 | Image | mite.png — "What's the name of this f*cker?" | hitler, mite |
| 10 | Text | "What CLI command does Hornet often use..." | git gud, git good |
| 11 | Congrats | As-is | — |

---

## Per-Stage Configuration (TextAnswerStage props)

Each `<TextAnswerStage>` is rendered inline in `SpiderLair.tsx` with the following props:

| Stage | `title` | `prompt` | `acceptedAnswers` | `hint` | `hintCooldown` | `errorMessage` | `image` | `imageAlt` |
|-------|---------|----------|-------------------|--------|----------------|----------------|---------|------------|
| 4 | "A Question of Acts" | "How many acts are there to Silksong?" | `["3"]` | _(none — omit `HintButton`)_ | — | "The threads tighten... try again." | — | — |
| 5 | "A Dark Act" | "In what act does Pharloom get aids?" | `["3"]` | "The final act holds the darkest secret..." | 60 | "Wrong answer. The web trembles." | — | — |
| 6 | "Allies in Battle" | "I use them to help against tough opponents..." | `["friends", "cogfly"]` | "Small, buzzy, and loyal..." | 60 | "That's not who helps you..." | — | — |
| 8 | "Name This Place" | "What's the name of the place in this image?" | `["the slab", "slab"]` | "A flat, cold resting place..." | 60 | "The silk doesn't recognize that name..." | `slab.png` | "A mysterious location" |
| 9 | "Name This Creature" | "What's the name of this f*cker?" | `["hitler", "mite"]` | "Enemy of Jews" | 60 | "Nope. Look closer at those legs..." | `mite.png` | "A small annoying creature" |
| 10 | "A Command to Remember" | "What CLI command does Hornet often use when speaking to the knight?" | `["git gud", "git good"]` | "What does Hornet tell you when you keep dying?" | 60 | "The spider shakes her head..." | — | — |

> **Note:** When `hint` is omitted (stage 4), the `<HintButton>` component should not be rendered.

---

## Stage Labels for Registry

Update `stageLabels` in `riddleRegistry.ts` to:

```ts
stageLabels: [
    'Entrance', 'Passcode', 'Lyrics', 'Skarrsinger',
    'Acts', 'Aids', 'Friends', 'Creature',
    'Slab', 'Mite', 'Git Gud', 'Completed'
]
```

---

## Proposed Changes

### Shared Utility

#### [NEW] [fuzzyMatch.ts](file:///home/assaf/code/Tax-Refund/src/shared/logic/fuzzyMatch.ts)

Extract `histogramSimilarity` and `isCloseEnough` from `SkarrsingerStage.tsx` into a shared utility. All text-answer stages will import this.

Export both functions (`histogramSimilarity` for unit testing, `isCloseEnough` for stage logic):

```ts
export function histogramSimilarity(a: string, b: string): number;
export function isCloseEnough(input: string, acceptedAnswers: string[], threshold?: number): boolean;
```

Default `threshold` is `0.6` (matching existing behavior). The function normalizes input with `.toLowerCase().trim()`, checks for exact match first, then falls back to histogram similarity.

---

### New Stage Components

#### [NEW] [TextAnswerStage.tsx](file:///home/assaf/code/Tax-Refund/src/features/riddles/spider-lair/stages/TextAnswerStage.tsx)

```ts
interface TextAnswerStageProps {
    title: string;
    prompt: string | React.ReactNode;   // question text or JSX
    acceptedAnswers: string[];
    hint?: string;                       // omit to hide HintButton entirely
    hintCooldown?: number;               // default 60
    errorMessage?: string;               // default "The web rejects your answer..."
    onAdvance: () => void;
    image?: string;                      // optional image src
    imageAlt?: string;
}
```

**Styling**: Replicate the layout and Tailwind classes from `CreatureStage.tsx` / `SkarrsingerStage.tsx`:

1. Outer `<div className="text-center space-y-8 w-full max-w-lg">`
2. `<h2 className="text-2xl text-[#ff007f]">` → `title`
3. If `image` is provided: `<div className="flex justify-center">` with `<img>` using `className="max-w-xs rounded-lg border border-[#b0005d] shadow-[0_0_20px_rgba(255,0,127,0.3)]"`
4. `<p className="text-pink-200/60 text-sm">` → `prompt` (if string) or render JSX directly
5. `<form>` with text `<input>` + submit `<button>` — same classes as existing stages
6. Error `<p>` with `className="text-red-400 text-sm animate-pulse"`
7. `<HintButton>` only if `hint` is provided, with `cooldownSeconds={hintCooldown ?? 60}`

**Answer validation**: Use `isCloseEnough(inputValue, acceptedAnswers)` from `fuzzyMatch.ts`.

#### Reuse existing stages as-is:
- `EntranceStage`, `PasscodeStage`, `LyricsStage`, `SkarrsingerStage` — unchanged
- `CreatureStage` — update to use `isCloseEnough()` from `fuzzyMatch.ts` (intentional: enables typo tolerance for the dyslexic player)

---

### Wiring

#### [MODIFY] [SpiderLair.tsx](file:///home/assaf/code/Tax-Refund/src/features/riddles/spider-lair/SpiderLair.tsx)

- Import `TextAnswerStage` and image assets:
  ```ts
  import slabImg from './assets/slab.png';
  import miteImg from './assets/mite.png';
  ```
- Expand `renderStage` switch: cases 0–11
- Cases 4, 5, 6, 8, 9, 10 use `<TextAnswerStage>` with inline props from the table above
- Case 7 remains `<CreatureStage>`
- Case 11 (and default) renders `<CongratsPage>`

#### [MODIFY] [SkarrsingerStage.tsx](file:///home/assaf/code/Tax-Refund/src/features/riddles/spider-lair/stages/SkarrsingerStage.tsx)

- Remove inline `histogramSimilarity` and `isCloseEnough` functions
- Import `isCloseEnough` from `../../../../shared/logic/fuzzyMatch`
- Pass `ACCEPTED_ANSWERS` to the imported `isCloseEnough(inputValue, ACCEPTED_ANSWERS)`

#### [MODIFY] [CreatureStage.tsx](file:///home/assaf/code/Tax-Refund/src/features/riddles/spider-lair/stages/CreatureStage.tsx)

- Import `isCloseEnough` from `../../../../shared/logic/fuzzyMatch`
- Replace `ACCEPTED_ANSWERS.includes(inputValue.toLowerCase().trim())` with `isCloseEnough(inputValue, ACCEPTED_ANSWERS)`

#### [MODIFY] [riddleRegistry.ts](file:///home/assaf/code/Tax-Refund/src/shared/logic/riddleRegistry.ts)

- Update `totalStages` from 6 → 12
- Update `stageLabels` to the array shown above

---

## Verification Plan

### Automated Tests

Run: `npx vitest run --config vitest.config.ts`

- **New test**: `fuzzyMatch.test.ts` — unit tests for:
  - Exact match returns `true`
  - Close typo (e.g., "karmelita" vs "karmelyta") returns `true` at 0.6 threshold
  - Completely wrong input returns `false`
  - Single-character answers (e.g., "3") require exact match (histogram similarity of "3" vs "4" is 0, confirming 0.6 threshold is safe)
  - `histogramSimilarity` returns 1.0 for identical strings, 0 for disjoint strings
- **SpiderLair tests**: Update mocks in `SpiderLair.test.tsx`:
  - Add `vi.mock` for `TextAnswerStage` (same pattern as existing stage mocks)
  - Update CongratsPage test from stage 5 → stage 11
  - Add test for a `TextAnswerStage` stage (e.g., stage 4) rendering correctly
- Existing CharacterInput / HintButton tests unaffected

### Browser Verification

1. Navigate to `http://localhost:10000/Tax-Refund/#/spider-lair`
2. Play through Entrance → Passcode (2468) → Lyrics → Karmelita
3. Stage 4: Answer "3" → advance. Stage 5: Answer "3" → advance
4. Stage 6: Answer "friends" → advance
5. Stage 7: Answer "silk monster" → advance
6. Stage 8: Verify slab.png displays. Answer "the slab" → advance
7. Stage 9: Verify mite.png displays. Answer "hitler" → advance
8. Stage 10: Answer "git gud" → advance
9. Verify CongratsPage at stage 11
