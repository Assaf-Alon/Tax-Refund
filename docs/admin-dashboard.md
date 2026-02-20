# Admin Dashboard

## What

A hidden admin dashboard reachable from the home page's "Privacy Policy" footer link. It allows the game master to:

1. See all riddles, their current stage, and completion status at a glance.
2. Jump to any stage of any riddle (for dev testing and emergency fixes).
3. Reset progress on a single riddle.
4. Reset all progress across all riddles.

The dashboard is protected by a 4-digit PIN (`0000`), entered via a touchscreen-friendly numeric pad. On `localhost`, the PIN is bypassed automatically.

## Why

Two use cases drive this feature:

1. **During development** — quickly jump between stages without playing through every riddle manually.
2. **During the live game** — if a player hits a bug, the game master can take their phone, open the dashboard, and reset or skip past the broken stage.

### Alternatives considered

- **Browser DevTools / manual localStorage editing** — works but clunky, error-prone, and not feasible when borrowing a player's phone mid-game.
- **Query-parameter cheats** (e.g. `?skip=3`) — scattered across riddle files, hard to discover, no overview of state.

## How

### Core concept: Riddle Registry

Today, riddle metadata (name, stages, labels) is implicit — scattered inside each riddle component. The dashboard needs this metadata centralized.

A **riddle registry** is introduced: a single array that both the router and the dashboard consume. When a new riddle is added in the future, it registers itself here — **no dashboard changes needed**.

```ts
// src/shared/logic/riddleRegistry.ts

export interface RiddleMeta {
  id: string;            // e.g. 'the-cave'
  name: string;          // e.g. 'The Cave'
  path: string;          // e.g. '/the-cave'
  totalStages: number;   // e.g. 4 (stages 0 through 3)
  stageLabels: string[]; // e.g. ['Entrance', 'Narrow Passage', 'The Light', 'Completed']
}
```

---

### File-by-file breakdown

#### [NEW] `src/shared/logic/riddleRegistry.ts`

Exports the `RiddleMeta` interface and the `RIDDLE_REGISTRY` array.

Initial contents:

```ts
import type { ComponentType } from 'react';

export interface RiddleMeta {
  id: string;
  name: string;
  path: string;
  totalStages: number;
  stageLabels: string[];
  component: React.LazyExportDefault<ComponentType>;
}

export const RIDDLE_REGISTRY: RiddleMeta[] = [
  {
    id: 'the-cave',
    name: 'The Cave',
    path: '/the-cave',
    totalStages: 4,
    stageLabels: ['Entrance', 'Narrow Passage', 'The Light', 'Completed'],
    component: () => import('../../features/riddles/TheCave').then(m => ({ default: m.TheCave })),
  },
];
```

> **Note**: The `component` field uses a lazy import so that `App.tsx` can dynamically render routes from the registry without importing every riddle component upfront. This is optional — if we prefer simplicity we can drop it and keep the imports in `App.tsx` manually. The tradeoff is convenience (auto-routing from registry) vs. explicitness (manual imports). Recommend starting simple: **drop the `component` field for now**, keep manual imports in `App.tsx`, and only introduce lazy loading when the riddle count grows.

Final shape (simplified):

```ts
export interface RiddleMeta {
  id: string;
  name: string;
  path: string;
  totalStages: number;
  stageLabels: string[];
}

export const RIDDLE_REGISTRY: RiddleMeta[] = [
  {
    id: 'the-cave',
    name: 'The Cave',
    path: '/the-cave',
    totalStages: 4,
    stageLabels: ['Entrance', 'Narrow Passage', 'The Light', 'Completed'],
  },
];
```

---

#### [MODIFY] `src/shared/logic/gameState.ts`

Add two new exported functions to the bottom of this file. They use the `STORAGE_KEY` and `loadState`/`saveState` helpers that are already defined in the file. The existing `updateRiddleProgress` already handles setting a riddle to an arbitrary stage, so the dashboard will reuse it directly — no new setter is needed.

```ts
/** Reset a single riddle to stage 0 */
export const resetRiddleProgress = (riddleId: string): void => {
  const current = loadState();
  const { [riddleId]: _, ...rest } = current.riddleProgress;
  saveState({ ...current, riddleProgress: rest });
};

/** Reset ALL riddle progress */
export const resetAllProgress = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};

/** Jump a riddle to an arbitrary stage (admin use) */
export const setRiddleProgress = (riddleId: string, stage: number): void => {
  const current = loadState();
  saveState({
    ...current,
    riddleProgress: {
      ...current.riddleProgress,
      [riddleId]: stage,
    },
  });
};
```

> **Note**: `resetAllProgress` removes the key entirely rather than saving a default object. This works because `loadState()` already returns the default state when nothing is found in `localStorage`.

---

#### [NEW] `src/features/admin/PinGate.tsx`

Create the directory `src/features/admin/` if it doesn't exist.

A component that wraps `AdminDashboard` with PIN protection.

**Behavior:**

1. If `window.location.hostname === 'localhost'` → render `AdminDashboard` immediately (dev bypass).
2. Otherwise, show a numeric PIN pad.
3. PIN is `0000`. Stored as a constant in this file.
4. PIN entry state is kept in React `useState` — not persisted. Refreshing the page locks it again.

**Core structure:**

```tsx
import { useState } from 'react';
import { AdminDashboard } from './AdminDashboard';

const ADMIN_PIN = '0000';

export const PinGate: React.FC = () => {
  const isLocalhost = window.location.hostname === 'localhost';
  const [unlocked, setUnlocked] = useState(isLocalhost);
  const [pin, setPin] = useState('');
  const [shaking, setShaking] = useState(false);

  if (unlocked) return <AdminDashboard />;

  const handleDigit = (digit: string) => { /* append to pin, auto-submit at length 4 */ };
  const handleBackspace = () => { /* remove last character */ };

  // ... render PIN pad (see wireframe below)
};
```

**PIN pad UI:**

- Digits `0`–`9` as large, touch-friendly buttons in a 3×3+1 grid layout (like a phone dialer).
- Display area showing `●` for each entered digit (max 4).
- Automatic submission after 4 digits via `useEffect` watching `pin.length === 4`.
- If wrong: apply `animate-shake` class to the dots display, then clear after 500ms.
- Uses the boring `TaxLayout` aesthetic (gray/blue government look) to stay in character.

Key Tailwind classes: `grid grid-cols-3 gap-2` for the button grid, `w-14 h-14 text-2xl` for each button, `bg-gray-200 hover:bg-gray-300 rounded` for button styling.

```
┌─────────────────────┐
│                     │
│     ● ● ○ ○         │
│                     │
│   ┌───┬───┬───┐     │
│   │ 1 │ 2 │ 3 │     │
│   ├───┼───┼───┤     │
│   │ 4 │ 5 │ 6 │     │
│   ├───┼───┼───┤     │
│   │ 7 │ 8 │ 9 │     │
│   ├───┼───┼───┤     │
│   │ ← │ 0 │   │     │
│   └───┴───┴───┘     │
│                     │
└─────────────────────┘
```

The `←` button is backspace (delete last digit). The bottom-right cell is empty.

**Shake animation** — add to `src/index.css`:

```css
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-6px); }
  75% { transform: translateX(6px); }
}
.animate-shake { animation: shake 0.3s ease-in-out; }
```

---

#### [NEW] `src/features/admin/AdminDashboard.tsx`

The main dashboard component. Renders a table of all riddles from `RIDDLE_REGISTRY`.

**State management:**

Use a `useState` counter to force re-renders after localStorage mutations:

```tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { RIDDLE_REGISTRY } from '../../shared/logic/riddleRegistry';
import { loadState, updateRiddleProgress, resetRiddleProgress, resetAllProgress } from '../../shared/logic/gameState';

export const AdminDashboard: React.FC = () => {
  const [tick, setTick] = useState(0);
  const refresh = () => setTick(t => t + 1);
  const state = loadState();

  // Use state, tick, refresh, and RIDDLE_REGISTRY to build the table below
};
```

Call `refresh()` after every call to `updateRiddleProgress`, `resetRiddleProgress`, or `resetAllProgress`.

**Table columns:**

| Column | Content |
|--------|---------|
| Riddle | Name as a React Router `<Link>` to the riddle's route |
| Status | Emoji (see mapping below) |
| Stage | "Stage X of Y — label" (e.g. "Stage 2 of 4 — The Light") |
| Actions | **Jump to** dropdown + **Reset** button |

**Status emoji mapping** — derive from `stage = state.riddleProgress[riddle.id] ?? 0`:

| Condition | Display |
|---|---|
| `stage === 0` | 🔴 Not started |
| `stage > 0 && stage < totalStages - 1` | 🟡 In progress |
| `stage >= totalStages - 1` | 🟢 Completed |

**Jump to dropdown:**

A `<select>` element listing all stages by label (e.g. "0 — Entrance", "1 — Narrow Passage", ...). Selecting a value calls `updateRiddleProgress(riddle.id, selectedStage)` then `refresh()`.

**Reset button (per-riddle):**

Calls `window.confirm('Are you sure you want to reset "The Cave"?')`. If confirmed, calls `resetRiddleProgress(riddleId)` then `refresh()`.

**Reset All button:**

Positioned below the table. Calls `window.confirm('Are you sure you want to reset ALL riddle progress?')`. If confirmed, calls `resetAllProgress()` then `refresh()`.

**Wireframe:**

```
┌──────────────────────────────────────────────────────────────────┐
│  Admin Dashboard                                                │
├──────────┬────────┬────────────────────────┬────────────────────┤
│ Riddle   │ Status │ Stage                  │ Actions            │
├──────────┼────────┼────────────────────────┼────────────────────┤
│ The Cave │  🔴    │ Stage 0 of 4 — Entrance│ [▼ Jump to] [Reset]│
├──────────┼────────┼────────────────────────┼────────────────────┤
│ ...      │  ...   │ ...                    │ ...                │
└──────────┴────────┴────────────────────────┴────────────────────┘
                                        [ 🗑 Reset All Progress ]
```

Key Tailwind classes: `w-full border-collapse` for the table, `border border-gray-200 px-4 py-2 text-left` for cells, `bg-red-600 text-white px-3 py-1 rounded text-sm` for the Reset button, `bg-red-700` for Reset All.

---

#### [MODIFY] `src/layouts/TaxLayout.tsx`

Change the "Privacy Policy" `<span>` in the footer to a React Router `<Link>`.

Before:
```tsx
<span className="hover:underline cursor-pointer">Privacy Policy</span>
```

After:
```tsx
<Link to="/admin" className="hover:underline cursor-pointer">Privacy Policy</Link>
```

This requires updating the import at the top of the file: `import { Outlet, Link } from 'react-router-dom';`.

---

#### [MODIFY] `src/App.tsx`

Add the `/admin` route inside the existing `TaxLayout` route group (so it gets the boring government styling). It must be placed **before** the catch-all `<Route path="*">` redirect.

```tsx
import { PinGate } from './features/admin/PinGate';

// Inside the existing TaxLayout route group, add the /admin route:
<Route element={<TaxLayout />}>
  <Route path="/" element={<HomePage />} />
  <Route path="/admin" element={<PinGate />} />
</Route>
```

---

## Verification

### Automated tests

No existing tests in the project. We will add unit tests for the data layer using vitest (already installed):

**`src/shared/logic/__tests__/gameState.test.ts`** — tests for:
- `updateRiddleProgress` sets the correct stage
- `resetRiddleProgress` removes progress for a single riddle without affecting others
- `resetAllProgress` clears all progress (including `inventory`)
- `getRiddleProgress` returns 0 for unknown riddles

Run with:
```bash
npx vitest run src/shared/logic/__tests__/gameState.test.ts
```

> Note: vitest needs a `localStorage` mock. We'll use the `jsdom` environment (`// @vitest-environment jsdom`) which provides `localStorage` out of the box.

### Manual verification (browser)

The following steps should be performed by the developer in a browser:

1. **Navigate to `http://localhost:5173`** — confirm the home page loads and the footer shows "Privacy Policy".
2. **Click "Privacy Policy"** — should navigate to `/#/admin` and show the dashboard directly (localhost bypass).
3. **Dashboard table** — should show "The Cave" with status "🔴 Not started", stage "Stage 0 of 4 — Entrance".
4. **Jump to stage 2** — select "2 — The Light" in the dropdown. Status should change to "🟡 In progress", stage should show "Stage 2 of 4 — The Light".
5. **Click the riddle link** — should navigate to `/#/the-cave` and show stage 2 (The Light) directly.
6. **Go back to dashboard** — click "Privacy Policy" again. The cave should still show stage 2.
7. **Reset The Cave** — click Reset, confirm the dialog. Status should return to "🔴 Not started".
8. **Set two riddles to different stages** (once more riddles exist, or test with just the-cave). Click "Reset All", confirm. All should reset.
9. **PIN gate test** — open the site in a private/incognito window or simulate a non-localhost hostname. The PIN pad should appear. Entering `0000` should grant access. Entering a wrong PIN should show an error and clear.
