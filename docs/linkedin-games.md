# LinkedIn Games: Comprehensive Design & Technical Specification

This document serves as the single source of truth for the LinkedIn-inspired riddles suite, including **Crossclimb**, **Pinpoint**, and **Queens**, as well as the shared **Leaderboard** and **Virtual Keyboard** components.

---

## 1. Global Identity & UX Vision

The LinkedIn Games riddle mimics the professional, high-fidelity aesthetic of LinkedIn's native casual games. It provides a seamless transition from word logic to category logic and finally spatial logic.

### 1.1 Visual Design System
- **Background**: Light gray (`#f3f2ef`) for a professional "native app" feel.
- **Card UI**: White cards with subtle borders (`#e0e0e0`), rounded corners (`rounded-xl`), and soft drop shadows.
- **Typography**: Clean, bold sans-serif (Inter/System) with high contrast for readability.
- **Theme Management**: Centralized in `src/features/riddles/linkedin/theme.ts`.
- **Responsive Layout**: Uses `dvh` (Dynamic Viewport Height) to ensure the UI fits within the visible area even when the mobile browser bar or OS keyboard is active.

### 1.2 Performance & Feedback
- **Transitions**: Staggered animations for list entries (e.g., Leaderboard).
- **Success Feedback**: Momentary animations (glows, pulses) when a word or stage is completed.
- **Micro-delays**: A 400ms delay is implemented in stage transitions (e.g., moving between rows in Crossclimb) to avoid "abrupt" jumps and give users a sense of accomplishment.

---

## 2. Shared Technical Components

### 2.1 Virtual Keyboard (`VirtualKeyboard.tsx`)
To prevent the native OS keyboard from obscuring the game board, a custom virtual keyboard is used for all text-input games.
- **Layout**: Staggered 3-row QWERTY layout.
  - Row 1: Q, W, E, R, T, Y, U, I, O, P
  - Row 2: A, S, D, F, G, H, J, K, L
  - Row 3: [Backspace], Z, X, C, V, B, N, M, [Enter]
- **Key Styling**: ~8-10% width, ~45px height. Visual feedback on active (`scale-95`).
- **Hook (`useKeyboardInput.ts`)**: Orchestrates physical keyboard events (`A-Z`, `Backspace`, `Enter`, `Space`) to match virtual keyboard actions, ensuring a consistent experience across desktop and mobile.

### 2.2 Metrics & Timing
- **Measurement**: Each stage tracks `startTime` on mount and calculates `elapsedSeconds` upon completion.
- **Persistence**: Metrics are stored in the global `GameState` under `riddleMetrics: Record<string, Record<string, number>>` (riddleId -> gameKey -> seconds).

---

## 3. Crossclimb Deep Dive

A word-ladder puzzle where each adjacent word differs by exactly one character (Hamming distance of 1).

### 3.1 Word Set & Theming
The ladder uses a developer-focused, crypto-themed word set to engage the professional audience:
- **Terminal 1**: `stark` (crypto protocol)
- **Middle 1**: `stack` (full-stack developer)
- **Middle 2**: `snack`
- **Middle 3**: `slack` (communication app)
- **Middle 4**: `black` (python formatter)
- **Terminal 2**: `block` (blockchain unit)

Both terminal words share the hint: *"The structural foundations of a decentralized network"*.

### 3.2 Three-Phase Mechanics
1. **Phase 1: Fill & Drag**: Middle 4 rows are interactable. Users solve clues and can immediately start reordering rows.
2. **Phase 2: Solve & Sort**: Triggered once middle words are solved. Users must arrange them into a valid ladder. Valid connections are highlighted with green `=` icons and a "connection glow".
3. **Phase 3: The End Caps**: Middle rows **LOCK** (no edit/drag). Top and bottom rows **UNLOCK**. A shared hint is displayed for both terminal words.

### 3.3 Mobile & Logic Optimizations
- **Dynamic Terminal Rows**: If the user sorts the middle ladder in reverse, the top and bottom words ("stark" vs "block") swap identities automatically to maintain valid connections.
- **Touch Sensors**: Uses `@dnd-kit/core` with `TouchSensor` (250ms press delay, 5px tolerance) to prevent drag interference with page scrolling.
- **Layout Compactness**: Reduced header padding (`pt-4` on mobile) and row margins to ensure the entire 6-word grid fits on smaller screens.
- **Performance**: Sensors are memoized to prevent re-initialization on every keystroke. CSS transitions are disabled during active dragging for smoothness.

### 3.4 Deterministic Initialization & Complexity
To ensure a consistent challenge and maximize user movement during the "drag-and-drop" phase, the initial middle word order is fixed rather than randomized.
- **Ordering Strategy**: A specific non-chaining permutation `[black, snack, stack, slack]` (indices 4, 2, 1, 3) is used.
- **Complexity**: This configuration requires exactly **3 drag operations** to reach the target sequence, maximizing the sorting effort for a 4-word set.
- **Phase Control**: By avoiding a valid 1-distance chain in the initial state, the game guarantees that the "REORDER" phase is presented to the user and not skipped.

---

## 4. Pinpoint Deep Dive

A category guessing game where 5 clues are revealed sequentially.

### 4.1 UI & Mechanics
- **Clue Reveal**: Clue slots use a fixed blue gradient (`#a8caff` to `#3e87e6`). Incorrect guesses reveal the next clue.
- **Input Area**: Replaces standard HTML `input` with a stylized `div` showing a blinking caret to prevent the native keyboard from appearing.
- **Progress**: A pill-shaped "X of 5" counter tracks the number of clues revealed.

---

## 5. Queens Deep Dive

A 9x9 spatial grid puzzle where players place 9 queens following non-adjacency and region constraints.

### 5.1 Mechanics
- **Constraints**: Exactly one queen per row, column, and colored region. No diagonal or orthogonal adjacency with other queens.
- **Auto-marking**: Automatically grays out or places 'X's on cells where queens cannot be placed based on current placements.
- **Visibility Polish**: High-contrast "X" marks (`text-white/40`) on dark blue/slate tiles to ensure visibility on mobile screens.

---

## 6. Leaderboard & Progression

### 6.1 Design Rationale & Mechanics
- **"Silver Medal" Placement**: The user is always placed in **2nd place** to provide a challenging but rewarding "Executive" experience.
- **Mock Competitors**: 1st place is calculated at 85% of the user's time; 3rd at 120%.
- **Completion States**: After the final game (Queens), the `isLastGame` prop triggers the button text to change from "Play Next" to "View Final Results" or "Complete Challenge".

### 6.2 Easter Eggs & Satirical Insights
To enhance the satire of professional culture, humorous "Insight for you" cards are displayed on the leaderboard after each stage.

- **Goal**: Maintain the "professional" parody theme by providing corporate-style feedback.
- **Technical Implementation**:
    - **Data Source**: Quotes are centralized in [easterEggs.ts](file:///home/cowclaw/Tax-Refund/src/features/riddles/linkedin/data/easterEggs.ts).
    - **Mapping**: Uses a `GAME_SPECIFIC_EGGS` Record to explicitly assign unique quotes to each game (Crossclimb, Pinpoint, Queens).
    - **Selection Utility**: A `getEasterEgg` helper manages lookup and fallback logic (using a list of `DEFAULT_EASTER_EGGS`).
- **UI/UX Design**:
    - **Style**: "LinkedIn Insight" aesthetic using a light gray background (`#f8f9fa`) and a `Lightbulb` icon.
    - **Motion**: Utilizes tailwind-inspired `animate-in fade-in slide-in-from-bottom-2` with a `delay-300` to appear smoothly after the rankings.

---

## 7. Verification Plan

### 7.1 Automated Testing
- **Logic**: Verify Hamming distance, 9x9 grid constraints, and stage transition delays.
- **Easter Eggs**: Assert that each game stage renders its specifically assigned satirical insight on the leaderboard via `LeaderboardStage.test.tsx`.
- **Flow**: Verify `useKeyboardInput` correctly handles both virtual and physical inputs across different game stages.

### 7.2 Manual Verification (Mobile focus)
- **Compactness**: Ensure all game boards and the custom virtual keyboard fit within small mobile viewports (320px+).
- **Interactions**: Confirm touch-sensor delays (250ms) and queens auto-marking behavior.
- **Aesthetics**: Verify that the "Insight for you" card responds to dark mode and matches the LinkedIn palette.


