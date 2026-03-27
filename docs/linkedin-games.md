# LinkedIn Games Design Document

This document provides a comprehensive overview of the LinkedIn-inspired riddles: **Crossclimb**, **Pinpoint**, and **Queens**. It centralizes information from previously separate design files to provide a single, consistent reference for the feature.

---

## 1. Overview & Vision

The LinkedIn Games riddle is a sequence of puzzles that mimic the professional, clean aesthetic and mechanics of LinkedIn's native casual games. It transition from word logic (Crossclimb) to category logic (Pinpoint) to spatial logic (Queens).

### Visual Identity (Global)
- **Background**: Light gray (`#f3f2ef`) for that professional feel.
- **Card**: White with subtle drop shadow and rounded corners.
- **Typography**: Clean, bold, and professional.
- **Centralized Theme**: Colors and styles are managed in `src/features/riddles/linkedin/theme.ts`.

---

## 2. Crossclimb

A word-ladder puzzle game where each step differs by exactly one character (Hamming distance of 1).

### Game Mechanics & 3-Phase Progression

#### Phase 1: Fill & Drag (Middle Rows)
- **Initial State**: Middle rows are unlocked and interactable. Top and bottom "end cap" rows are locked.
- **Action**: Users solve clues by typing and can rearrange middle rows using drag-and-drop handles.

#### Phase 2: Solve & Sort (Validation)
- **Requirement**: All middle words must be correctly typed and rearranged so that every adjacent middle word has a Hamming distance of 1.
- **Trigger**: Once `isMiddleSorted` is true, Phase 3 activates.

#### Phase 3: Unlocking the End Caps
- **Action**: Middle rows permanently **LOCK** (no edit, no drag). Top and bottom rows **UNLOCK**.
- **Clue Bar**: Switches to a single, shared clue for the final two words.

### Technical Details
- uses `@dnd-kit` with `restrictToVerticalAxis` and `restrictToWindowEdges` modifiers for smooth, constrained interaction.
- `checkDistance(word1, word2)` validates the Hamming distance.

---

## 3. Pinpoint

A category guessing game where 5 clues are revealed one by one.

### UI Structure
- **5 Clue Slots**: Always rendered with a fixed top-to-bottom blue gradient (`#a8caff` to `#3e87e6`).
- **State Logic**: 
  - Unrevealed: Shows "CLUE X" in centered, bold uppercase.
  - Revealed: Shows the actual clue text.
- **Input Area**: Pill-shaped "X of 5" counter on the far right.
- **Failure Logic**: An incorrect guess reveals the next clue (increments `revealedCount`).
- **Success Logic**: All 5 clues reveal immediately.

---

## 4. Queens

A 9x9 spatial grid puzzle where players must place exactly 9 queens.

### Rules
1. Exactly one queen per row, column, and colored region.
2. No two queens may be adjacent (including diagonally).
3. The grid uses a 9-region map, including a central "heart" region.

### UI & Interaction
- **Auto-marking**: The grid automatically greys out or places semi-transparent 'X's on eliminated cells.
- **Region Colors**: Uses discrete shades of slate/blue/gray, with a vibrant red/purple (`bg-[#be123c]`) for the heart region.
- **Icons**: Uses `lucide-react` icons (Crown, X, RotateCcw).
- **Completion**: A 2-3 second delay occurs upon the 9th valid placement before advancing.

---

## 5. Implementation & Routing

- **Directory**: `src/features/riddles/linkedin/`
- **Main Stage Registry**: `LinkedInGames.tsx`
- **Theme File**: `theme.ts` (Centralizes colors for Welcome and Congrats screens).

## 6. Verification Plan

### Automated
- `npm test` checks for phase transition lock states in Crossclimb.
- `PinpointStage` tests verify the guess reset on failure.
- Queens logic tests assert correct constraint validation (row, col, region, adjacency).

### Manual
- **Crossclimb**: Verify vertical drag constraints and mid-game locking.
- **Pinpoint**: Test the "reveal on error" flow and input reset.
- **Queens**: Ensure auto-marking assists the player effectively.
- **Global**: Toggle light/dark mode and verify subtitle contrast on the Congrats screen.
