# Crossclimb Implementation Guide

This document serves as the single source of truth for the **Crossclimb** game implementation, covering mechanics, UI/UX design, phase progression, and technical implementation.

## 1. Game Overview
Crossclimb is a word-ladder puzzle inspired by the LinkedIn Game. The user must solve a series of word clues and then arrange the words into a valid ladder where each adjacent word differs by exactly one letter (Hamming distance = 1).

## 2. Phase Progression
The game follows a strict 3-phase flow to guide the user through the mechanics:

### Phase 1: Fill & Drag (Middle Rows)
- **State**: Only the middle 4 rows are unlocked for typing. The top and bottom "end-cap" rows are locked (showing "🔒").
- **Mechanics**:
  - Users type the answers for the middle clues.
  - Users can drag and reorder middle rows immediately to start forming a ladder.
- **Visuals**: Active rows are teal/light blue; solved rows are light gray/white.

### Phase 2: Solve & Sort (Validation)
- **State**: Triggered when all middle words are solved.
- **Mechanics**:
  - The middle rows must be dragged into a sequence where each row has a character difference of exactly 1 from its neighbor.
  - Visual feedback (green "=" indicators) shows where the ladder connection is valid.
- **Transition**: Moves to Phase 3 once the middle sequence is a valid ladder.

### Phase 3: The End Caps Unlocked
- **State**:
  - Middle rows become **LOCKED** (cannot be edited or dragged).
  - The top and bottom rows become **UNLOCKED**.
- **Mechanics**:
  - The Hint Bar at the bottom displays a single shared hint for both top and bottom rows ("The top + bottom rows = [Hint]").
  - The user solves these final two words to complete the ladder.

## 3. UI/UX Design System
- **Background**: Light gray (`#f3f2ef`).
- **Cards**: White with subtle drop shadow, rounded corners.
- **Row Colors**:
  - **Locked/End-Caps**: Peach/Orange background (`#ffe7d9`).
  - **Active Input**: Blue gradient/borders.
  - **Solved/Valid**: Green tint/borders.
- **Drag Handling**: Robust animations using `@dnd-kit`. Smooth transitions as items swap positions.
- **Hint Bar**: Sticky bottom bar. Supports arrow navigation between clues in early phases.

## 4. Technical Implementation
- **Core Component**: `CrossclimbStage.tsx`
- **Drag-and-Drop**: Uses `@dnd-kit` with `SortableContext` and `verticalListSortingStrategy`.
- **Sensors**: Configured with `PointerSensor` (with 5px activation distance for mobile scrolling) and `KeyboardSensor`.
- **Validation Logic**:
  - `checkDistance(word1, word2)`: Computes Hamming distance.
  - `isLadderValid`: Memoized check for the full 6-word sequence.
  - `isMiddleSorted`: Memoized check for the 4 middle rows.

## 5. Verification
- **Unit Tests**: `src/features/riddles/linkedin/stages/__tests__/CrossclimbStage.test.tsx` verifies phase transitions and ladder logic.
- **Manual Verification**:
  1. Solve middle clues.
  2. Drag middle rows into a valid chain (verify "=" icons turn green).
  3. Verify top/bottom unlock and middle rows lock.
  4. Solve final clues and wait for `onAdvance` trigger.

---
*Merged and updated on March 27, 2026*
