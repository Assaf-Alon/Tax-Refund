# Queens Stage Design Document

## What

Add a new **Queens** stage as the final puzzle in the LinkedIn games riddle sequence. The stage presents a 9x9 grid, exactly like the demo, where the player must place **9 queens** such that:
1. Exactly one queen per row, column, and colored region.
2. No two queens may be adjacent, including diagonally.
3. The grid uses the official LinkedIn color palette for regions, except the central region (Region 9, the "heart") which will use a slightly stronger purple/red color to pop out.
4. The UI follows the existing theme (LinkedIn blue, white, and subtle gradients) and uses the same icon set.
5. Upon successful placement, the stage unlocks the next "Congrats" stage, moving forward just like the previous games.

### Grid Layout
The grid is a 9x9 map divided into 9 regions. Below is the exact region assignment for each cell that must be used:
```ts
const GRID_MAP = [
  [1, 1, 1, 1, 2, 2, 2, 2, 3],
  [1, 1, 9, 9, 2, 9, 9, 3, 3],
  [1, 9, 9, 9, 9, 9, 9, 9, 3],
  [8, 9, 9, 9, 9, 9, 9, 9, 3],
  [8, 8, 9, 9, 9, 9, 9, 4, 4],
  [7, 8, 7, 9, 9, 9, 5, 5, 4],
  [7, 7, 7, 6, 9, 5, 5, 5, 4],
  [6, 6, 6, 6, 5, 5, 4, 4, 4],
  [6, 6, 6, 5, 5, 5, 5, 5, 4]
];
```

## Why

- **Consistency**: Extends the existing LinkedIn games progression with a classic puzzle that matches the visual and interaction patterns of the previous stages.
- **User Flow**: Placing the Queens stage last provides a satisfying climax before the final congratulatory screen.
- **Brand Alignment**: Using LinkedIn’s official colors ensures brand consistency.

## How

### Important Note on Implementation
The provided demo (`queens-demo.tsx`) is a reference for the game rules and grid layout, but **do not blindly copy-paste its implementation**. The demo is written using raw HTML-like state and unoptimized render loops. The actual implementation must be idiomatic React: utilizing proper hook boundaries, semantic accessible HTML, separating game logic from presentation, and following the repository's existing UI principles.

### Files to Add / Modify
- `docs/queens-implementation.md` – this design document.
- `src/features/riddles/linkedin/stages/QueensStage.tsx` – new React component implementing the game logic. **Alignment Guidance:** To comply with repository conventions (like `CrossclimbStage` and `PinpointStage`), the component must accept strictly: `interface QueensStageProps { onAdvance: () => void; }`. Do not use generic names like `onStageComplete`.
- Stage routing registry (e.g. wherever stages like Pinpoint/Crossclimb are sequenced) – ensure Queens appears after Pinpoint and navigates to the congrats stage upon completion.

### Component Overview (`QueensStage.tsx`)
1. **State Management & Auto-marking**
   - Idiomatic React state for placed queens (`{r, c}[]`) and manual user marker 'X's.
   - **Auto-marking feature (CRUCIAL):** The game must automatically grey out or place semi-transparent 'X's on all rows, columns, and regions that are mathematically eliminated by the currently placed queens.
   - Memoized conflict detection (checking rows, columns, specific regions, and king-move adjacency).
2. **Region Colors & UI Icons**
   - The UI must use `lucide-react` icons specifically: `<Crown />` for queens, `<X />` for marks, `<RotateCcw />` for resetting, and `<Heart />` for the win screen.
   - Use the exact colors from the demo for the regions:
     - 1: `bg-[#cbd5e1]`, 2: `bg-[#94a3b8]`, 3: `bg-[#d1d5db]`, 4: `bg-[#e2e8f0]`
     - 5: `bg-[#9ca3af]`, 6: `bg-[#64748b]`, 7: `bg-[#bfdbfe]`, 8: `bg-[#f1f5f9]`
   - Make sure Region 9 (the Heart in the center) pops out with a stronger purple/red color: `bg-[#be123c]`.
3. **Navigation**
   - **Repo Convention:** Once all 9 queens are correctly placed with no conflicts, wait precisely 2-3 seconds (`setTimeout(onAdvance, 2000)` or `3000`) before calling `onAdvance()` to advance the stage. This allows the user a moment to see the completed state and stays consistent with `CrossclimbStage` and `PinpointStage`.
4. **Styling**
   - Tailwind-based grid layout using `grid-template-columns`. Outline region boundaries with proper custom borders computed based on the `GRID_MAP`.

## Verification
1. **Automated Tests**: Add tests parsing the `GRID_MAP` layout and asserting that adjacency, row, col, and region constraints behave correctly when placing queens. Overlaps or violations must trigger error states.
2. **Manual Playthrough**: Validate the color scheme, check that Region 9 visibly pops out, and confirm transitions happen seamlessly to the next stage upon solving the 9th valid placement.
