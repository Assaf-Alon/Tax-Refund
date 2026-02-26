# Spider Lair Riddle

Implementation of a spider-themed riddle inspired by Silksong (Hornet) and Undertale (Muffet). This riddle spans 12 stages (0 to 11).

## What This Is

The Spider Lair is a multi-stage riddle within the application. It tests the user's knowledge of Hollow Knight: Silksong, Undertale, and general internet culture through a series of text questions, a pin pad, and a lyrics fill-in-the-blank game. 

## Context (Why)

The design is engineered to ensure scalability:
- **Modular stages**: Instead of hardcoding every stage specifically for the Spider Lair, generic, reusable stage primitive components (`TextAnswerStage`, `PinAnswerStage`, `FillWordsStage`) are created in `src/shared/stages/`.
- **Theme Objects**: We use theme objects (e.g., `SPIDER_TEXT_THEME`) instead of CSS custom properties because it integrates natively with Tailwind's JIT compiler, provides type safety, and avoids mixing inline styles with Tailwind classes.
- **Typo Tolerance**: We use a `histogramSimilarity` fuzzy matching utility (`isCloseEnough`) to allow minor typos (e.g. dyslexic players) while still enforcing strict correctness on short numeric answers.

## Architecture & Implementation (How)

### Shared Stage Primitives
Located in `src/shared/stages/`. These accept optional `theme` props allowing UI reskinning without duplicating logical code:
- `TextAnswerStage`: Renders a title, text input, and submit button. Uses a `isCloseEnough` fuzz-match helper (0.6 threshold fallback) to process answers.
- `PinAnswerStage`: Renders dot-indicators and a `PinPad`. Automatically checks answers via `useEffect`.
- `FillWordsStage`: Breaks lines into word chunks using `CharacterInput`. Unlocks consecutive words sequentially upon input completion via refs.

### Theme Interfaces
Themes are passed to shared primitives via TypeScript interfaces containing Tailwind class strings. Spider Lair specific themes (e.g., `SPIDER_TEXT_THEME` providing pink hex colors) are exported from `src/features/riddles/spider-lair/theme.ts`.

### Spider Lair Wrappers
Located in `src/features/riddles/spider-lair/stages/`. Thin components that bake in narrative content and themes:
- `SpiderLairTextAnswerStage`: Wraps `TextAnswerStage` applying `SPIDER_TEXT_THEME`.
- `SpiderLairPinStage`: Wraps `PinAnswerStage` applying `SPIDER_PIN_THEME` with hardcoded 2468 pin content.
- `SpiderLairLyricsStage`: Wraps `FillWordsStage` applying `SPIDER_FILL_WORDS_THEME` with Spider Dance lyrics.

### Main Orchestrator
`SpiderLair.tsx` maintains the `stage` index state initialized via `getRiddleProgress('spider-lair')`. A `switch(stage)` statement renders the specific stage wrapper or inline component.
- **Dynamic Audio**: The orchestrator triggers immersive audio through `useAudio.ts`. "Toby Fox - Spider Dance.mp3" begins at stage 0, and smoothly crossfades over 2 seconds into a high-intensity "Spider Dance Cover.mp3" when progressing beyond stage 2. Unmounting the feature cancels active fade intervals appropriately.

### Stage Content Reference

| Stage | Component | Question / Content | Accepted Answers |
|-------|-----------|------------------|------------------|
| **0** | `EntranceStage` | "Enter the Webs" | (Button Click) |
| **1** | `SpiderLairPinStage` | 4-digit PIN | `2468` |
| **2** | `SpiderLairLyricsStage`| Spider Dance Lyrics | Line completion |
| **3** | `SpiderLairTextAnswerStage` | "I sing, I fight, I kill..." | `skarrsinger karmelita`, `karmelita` |
| **4** | `SpiderLairTextAnswerStage` | "How many acts are there to Silksong?" | `3` |
| **5** | `SpiderLairTextAnswerStage` | "In what act does Pharloom get aids?" | `3` |
| **6** | `SpiderLairTextAnswerStage` | "I use them to help against tough opponents..." | `friends`, `cogfly` |
| **7** | `SpiderLairTextAnswerStage` | Clawmaiden Image | `silk monster`, `clawmaiden` |
| **8** | `SpiderLairTextAnswerStage` | Slab Image | `the slab`, `slab` |
| **9** | `SpiderLairTextAnswerStage` | Mite Image | `hitler`, `mite` |
| **10**| `SpiderLairTextAnswerStage`| "What CLI command does Hornet often use..." | `git gud`, `git good` |
| **11**| `CongratsPage` | Final Success Screen| N/A |

## Verification Plan
1. **Automated Unit Tests**: `vitest` covering `fuzzyMatch.ts`, shared primitives, and custom hooks (`useAudio.test.ts`).
2. **Manual Regression Testing**: 
   - Verify focus flow in `CharacterInput`.
   - Complete stages 1 through 11 and ensure state persists dynamically in `localStorage`.
   - Ensure audio crossfade transition applies cleanly to the active `HTMLAudioElement` seamlessly over 2 seconds upon passing stage 2.
