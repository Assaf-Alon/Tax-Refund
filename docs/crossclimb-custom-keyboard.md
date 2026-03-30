# Crossclimb Custom Virtual Keyboard Implementation

The goal is to recreate the LinkedIn-style in-app keyboard for the Crossclimb game to avoid device keyboard overlapping and ensure the game board remain visible.

## Background Context

On mobile devices, the native keyboard often covers half of the screen, obscuring the game board and the hints. LinkedIn's Crossclimb implementation uses a custom virtual keyboard that stays docked at the bottom, with hints placed right above it, providing a consistent "native-app" feel and ensuring the puzzle remains visible.

## Implementation Details

### 1. `VirtualKeyboard` Component
A new component will be created in `src/features/riddles/linkedin/components/VirtualKeyboard.tsx`.

- **Layout**: 3 rows of staggered keys (QWERTY layout).
    - Row 1: Q, W, E, R, T, Y, U, I, O, P
    - Row 2: A, S, D, F, G, H, J, K, L (Indent: 20px)
    - Row 3: [Backspace], Z, X, C, V, B, N, M, [Enter] (Indent: 40px)
- **Styling**: 
    - Use `fixed` positioning at the bottom with `z-index: 100`.
    - `backdrop-blur-md` background with themed colors from `theme.ts`.
    - Key sizes: ~8-10% width, ~45px height.
    - Visual feedback: `active:scale-95 active:bg-[#ff007f]/20`.
- **API**:
    - `onKey(key: string)`: Callback for letter keys.
    - `onBackspace()`: Callback for backspace key.
    - `onEnter()`: Callback for enter/submit.

### 2. `CharacterInput` Refactoring
Modify `src/shared/ui/CharacterInput.tsx` to support a "fully controlled" mode:

- **New Props**:
    - `value?: string[]`: Controlled array of characters.
    - `activeIndex?: number`: Highlight the specific box with a custom cursor.
    - `onCharFocus?: (index: number) => void`: Callback when a specific box is clicked.
    - `readOnlyMode?: boolean`: When true, use `inputMode="none"` to prevent OS keyboard but maintain focus.
- **Custom Cursor**: When `activeIndex` matches, add a `border-b-2 border-pink-500 animate-pulse` to simulate a cursor.

### 3. `CrossclimbStage` Integration
Refactor `src/features/riddles/linkedin/stages/CrossclimbStage.tsx` to orchestrate the typing experience:

- **State Management**: 
    - `draftValues: Record<string, string[]>`: Tracks intermediate typing for each word.
    - `activeCharIndex: number`: Tracks which box in the row is being typed.
- **Coordination**:
    - Clicking a character in a `CharacterInput` updates `activeCharIndex`.
    - Typing on `VirtualKeyboard` updates `draftValues[rowId][activeCharIndex]` and increments `activeCharIndex`.
- **Layout Refactoring**:
    - Add `pb-64` (or dynamic padding) to the scrollable container.
    - Keyboard + Hint Bar container should be `fixed bottom-0`.
- **Phase Handling**: 
    - Hide keyboard when `phase === 'REORDER'`.
    - Show keyboard when `phase === 'FILL'` or `phase === 'FINAL'`.

## Detailed Plan for Junior Developer

1.  **Skeleton**: Create `VirtualKeyboard.tsx` with the staggered QWERTY grid using Flexbox.
2.  **CharacterInput**: Update `CharacterInput.tsx` to use `inputMode="none"` when `readOnlyMode` is enabled.
3.  **Controlled Logic**: In `CrossclimbStage`, lift the state of the active row into `draftValues`.
4.  **Wiring**:
    - Connect `onKey` to update the `draftValues` array.
    - Implement backspace to clear the current cell or move back.
    - Synchronize the window `keydown` events with the same `handleVirtualKey` logic.

## Verification

### Automated
- Unit tests for `VirtualKeyboard` key triggers.
- Integration test for `CrossclimbStage` receiving a virtual 'A' and updating the state.

### Manual
- Emulate mobile device in Chrome.
- Verify no native keyboard appears on click.
- Verify the game board scrolls comfortably above the keyboard.
