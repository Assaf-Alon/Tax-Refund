# Comprehensive Crossclimb Game Design Document

## 1. Overview
Crossclimb is a word-ladder puzzle game inspired by the LinkedIn games sequence. The objective is to fill out a sequence of words (a "ladder") where each adjacent word differs by exactly one character (Hamming distance of 1).

## 2. Visual Identity & UI
- **Background**: Light gray (`#f3f2ef`) or adapt to dark mode.
- **Card**: White with subtle drop shadow and rounded corners.
- **Rows**:
  - **Locked (Top/Bottom)**: Peach/Orange styling in initial states, or disabled styling. 
  - **Active**: Elevated styling (e.g., Light Blue background) to indicate it's currently focused.
  - **Solved/Pending**: Distinct visual states. `react-beautiful-dnd` or `@dnd-kit` elevated drop shadows during dragging.
- **Clue Bar**: A sticky bar at the bottom showing the clue for the active row. It includes "Previous" and "Next" arrows for navigating between clues.
- **Animations**: Uses `@dnd-kit/core` and `@dnd-kit/sortable` for fluid, frame-perfect drag-and-drop animations on both Desktop and Mobile. 

## 3. Game Mechanics & 3-Phase Progression

The game strictly enforces a 3-phase flow:

### Phase 1: Fill & Drag (Middle Rows)
- **State**: The middle rows are unlocked and interactable. Top and bottom "end cap" rows are locked.
- **Mechanics**: 
  - The user must solve the clues for the middle rows by typing the correct answers.
  - The user can drag and drop the middle rows at any time (even before solving) using `@dnd-kit` handles.

### Phase 2: Solve & Sort (Validation)
- **State**: All middle words have been correctly typed.
- **Mechanics**: 
  - The player must rearrange the middle rows so that every adjacent middle word differs by exactly 1 letter.
  - The game evaluates `isMiddleSorted` by verifying that all middle words are typed correctly AND their sequential Hamming distance is 1.

### Phase 3: Unlocking the End Caps (Final)
- **State/Trigger**: Activated immediately when `isMiddleSorted` evaluates to true.
- **Mechanics**:
  - The middle rows permanently **LOCK**. They can no longer be edited or dragged.
  - The top and bottom rows **UNLOCK**.
  - The Clue Bar at the bottom locks onto a single, shared clue for both the top and bottom words (e.g., *"The top + bottom rows = To keep value secure..."*). Navigation arrows disappear.
  - The player types the final answers into the top and bottom rows.
  
### Win Condition
- The game is won when the top and bottom rows are correctly typed, forming a complete 6-word ladder where every single step has a Hamming distance of 1.

## 4. Technical Implementation Details

### State Management
- `rows`: Array of word objects, middle rows are initially shuffled.
- `solvedWords`: Record of which rows are correctly solved.
- `activeIndex`: Currently focused row index.
- Derived states: `isMiddleSolved`, `isMiddleOrdered`, `isLadderValid`.

### Drag and Drop
- Installed `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`.
- `<DndContext>` wraps the Sortable interface.
- Includes `PointerSensor` and `KeyboardSensor`.
- Uses `arrayMove` to update the row sequence in state upon `onDragEnd`.
- `<SortableRow>` component uses `useSortable` for transforms and transition properties.

### Validation Helpers
- `checkDistance(word1, word2)`: Computes the Hamming distance (number of differing characters) between two strings of equal length.

## 5. Verification Plan
- **Automated Tests**: React Testing Library checks for phase transition lock states, verifying `isMiddleSorted` triggers the Phase 3 UI changes.
- **Manual Flow**: Verify drag interactions on both mouse and touch interfaces. Confirm the middle rows correctly lock when ordered, and the bottom hint properly merges into the shared hint format.
