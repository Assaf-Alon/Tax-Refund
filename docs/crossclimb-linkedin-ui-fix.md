# Design Document: Crossclimb Dynamic Logic & UI Compactness

Resolve the "fixed end-cap" bug and optimize the mobile layout for better visibility.

## 1. Goal Description
The Crossclimb game currently has two main issues:
1.  **Rigid Logic**: The top and bottom words (end-caps) are hardcoded in position. This prevents the user from forming a valid word ladder in the reverse order (e.g., `store` at the top instead of `stark`), even if the middle words are correctly solved.
2.  **UI Overcrowding**: On mobile devices, the combination of the progress tracker, game title, and word grid requires excessive scrolling. The spaces between words are too large, and the header area is too tall.

## 2. Approach & Rationale

### 2.1 Dynamic End-cap Logic
**Problem**: `isLadderValid` checks the fixed `rows` array, where `rows[0]` is always `stark` and `rows[5]` is always `store`.
**Solution**:
- Allow **all rows** to be draggable in the `REORDER` phase (once middle words are solved).
- Update `isLadderValid` to verify if the words form a continuous chain of distance 1, regardless of which word is at which end.
- This allows the user to solve the ladder "forwards" or "backwards" based on their intuition.

### 2.2 UI Compactness
**Header Reduction**:
- Reduce the top padding of the main container in `LinkedInGames.tsx` from `pt-16` to `pt-4` on mobile.
- Reduce the bottom margin of `ProgressHUD` from `mb-8` to `mb-2`.

**Word Grid Compactness**:
- In `CrossclimbStage.tsx`, reduce the vertical gap between rows.
- Remove the `h-3` (12px) spacer between rows and rely on a smaller `gap-1` (4px).
- Reduce `SortableRow` height slightly (from `h-14` to `h-12`) to fit more rows on screen.

### 2.3 Additional Idea: "Connection Glow"
**Concept**: To make the game feel "continuous and dynamic", we will add a visual "link" effect.
- When two adjacent rows form a valid link (distance 1), the separator (`=`) will glow and a subtle vertical line will connect the rows.
- This provides immediate feedback during the `REORDER` phase and helps the user build the chain piece by piece.

## 3. Implementation Details

### 3.1 LinkedInGames.tsx
- Update the `main` container classes to use responsive padding: `pt-4 md:pt-24`.
- Update `ProgressHUD` margin: `mb-2 md:mb-8`.

### 3.2 CrossclimbStage.tsx
- **State initialization**: Keep the same `WORDS`, but allow `stark` and `store` to be moved during the reorder phase.
- **`isMiddleRow` logic**: Redefine to allow dragging of "locked" rows when they are solved or when in `REORDER` phase.
- **`isLadderValid`**: Ensure it checks the full sequence.
- **CSS Transitions**: Ensure the compacting of rows doesn't break the drag-and-drop animation.

## 4. Verification

### Automated Tests
- Test `isLadderValid` with reversed word order.
- Verify `ProgressHUD` styling changes.

### Manual Verification
- Test on mobile emulator to ensure the entire word grid is visible without scrolling (or with minimal scrolling).
- Verify the "fwd and bwd" capability by sorting the middle words differently and ensuring the end-caps can accommodate.
