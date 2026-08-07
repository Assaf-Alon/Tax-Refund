# Design Document: Debug Terminal Feature Flag (`SHOW_DEBUG_TERMINAL`)

## 1. What is being changed/added

We are introducing a centralized feature flags module (`src/shared/config/featureFlags.ts`) that exports the `SHOW_DEBUG_TERMINAL` flag (set to `false` by default, but overridable via `VITE_SHOW_DEBUG_TERMINAL` environment variable).

The mobile debug terminal (`MiniDebugTerminal.tsx`) will be updated to check `SHOW_DEBUG_TERMINAL` and only render when the flag evaluates to `true`. In `ItsAHitRiddle.tsx`, rendering of `<MiniDebugTerminal />` will also be gated by `SHOW_DEBUG_TERMINAL`.

---

## 2. Why this approach was chosen (context)

### Context
The mini debug terminal was added to help diagnose mobile audio autoplay issues during development on physical touch devices. Now that the immediate mobile audio debugging work is done, the terminal overlay is no longer needed during normal app usage, but keeping the code intact behind a feature flag ensures it can easily be re-enabled whenever mobile debugging is needed in the future.

### Why Centralized Feature Flag Config?
- **Single Source of Truth**: Centralizing flags in `src/shared/config/featureFlags.ts` ensures consistent access across the codebase.
- **Environment Variable Support**: Allowing `import.meta.env.VITE_SHOW_DEBUG_TERMINAL === 'true'` enables developers to temporarily enable the debug terminal without committing code changes (e.g. `VITE_SHOW_DEBUG_TERMINAL=true npm run dev`).
- **Clean Component Guarding**: Adding a guard both at the component level (`MiniDebugTerminal.tsx`) and at usage sites (`ItsAHitRiddle.tsx`) ensures zero unexpected rendering or event listener overhead when disabled.

### Alternatives Considered & Rejected
1. **Completely deleting `MiniDebugTerminal`**: Rejected because mobile audio/touch debugging will likely be required again for future riddles or browsers, and recreating the log visualizer would be redundant work.
2. **Pure local state inside component**: Rejected because changing a hardcoded boolean inside a component file makes it harder to toggle globally or via environment variables during local testing.

---

## 3. How it will be implemented

### Step 1: Create `src/shared/config/featureFlags.ts` [NEW]
Create a dedicated feature flags configuration file:
```ts
/**
 * Feature Flags Configuration
 */
export const FEATURE_FLAGS = {
  /**
   * Controls the visibility of the mobile mini debug terminal overlay.
   * Default: false. Can be enabled via VITE_SHOW_DEBUG_TERMINAL=true in env.
   */
  SHOW_DEBUG_TERMINAL: import.meta.env.VITE_SHOW_DEBUG_TERMINAL === 'true' || false,
} as const;

export const SHOW_DEBUG_TERMINAL = FEATURE_FLAGS.SHOW_DEBUG_TERMINAL;
```

### Step 2: Update `src/shared/components/Debug/MiniDebugTerminal.tsx` [MODIFY]
Import `SHOW_DEBUG_TERMINAL` from `../../config/featureFlags`.
At the top of `MiniDebugTerminal`:
```tsx
if (!SHOW_DEBUG_TERMINAL) return null;
```

### Step 3: Update `src/features/riddles/its-a-hit/ItsAHitRiddle.tsx` [MODIFY]
Import `SHOW_DEBUG_TERMINAL` from `../../../shared/config/featureFlags`.
Wrap the component rendering:
```tsx
{SHOW_DEBUG_TERMINAL && <MiniDebugTerminal />}
```

---

## 4. Verification Plan

### Automated Tests
- Run `npm run test` or `vitest` to verify no existing tests break.
- Add unit tests for `featureFlags.ts` and `MiniDebugTerminal` visibility behavior if unit test runner is available.

### Manual Verification
1. With `SHOW_DEBUG_TERMINAL = false` (default state):
   - Launch the dev server (`npm run dev`) or run component tests.
   - Open the "It's a hit" riddle page.
   - Confirm that the "Debug Terminal" floating button / overlay is NOT rendered on the screen.
2. With `SHOW_DEBUG_TERMINAL = true` (or `VITE_SHOW_DEBUG_TERMINAL=true`):
   - Temporarily set `SHOW_DEBUG_TERMINAL` to `true` or pass environment variable.
   - Confirm that the "Debug Terminal" floating button / overlay appears and logs events properly.
