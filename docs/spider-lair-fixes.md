# Spider Lair — Post-Review Fixes

Six issues reported after initial playtest. This document describes the root cause and fix for each.

## Proposed Changes

### 1. Pin Pad: Buttons too far apart

#### [MODIFY] [PinPad.tsx](file:///home/assaf/code/Tax-Refund/src/shared/ui/PinPad.tsx)

The grid uses `gap-2` and the buttons are `w-14 h-14`. Reduce the grid gap to `gap-1` and shrink buttons from `w-14 h-14` to `w-12 h-12`. Also update the default `buttonClassName` prop and the spacer div to match.

#### [MODIFY] [PasscodeStage.tsx](file:///home/assaf/code/Tax-Refund/src/features/riddles/spider-lair/stages/PasscodeStage.tsx)

Update `pinButtonClass` from `w-14 h-14` → `w-12 h-12`.

---

### 2 & 3 & 4. CharacterInput rework: word-based validation + line wrapping + cross-line focus

The current `CharacterInput` renders an entire line as a single flat `flex-wrap` row. This causes three problems:
- Words break across viewport lines (issue #4)
- Completing word N doesn't auto-advance focus to word N+1 (issue #2) — the cursor stays in-line
- Validation is per-line, not per-word (issue #3)

**New design**: Instead of a single `CharacterInput` per lyrics line, the `LyricsStage` will split each line into **words**, and each word gets its own `CharacterInput`. Words are grouped into lines using `flex-wrap` with `whitespace-nowrap` on each word group to prevent mid-word breaks. When a word is completed (matches expected), it locks and focus jumps to the first input of the next word.

#### [MODIFY] [CharacterInput.tsx](file:///home/assaf/code/Tax-Refund/src/shared/ui/CharacterInput.tsx)

**Changes:**
1. Strip the space-rendering logic. `CharacterInput` will now handle a **single word** with no spaces (all chars are editable a-z/0-9 or apostrophes).
2. Add a `disabled` / `locked` visual state: when `onComplete` fires, the parent can set a `locked` prop to grey-out/green-highlight the word.
3. Add an `autoFocus` prop (default `false`). When `true`, focus the first input on mount.
4. Keep the `ref` forwarding logic intact so `LyricsStage` can imperatively focus the next word's first input.
5. Add `onComplete` callback (already exists) — this fires only when all chars match the expected value.

New interface:
```ts
interface CharacterInputProps {
    expectedValue: string;       // a single word, no spaces
    onComplete: () => void;
    locked?: boolean;            // after completion, visually lock
    autoFocus?: boolean;         // focus first input on mount
    inputRef?: React.RefObject<HTMLInputElement | null>;  // ref to first editable input
}
```

Static char detection simplified: apostrophes (`'`) are now the only static chars (commas, periods, question marks will be rendered between words by the parent).

#### [MODIFY] [LyricsStage.tsx](file:///home/assaf/code/Tax-Refund/src/features/riddles/spider-lair/stages/LyricsStage.tsx)

**Major rewrite.** New approach:

1. Parse each lyrics line into tokens: words + punctuation/spaces.
2. Each word token gets a `CharacterInput`, rendered inside a `<span className="inline-flex whitespace-nowrap">` to prevent mid-word line breaks.
3. Spaces between words are rendered as `<span>&nbsp;</span>`.
4. Trailing punctuation (commas, question marks, apostrophes at word boundaries) rendered as static pink text after the word.
5. Track completion per-word (not per-line). When word N completes → lock it (green border), auto-focus word N+1.
6. Keep the `onAdvance` trigger: fires when **all** words across all lines are complete.
7. Lines are separated by `<div>` wrappers, so each lyric line starts on a new visual row.

New lyrics constant structure:
```ts
// Each line is a string. We tokenize words at runtime.
const LYRICS_LINES = [
    "I think it's time for a date",
    "I've got a craving and I think you're my taste",
    "So won't you come out and play?",
    "Darling it's your lucky day",
];
```

Tokenizer splits on spaces, preserving trailing punctuation like `?` and `,` as metadata.

---

### 5. CreatureStage: change canonical answer to "Silk Monster"

#### [MODIFY] [CreatureStage.tsx](file:///home/assaf/code/Tax-Refund/src/features/riddles/spider-lair/stages/CreatureStage.tsx)

- Change `CORRECT_ANSWER` from `'clawmaiden'` to an array: `['silk monster', 'clawmaiden']`
- Check `inputValue.toLowerCase().trim()` against all accepted answers
- Change the hint text from `"She has claws and she's a maiden..."` to something oriented toward "Silk Monster", e.g. `"Woven from silk, born to destroy..."`
- Update the heading flavor text if needed

---

### 6. CongratsPage: reorder images + add "next location" text

#### [MODIFY] [CongratsPage.tsx](file:///home/assaf/code/Tax-Refund/src/features/riddles/spider-lair/CongratsPage.tsx)

- Swap order: `git-gud.gif` above `Carrefour.png`
- Add text below the Carrefour image: `"I wonder what the next location might be..."`

---

## Verification Plan

### Automated Tests

Run: `npx vitest run --config vitest.config.ts`

- **CharacterInput tests** need updating because the component interface changes (adding `locked`, `autoFocus`, `inputRef` props; removing space handling from CharacterInput itself — words will no longer contain spaces).
- **SpiderLair tests** should still pass (stages are mocked).
- **HintButton tests** unaffected.

### Manual Browser Verification

1. Navigate to `http://localhost:10000/Tax-Refund/#/spider-lair`
2. **Pin Pad** (Stage 1): Verify buttons are closer together. Enter 2468.
3. **Lyrics** (Stage 2): 
   - Verify words don't break across lines
   - Type "date" for the first blank — cursor should jump to "I've"
   - Verify that completed words turn green/locked
4. **Creature** (Stage 4): Type "silk monster" → should advance. Type "clawmaiden" → should also advance.
5. **Congrats** (Stage 5): Verify git-gud.gif is above Carrefour logo, and "next location" text appears.
