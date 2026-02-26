# Dev Tools Overlay & Environment Detection

## What
This document outlines two intertwined features designed to massively improve the local playtesting experience while implicitly preserving production integrity:
1. **Developer Environment Detection**: Refactored the "Bypass PIN on localhost" feature to securely rely on Vite's built-in `import.meta.env.DEV` construct instead of brittle IP detection. It requires the feature flag to be concurrently enabled inside the Admin Dashboard.
2. **Dev Tools Overlay**: A floating, development-only UI overlay that allows developers to instantly bypass or auto-complete their currently active stage, mitigating the tedium of repeatedly solving lengthy puzzles (e.g., the Spider Lair lyrics stage) during continuous iterative testing.

## Why
**Why the Dev Tools Overlay was chosen over altering actual riddle complexity:**
*   **Preserves Core Logic**: Modifying authentic game logic for convenient testing pollutes the core codebase with unsafe `if (isDev)` bypass checks risking production bugs.
*   **Realistic Playtesting**: If developers validate a fundamentally crippled "reduced" variation of a stage, they invariably miss bugs correlated strictly to real-world edge cases that materialize exclusively inside the full version. The overlay preserves testing integrity.
*   **Scalability**: A generalized generic "Force Complete" implementation scales to effectively bypass *any* newly established stage without mandating idiosyncratic "easy mode" code for each distinct puzzle architectural approach.

Simultaneously, hardcoded IP match verifications for bypassing Admin Dashboard security (`127.0.0.1` and `192.168.*.*`) prove relentlessly frail when manipulating routing configurations or activating HTTP tunnels. Vite's native `import.meta.env.DEV` assures an absolute, impregnable build-time safety guarantee.

## How

### 1. Developer Environment Detection
The Admin PIN protection logic inside `PinGate.tsx` replaces unreliable `window.location.hostname` parsing routines with: `const bypassEnabled = import.meta.env.DEV && state.adminSettings.bypassPinOnLocalhost;`

### 2. Dev Tools Overlay (`src/features/admin/DevSkipButton.tsx`)
A minimal, globally floating component rendering strictly on `import.meta.env.DEV`.
- The display toggle logic defaults to `false` and caches status through `gameState.adminSettings.devToolsEnabled` (controllable via the Admin Dashboard).
- The button `[ ⏭ Skip Stage ]` is deliberately affixed securely near the interactive puzzle container bounds.
- Rather than orchestrating an unwieldy, nested Context-based hierarchy, Riddles optionally incorporate the overlay component locally: `<DevSkipButton riddleId="id" currentStage={stage} totalStages={totalStages} onSkip={handleAdvance} />`.

## Verification
1. **Environment Check**: Run `npm run build` alongside `npm run preview`. Unilaterally verify the `DevSkipButton` inherently refuses execution logic and the Admin layer unconditionally mandates valid PIN entry.
2. **Dev Skip functionality**: Open Localhost. Engage the "Enable Dev Tools Overlay" configuration via Admin settings. Intervene manually inside `SpiderLair` or `OuterWilds` using the `[ ⏭ Skip Stage ]` button to advance successfully in constant time.
3. **Localhost Bypass**: Verify that actively navigating securely through a local network interface like `192.168.x.x` from alternate distinct mobile devices automatically navigates precisely past the initial PIN gate when successfully toggled on.
