# Design Document: LinkedIn Games UX Polish

Improve visibility, responsiveness and feedback across Pinpoint, Crossclimb, and Queens games.

## 1. Goal Description
The LinkedIn-inspired games need better mobile UX. Specifically:
- **Queens**: The "x" marks on blue tiles are hard to see.
- **Crossclimb**: Transitioning between words after a correct entry is too abrupt.
- **Crossclimb & Pinpoint**: The UI does not fit some screens and is broken by the mobile keyboard.

## 2. Approach & Rationale

### 2.1 Queens Visibility
**Problem**: `text-slate-800` at `opacity-20` on blue backgrounds (`bg-[#6366f1]` or `bg-[#0ea5e9]`) is nearly invisible.
**Solution**: Use a brighter color for "x" marks when not on the heart tile (Red), or increase the base opacity. Specifically, `text-white/40` or `text-slate-100/30` will stand out better on dark/saturated colors.

### 2.2 Crossclimb Feedback
**Problem**: The immediate jump to the next clue/row after typing the last character of a correct word feels like a glitch and doesn't give much "win" feedback.
**Solution**:
- Add a 400ms delay in `handleWordComplete` before shifting `activeIndex`.
- Add a momentary `scale-pulse` or a "green glow" to the row when it becomes solved.

### 2.3 Responsive Layouts (Mobile Keyboard)
**Problem**: The fixed clue bar in Crossclimb is at `bottom-0`. On mobile, `100vh` often includes the area under the keyboard or the browser bar.
**Solution**:
- Use `dvh` (Dynamic Viewport Height) to size containers.
- Wrap the main game areas in a `max-h-[75dvh]` container with `flex-grow` and `overflow-y-auto` if necessary, but aim to fit it all in the visible area.
- Ensure the active input row scrolls into view and is not covered by the fixed clue bar.

## 3. Implementation Details

### 3.1 Queens
- Update `isAutoMark` / `isManualMark` styling.
- Change `opacity-20` to `opacity-40` for auto-marks.
- For blue tiles, use `text-white` with low opacity instead of `text-slate-800`.

### 3.2 Crossclimb Focus
- Use a `setTimeout` for focus transition.
- Track "justSolvedId" to apply a temporary "success" animation class.

### 3.3 Layout Refactoring
- Wrap stages in a `h-[100dvh]` or `min-h-[100dvh]` container.
- For `PinpointStage`, use more flexible row sizes (e.g. `flex-1` instead of `h-14` if height is limited).
- For `Crossclimb`, move the "fixed" clue bar to a `sticky` bottom position or ensure the parent has enough padding/margin to account for it.

## 4. Verification

### Automated Tests
- Verification of state changes (e.g., delay in focus move).
- No regression in "solve" logic.

### Manual Verification
- Test in mobile emulator (320px, 375px widths).
- Simulate keyboard popup by shrinking viewport height.
