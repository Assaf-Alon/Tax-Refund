# Design: Crossclimb Refactor

This document details the refactor of the Crossclimb game to better match the LinkedIn Games experience.

## 1. UI/UX Changes

### Visual Identity
- **Background**: Light gray (`#f3f2ef`).
- **Card**: White with subtle drop shadow and rounded corners.
- **Rows**:
  - **Locked (Top/Bottom)**: Peach/Orange background (`#ffe7d9`), dark brown lock icon. Shared clue "The Company".
  - **Active**: Teal/Light Blue background (`#70b5f9` or similar). Shows underscores for the word.
  - **Pending/Solved**: Light gray or white.
- **Clue Bar**: A sticky bar at the bottom showing only the clue for the active word (or selectable via arrows).

### Clue Navigation
- Only one clue is displayed at a time.
- Users can use "Previous" and "Next" arrows to view clues for different rows.
- Selecting a clue focuses the corresponding row in the ladder.

## 2. Jumbled Answer Logic (Reordering)

Instead of typing directly into the ladder, the game will follow this sequence:
1.  **Solve Phase**:
    -   User selects a row and its clue is displayed.
    -   User solves the word (e.g., typing "STOCK").
    -   The word is "solved" but its position in the ladder must be correct.
2.  **Reorder Requirement**:
    1.  The user must solve all middle words.
    2.  Once solved, if the logic of "one letter change" is not maintained, the user must rearrange the words.
    3.  Alternatively: The words are entered, but the game checks for the "one letter change" validity between all rows once the top/bottom are unlocked.

*Actually, simple implementation*:
- The user solves clues row-by-row.
- If they solve a word, it fills that row.
- The challenge is that they must ensure the ladder sequence stays valid.
- The user said "missing step ... of the 'reordering'". 
- I will implement a "Shuffle" button or allow dragging rows to reorder them if they are in the wrong place.

## 3. Updated Content
- **Words**:
  1. `stark` (Locked)
  2. `stack` (Unlocked)
  3. `stick` (Unlocked)
  4. `stock` (Unlocked)
  5. `stuck` (Locked)
- **Shared Clue**: Top and Bottom rows display "The Company" as their clue.

## 4. Components
- `CrossclimbLadder`: The main ladder UI with rows.
- `ClueController`: The bottom bar for clue navigation and display.
- `LadderRow`: Now supports different states (Locked, Active, Solved).

## 5. Verification
- Manual verification via browser to ensure the "Feel" matches the provided screenshot.
- Verify locking logic: `stark`/`stuck` only editable after middle 3 are correct.
