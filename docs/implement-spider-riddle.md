# Spider Lair Riddle Implementation Plan

Implementation of a spider-themed riddle inspired by Silksong (Hornet) and Undertale (Muffet).

## Technical Architecture

To ensure scalability (as 5+ more stages will be added), we move from a flat file to a modular feature structure.

### 1. New File Structure
```text
src/
├── shared/ui/
│   ├── CharacterInput.tsx      # Reusable hangman-style input
│   ├── HintButton.tsx           # Cooldown-based hint system
│   └── PinPad.tsx              # Generic 0-9 keypad (reusable)
├── features/riddles/spider-lair/
│   ├── assets/                 # Move Clawmaiden.png, Carrefour.png, etc. here
│   ├── stages/
│   │   ├── EntranceStage.tsx
│   │   ├── PasscodeStage.tsx
│   │   ├── LyricsStage.tsx
│   │   ├── SkarrsingerStage.tsx
│   │   └── CreatureStage.tsx
│   ├── SpiderLair.tsx          # Main container / State machine
│   └── CongratsPage.tsx        # Final success screen
```

### 2. Integration & Routing

#### [MODIFY] `src/App.tsx`
- Import `SpiderLair` from `features/riddles/spider-lair/SpiderLair`.
- Add a new route under the `<RiddleLayout>`: `<Route path="/spider-lair" element={<SpiderLair />} />`.


### 2. Implementation Specifications

#### [NEW] `CharacterInput.tsx` (Shared UI)
- **Props**: 
  - `expectedValue: string` (e.g., "DATE")
  - `onComplete: () => void`
  - `showGuide?: boolean` (whether to show underscores/boxes)
- **State**: `Array<string>` (one char per box).
- **UX Logic (The Focus Algorithm)**:
  - To ensure "one-shot" success, use the following approach:
  - 1. Create a `ref` array for all inputs: `const inputs = useRef<HTMLInputElement[]>([]);`.
  - 2. `onChange`: If a character is entered, find the next **enabled input** in the `inputs.current` array and `.focus()` it.
  - 3. `onKeyDown (Backspace)`: If the current box is empty, find the previous **enabled input** and `.focus()` it.
  - 4. Render constant characters (spaces, punctuation) as `<span>` elements so they are skipped by the focus logic.
- **Styling**: `border-pink-500`, `bg-black`, `text-pink-200`, `w-8 h-10` text-center, `rounded-sm`.

#### [NEW] `HintButton.tsx` (Shared UI)
- **Props**: `hint: string`, `cooldownSeconds: number`.
- **State**: `timeLeft: number` (initially `cooldownSeconds`), `showHint: boolean`.
- **Logic**: 
  - Do NOT use `localStorage`. Use `useEffect` with `setInterval` to decrement `timeLeft` on mount.
  - The timer resets if the user refreshes the page (session-only behavior).
  - Button is disabled until `timeLeft === 0`.

#### [NEW] `PinPad.tsx` (Shared UI)
- **Logic**: Re-implement the keypad from `PinGate.tsx` but as a generic component that accepts a `onDigit` and `onBackspace` callback. This will be used in `PasscodeStage`.
- **Cleanup**: Reuse the new class in `PinGate.tsx` to avoid code duplication.

#### [NEW] `SpiderLair.tsx` (Main Feature)
- **State**: `stage: number`.
- **Logic**:
  - `useEffect`: On mount, call `getRiddleProgress('spider-lair')` and set the initial `stage`.
  - `handleAdvance`: A function passed to stages that calls `updateRiddleProgress('spider-lair', nextStage)` and sets local `stage` state.
- **Render**: Switch-case based on `stage`.
- **Theme**: Use HSL for gradients: `background: radial-gradient(circle, #2d0036 0%, #000000 100%)`.

### 3. Stage Content Details

| Stage | UI Component | Prompt / Logic | Expected Answer |
| :--- | :--- | :--- | :--- |
| **0** | `EntranceStage` | "Enter the Webs" button. | N/A |
| **1** | `PasscodeStage` | 4-digit PIN layout (using `PinPad`). | `2468` |
| **2** | `LyricsStage` | Show "2, 4, 6, 8". <br>Line 2: `I think it's time for a date`<br>Line 3: `I've got a craving and I think you're my taste`<br>Line 4: `So won't you come out and play?`<br>Line 5: `Darling it's your lucky day` | Each line is a `CharacterInput`. <br>Static text for spaces and `'`, `?`. |
| **3** | `SkarrsingerStage`| "I sing, I fight, I kill. But mostly kill" | `Skarrsinger Karmelita` |
| **4** | `CreatureStage` | Show `Clawmaiden.png`. Free text input. | `Clawmaiden` (case insensitive) |
| **5** | `CongratsPage` | Show `Carrefour.png`, `git-gud.gif`. | N/A |

### 4. Styling Tokens (Tailwind)
- **Primary**: `text-[#ff007f]` (Spider Pink)
- **Accent**: `border-[#b0005d]` (Darker Pink for borders)
- **Background**: `bg-black`
- **Glow**: `shadow-[0_0_15px_rgba(255,0,127,0.5)]`
- **Animations**: Add a "web" background effect (subtle repeating lattice using a SVG pattern or CSS mask).

### Automated Tests (Basic)

Use Vitest and React Testing Library (RTL) for these smoke tests.

#### 1. `shared/ui/__tests__/CharacterInput.test.tsx`
- **Focus Flow**: Verify that typing a character automatically moves focus to the next input, skipping any static span (like a space or apostrophe).
- **Backspace Flow**: Verify that pressing Backspace in an empty input moves focus to the previous input, skipping static spans.
- **Completion**: Verify `onComplete` is called once all inputs match the `expectedValue`.

#### 2. `shared/ui/__tests__/HintButton.test.tsx`
- **Timer Logic**: Use `vi.useFakeTimers()` to verify that the button stays disabled and shows the countdown, then enables after the specified `cooldownSeconds`.

#### 3. `features/riddles/spider-lair/__tests__/SpiderLair.test.tsx`
- **Smoke Test**: Verify the main container renders `EntranceStage` (Stage 0) by default.
- **State Sync**: Verify it calls `updateRiddleProgress` when advancing a stage.

## Verification Plan

### Manual Verification
1. **Focus Flow**: Tab through `CharacterInput` and verify auto-jump on typing.
2. **Persistence**: Solve Stage 1, refresh, ensure Stage 2 is active.
3. **Cooldown**: Wait the full 60s for a hint. Verify it unlocks at `0s`.
4. **Mobile**: Verify `CharacterInput` wraps on small screens (use `flex-wrap`).
