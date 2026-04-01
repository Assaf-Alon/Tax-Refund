# Pinpoint Virtual Keyboard Integration

Update the Pinpoint challenge to use the custom virtual keyboard instead of the native OS keyboard, ensuring a consistent and premium mobile experience across the LinkedIn-style games.

## User Review Required

> [!IMPORTANT]
> The Pinpoint input will change from a standard HTML `input` to a custom stylized display to prevent the native keyboard from appearing on mobile devices.

## Proposed Changes

### Shared Components & Hooks

#### [NEW] [useKeyboardInput.ts](file:///home/cowclaw/Tax-Refund/src/features/riddles/linkedin/hooks/useKeyboardInput.ts)
Extract the physical keyboard event handling logic into a reusable hook. This will handle:
-   A-Z keys -> `onKey(char)`
-   Backspace -> `onBackspace()`
-   Enter -> `onEnter()`
-   Space -> `onKey(' ')` (useful for Pinpoint)
-   Arrows -> `onMove(direction)` (optional, useful for Crossclimb)

```typescript
export const useKeyboardInput = (callbacks: {
    onKey: (key: string) => void;
    onBackspace: () => void;
    onEnter: () => void;
}) => {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Enter') callbacks.onEnter();
            else if (e.key === 'Backspace') callbacks.onBackspace();
            else if (e.key === ' ') {
                e.preventDefault();
                callbacks.onKey(' ');
            }
            else if (e.key.length === 1 && /[a-zA-Z0-9]/.test(e.key)) {
                callbacks.onKey(e.key.toUpperCase());
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [callbacks]);
};
```

#### [MODIFY] [VirtualKeyboard.tsx](file:///home/cowclaw/Tax-Refund/src/features/riddles/linkedin/components/VirtualKeyboard.tsx)
-   Ensure it's generic and doesn't have any hardcoded logic besides UI.
-   Consider adding a "Space" key for Pinpoint if the design allows it (or rely on physical keyboard for spaces).

### Game Stages

#### [MODIFY] [CrossclimbStage.tsx](file:///home/cowclaw/Tax-Refund/src/features/riddles/linkedin/stages/CrossclimbStage.tsx)
-   Refactor to use the new `useKeyboardInput` hook.
-   Simplify the component logic by offloading event listeners.

#### [MODIFY] [PinpointStage.tsx](file:///home/cowclaw/Tax-Refund/src/features/riddles/linkedin/stages/PinpointStage.tsx)
-   Replace the `input` field with a custom `div` that looks like an input and shows a cursor/caret.
-   Import and add the `VirtualKeyboard` component at the bottom of the screen.
-   Implement `handleKey`, `handleBackspace`, and `handleEnter` for the Pinpoint guess logic.
-   Fix layout to handle the fixed keyboard at the bottom, similar to Crossclimb.

## Detailed Implementation: Pinpoint UI

The Pinpoint input will be transformed into a stylized display that preserves the "Revealed Count" badge:
```tsx
<div className="relative flex items-center w-full border-b-2 border-blue-500 py-2 min-h-[3rem]">
    <div className="text-xl font-bold text-gray-900 dark:text-white uppercase tracking-tight">
        {guess}
        <span className="animate-blink w-0.5 h-6 bg-blue-500 ml-1 inline-block" />
    </div>
    <div className="absolute right-0 flex items-center pointer-events-none">
        <span className="bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest whitespace-nowrap shadow-sm">
            {revealedCount} of 5
        </span>
    </div>
</div>
```

The layout will use a flex-column structure to ensure the keyboard stays at the bottom without obscuring content:
- Parent: `flex flex-col h-[100dvh]`
- Content: `flex-1 overflow-y-auto` (contains the game header and clues)
- Bottom: `shrink-0` (contains the custom input and the `VirtualKeyboard`)

## Verification Plan

### Automated Tests
-   Verify `useKeyboardInput` correctly triggers callbacks on key events.
-   Check that `VirtualKeyboard` buttons trigger callbacks.

### Manual Verification
-   Open Pinpoint in the browser.
-   Type using the virtual keyboard.
-   Type using the physical keyboard.
-   Verify Backspace and Enter work.
-   Verify mobile view (responsive layout).
-   Confirm Crossclimb still works as expected with the refactored hook.
