# Dev Tools Overlay & Environment Detection

## What
This document outlines two interconnected features to improve the local playtesting experience while preserving production integrity:
1. **Developer Environment Detection**: Refactoring the existing "Bypass PIN on localhost" feature to rely on Vite's built-in `import.meta.env.DEV` instead of hardcoded IP checks. It will still require the feature flag to be enabled in the Admin Dashboard.
2. **Dev Tools Overlay**: A floating, development-only UI overlay that allows developers to instantly bypass or auto-complete the current stage they are on, eliminating the need to repeatedly solve puzzles (like the long lyrics stage) during testing.

## Why
Currently, testing lengthy or complex stages (e.g., the Spider Lair lyrics) is tedious. We explored two options:
1.  **Reduced Complexity Flag**: Creating a feature flag that alters the game logic itself (e.g., using a shorter string for the lyrics).
2.  **Dev Tools Overlay (Chosen Approach)**: Creating a UI overlay that forces the stage to complete.

**Why the Dev Tools Overlay was chosen over Reduced Complexity:**
*   **Preserves Core Logic**: Modifying game logic for testing purposes pollutes the codebase with `if (isDev)` checks.
*   **Realistic Playtesting**: If developers test a "reduced" version of a stage (e.g., shorter lyrics), they might miss bugs related to layout, state changes, or edge cases that only occur in the full version. The overlay allows skipping the stage entirely when focusing on the flow, while preserving the ability to test the real stage when needed.
*   **Scalability**: A generic "Force Complete" button can be reused across *any* future stage without needing custom "easy mode" logic for each new puzzle type.

The IP matching check for localhost (`127.0.0.1` and `192.168.*.*`) is brittle and prone to breaking when switching networks or using tunnels. Vite's `import.meta.env.DEV` is a robust, build-time guarantee that the code is running in a development environment.

## How

### 1. Developer Environment Detection
We will refactor the `PinGate` component to use `import.meta.env.DEV` instead of `window.location.hostname`.

#### [MODIFY] `src/features/admin/PinGate.tsx`
*   Remove the `isLocalhost` check relying on `window.location.hostname`.
*   Replace it with: `const isDev = import.meta.env.DEV;`
*   Update the bypass logic: `const bypassEnabled = isDev && state.adminSettings.bypassPinOnLocalhost;`

#### [MODIFY] `src/features/admin/AdminDashboard.tsx`
*   Update the label for the checkbox from "Bypass PIN on localhost" to "Bypass PIN in Development".

### 2. Dev Tools Overlay
We will create a new floating component that only renders in development and provides a "Force Complete" button.

#### [NEW] `src/features/admin/DevToolsOverlay.tsx`
*   **Visibility**: The component should immediately `return null;` if `!import.meta.env.DEV`.
*   **UI**: A small, floating, draggable (optional, but ideally fixed to a corner initially, e.g., bottom-left) panel. It should have a subtle, semi-transparent design to avoid interfering with the game UI too much (e.g., a dark background with white text).
*   **Functionality**:
    *   It needs to know the *current* stage and how to complete it.
    *   *Approach*: Instead of the overlay trying to guess how to complete a stage, we use a React Context or a custom hook event system. However, the simplest and most robust way in React is to provide a unified `onComplete` or a global state function.
    *   Since out stages usually take an `onComplete` prop, but the overlay sits *outside* the individual stages, we need a way for the active stage to register its "complete" action, OR the overlay just talks directly to the global `gameState`.
    *   **Simpler Approach (Global State)**: The overlay reads the current URL to determine the active riddle (`SpiderLair`, etc.). When clicked, it just increments the stage in the global `gameState` and forces a refresh.
    *   Let's refine this: We can use a custom React hook or a simple singleton to register a "dev skip" callback.

Let's use a simpler, more direct approach: **Context-based Skip Registration**.

#### [NEW] `src/shared/logic/DevToolsContext.tsx`
*   Create a React Context: `DevToolsContext`.
*   It exposes a property: `registerSkipAction: (action: () => void) => void`.
*   And `clearSkipAction: () => void`.

#### [MODIFY] `src/App.tsx` (or main layout)
*   Wrap the application in `DevToolsProvider`.
*   Render `<DevToolsOverlay />` at the top level.

#### [NEW] `src/features/admin/DevToolsOverlay.tsx` (Refined)
*   Consumes `DevToolsContext`.
*   If `skipAction` is registered, it displays a `[ ⚡ Skip Stage ]` button.
*   Clicking the button executes `skipAction()`.

#### [MODIFY] `src/features/riddles/spider-lair/SpiderLair.tsx` (Example integration)
*   Inside the main component or individual stages, when a stage mounts, it registers its completion logic with the DevToolsContext.
*   *Alternatively, and even simpler*: If all stages just call a global `advanceStage` function, the overlay doesn't even need context. It just needs to know *what* riddle is active and call `updateRiddleProgress(riddleId, currentStage + 1)`.

**Selected Approach for Dev Tools Action:** Global State Manipulation.
It is much less boilerplate to have the `DevToolsOverlay` read the current route/riddle and simply manually bump the stage via `setRiddleProgress`.

*   **`DevToolsOverlay.tsx` implementation:**
    1.  Check `import.meta.env.DEV`. If false, `return null`.
    2.  Include a toggle switch: "Dev Tools: [ON/OFF]". This toggle state should be saved in `localStorage` (via `gameState.adminSettings.devToolsEnabled`, defaulting to false).
    3.  If ON, show the overlay UI.
    4.  The overlay needs to know the current active riddle. We can get this from the URL or by passing a prop from a higher-level routing component. Since the routes usually map to riddle IDs, we might need a small mapping or just look at the `riddleProgress` state. Actually, the cleanest way is for the *Riddle Wrapper* component (e.g., `SpiderLair.tsx`) to render a local `<DevSkipButton riddleId="spider-lair" currentStage={stage} totalStages={total} />` component.

Let's pivot slightly for maximum simplicity and zero global context boilerplate:

#### [NEW] `src/features/admin/DevSkipButton.tsx`
*   A small, floating button fixed to the bottom-right corner: `[ ⏭ Skip Stage ]`.
*   Props: `riddleId` (string), `currentStage` (number), `totalStages` (number), `onSkip` (optional override function).
*   Logic:
    *   If `!import.meta.env.DEV`, `return null`.
    *   If `currentStage >= totalStages - 1`, `return null` (nothing to skip).
    *   When clicked, if `onSkip` is provided, call it. Otherwise, default to updating global state: `setRiddleProgress(riddleId, currentStage + 1)` and force a page reload or state refresh.

#### [MODIFY] `src/features/riddles/spider-lair/SpiderLair.tsx` (and other riddles)
*   Import and render `<DevSkipButton riddleId="spider-lair" currentStage={stage} totalStages={config.stages.length} />` at the root of the riddle component.

#### [MODIFY] `src/shared/logic/gameState.ts`
*   Add `devToolsEnabled: boolean;` to `adminSettings`.
*   Update `AdminDashboard` to include a toggle for this new setting.

### Summary of Changes
1.  **`gameState.ts`**: Add `devToolsEnabled` to `adminSettings`.
2.  **`AdminDashboard.tsx`**: Add toggle for `devToolsEnabled`. Change wording of PIN bypass to "in Development".
3.  **`PinGate.tsx`**: Change hostname check to `import.meta.env.DEV`.
4.  **`DevSkipButton.tsx`**: Create the new floating skip button.
5.  **`SpiderLair.tsx`**: Integrate `<DevSkipButton>`.

## Verification
1.  **Environment Check**: Run `npm run build` and `npm run preview`. Verify that the `DevSkipButton` does **not** render and the Admin PIN bypass does **not** work, regardless of the feature flags in the Admin Dashboard.
2.  **Dev Skip functionality**: Run `npm run dev`. Enable the Dev Tools flag in the Admin Dashboard. Navigate to the Spider Lair. Click the `[ ⏭ Skip Stage ]` button and verify it instantly advances you to the next stage without needing to solve the puzzle. Validate it disappears on the final stage.
3.  **Localhost Bypass**: Verify that accessing the dev server via `192.168.x.x` from a mobile phone successfully bypasses the PIN gate when the "Bypass PIN in Development" flag is enabled.
