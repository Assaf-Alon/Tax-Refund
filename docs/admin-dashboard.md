# Admin Dashboard

## What

A hidden admin dashboard reachable from the home page's "Privacy Policy" footer link. It allows the game master to:

1. See all riddles, their current stage, and completion status at a glance.
2. Jump to any stage of any riddle (for dev testing and emergency fixes).
3. Reset progress on a single riddle.
4. Reset all progress across all riddles.
5. Toggle developer settings like Dev Tools overlay and local PIN bypass.
6. Access standalone utilities like the Outer Wilds Translator.

The dashboard is protected by a 4-digit PIN (`0000`), entered via a touchscreen-friendly numeric pad. In local development environments (`import.meta.env.DEV`), the PIN can be bypassed automatically if the setting is enabled.

## Why

Two use cases drive this feature:

1. **During development** — quickly jump between stages without playing through every riddle manually.
2. **During the live game** — if a player hits a bug, the game master can take their phone, open the dashboard, and reset or skip past the broken stage.

### Alternatives considered

- **Browser DevTools / manual localStorage editing** — works but clunky, error-prone, and not feasible when borrowing a player's phone mid-game.
- **Query-parameter cheats** (e.g. `?skip=3`) — scattered across riddle files, hard to discover, no overview of state.

## How

### Core concept: Riddle Registry

Riddle metadata is centralized in the **riddle registry** (`src/shared/logic/riddleRegistry.ts`), a single array that the dashboard consumes. When a new riddle is added, it is registered here so the dashboard automatically supports it.

```ts
export interface RiddleMeta {
  id: string;
  name: string;
  path: string;
  totalStages: number;
  stageLabels: string[];
}
```

### File-by-file breakdown

#### `src/shared/logic/riddleRegistry.ts`
Exports the `RiddleMeta` interface and the `RIDDLE_REGISTRY` array which contains entries for the various riddles (e.g., The Cave, Spider Lair, Outer Wilds).

#### `src/shared/logic/gameState.ts`
Provides helper functions like `resetRiddleProgress`, `resetAllProgress`, `setRiddleProgress`, and `updateAdminSettings` to manage the underlying `localStorage` state for the dashboard controls.

#### `src/features/admin/PinGate.tsx`
A component that wraps `AdminDashboard` with PIN protection.
- It relies on `import.meta.env.DEV` and `state.adminSettings.bypassPinOnLocalhost` to bypass the prompt.
- Otherwise, it shows a numeric PIN pad. The successful PIN is `0000`.
- Wrong PIN attempts trigger a shake animation using Tailwind classes.

#### `src/features/admin/AdminDashboard.tsx`
The main dashboard component which renders a table of all riddles.
- Includes a drop-down to jump to specific stages.
- Includes buttons to reset logic.
- Included developer toggles (Dev Tools, PIN Bypass).
- Renders an "Admin Tools" section with a quick link to `/translator`.

#### `src/layouts/TaxLayout.tsx` and `src/App.tsx`
The "Privacy Policy" footer acts as a React Router `<Link to="/admin">` to reach the PIN gate.

## Verification

### Automated tests
- Unit tests (`src/shared/logic/__tests__/gameState.test.ts`) verify that state reset and jump functions work without erasing global inventory.

### Manual verification (browser)
1. Navigate to the local server or production URL.
2. Click "Privacy Policy" in the footer.
3. Verify PIN bypass functionality (if in DEV with the toggle enabled) or enter `0000` to gain access.
4. Jump between stages and check that navigation reflects the correct active riddle stage.
5. Launch the standalone Translator tool from the bottom section to verify routing.
