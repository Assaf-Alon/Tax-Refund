# Riddle Mechanics Refactoring

## 1. What
We are extracting specific puzzle mechanics from the monolithic Expedition 33 components into generic, reusable hooks and visual primitives in the `src/shared/` directory. Specifically:
- **Press & Hold Interaction**: Extracted from `FinalChoiceStage` into a reusable hook.
- **Multiple Choice Mechanism**: Extracted from `SimonOstStage` into a generalized template component.
- **Timing Action Ring ("Parry")**: Extracted from `ReactiveParryStage` into a generic timing stage.
- **Drag & Drop Engine**: Extracted from `TeamBuilderStage` into a set of headless hooks and primitive UI wrappers.

## 2. Why & Context
The current Expedition 33 stage components are massive (e.g., `TeamBuilderStage` is ~450 lines) and tightly couple the visual presentation, complex native browser APIs (like mobile touch tracking, `navigator.vibrate`, and `requestAnimationFrame`), and the specific logic/easter-eggs of the puzzle. 

By extracting these underlying mechanics, we can easily compose future riddles without rewriting the boilerplate heavy logic for cross-device touch interactions and animation frames.

**Alternatives Considered:** 
*Extracting `TeamBuilderStage` into a pure generic `<DragAndDropStage>` component.*
**Rejected:** The specific flow of the Simon "Gommage" easter egg (intercepting the drop and playing an animation instead of updating state) means a generic Stage component would require highly complex render props and interceptor functions. The composition approach (extracting just the D&D math and state into a hook) provides maximum flexibility without component bloat.

## 3. How (Implementation Details)

### 3.1. Press & Hold (`useLongPress.ts`)
Create `src/shared/hooks/useLongPress.ts`.
This hook will abstract pointer events and `requestAnimationFrame` timing.
**API Overview:**
```typescript
interface UseLongPressOptions {
    durationMs: number;
    onComplete: () => void;
    onProgress?: (progress: number) => void;
    vibrate?: boolean; // Should handle the 500ms pulsed vibration during hold
}

interface UseLongPressReturn {
    handlers: {
        onPointerDown: (e: React.PointerEvent) => void;
        onPointerUp: () => void;
        onPointerLeave: () => void;
        onPointerCancel: () => void;
        onContextMenu: (e: React.MouseEvent) => void;
    };
    isActive: boolean;
}
```
**Changes:** `FinalChoiceStage.tsx` will be refactored to use this hook instead of managing `holdStartRef` and manual pointer events.

### 3.2. Multiple Choice (`MultipleChoiceStage.tsx`)
Create `src/shared/components/stages/MultipleChoiceStage.tsx`.
This generic component will take a list of options and automatically handle the shuffling, the shaking error animation on wrong answers, the green glow on correct answers, and the timer before advancing.
**API Overview:**
```typescript
interface Choice {
    label: string;
    correct: boolean;
}

interface MultipleChoiceStageProps {
    title: string;
    description: string;
    mediaRow?: React.ReactNode; 
    choices: Choice[];
    onAdvance: () => void;
    successMessageRenderer?: (correctLabel: string) => React.ReactNode;
}
```
**Changes:** `SimonOstStage.tsx` will be stripped of its manual sorting, timeout logic, and UI code, replaced with a simple render of this component.

### 3.3. Timing Action Ring (`ActionRingStage.tsx`)
Create `src/shared/components/stages/ActionRingStage.tsx`.
Will abstract the shrinking ring animation logic from `ReactiveParryStage`.
**API Overview:**
```typescript
interface ActionRingStageProps {
    title: string;
    description: string;
    actionLabel: string; // e.g., "Parry"
    durationMs?: number;
    targetWindow?: [number, number]; // e.g., [0.9, 1.1]
    onAdvance: () => void;
    extraButtons?: React.ReactNode; // For things like the joke "Dodge" button
    
    // For advanced overrides like the Dodge easter egg:
    isPaused?: boolean; // Temporarily pauses the shrinking animation
    actionAreaOverride?: React.ReactNode; // Replaces the PARRY button with custom message
}
```

### 3.4. Drag & Drop Engine (`useDragAndDrop.ts`)
Create `src/shared/hooks/useDragAndDrop.ts`.
This hook will handle HTML5 D&D for desktop, and the touch-move polyfill for mobile.
It will track the `dragClone` position natively and expose standard handlers.
**API Overview:**
```typescript
interface UseDragAndDropOptions {
    onDrop: (itemId: string, dropZoneIndex: number) => void;
}

interface DragState {
    characterId: string;
    x: number;
    y: number;
}

interface UseDragAndDropReturn {
    dragState: DragState | null; // For rendering the native mobile clone
    dragHandlers: {
        onDragStart: (e: React.DragEvent, id: string) => void;
        onTouchStart: (e: React.TouchEvent, id: string) => void;
        onTouchMove: (e: React.TouchEvent) => void;
        onTouchEnd: (e: React.TouchEvent) => void;
    };
    dropHandlers: {
        onDragOver: (e: React.DragEvent) => void;
        onDrop: (e: React.DragEvent, dropZoneIndex: number) => void;
    };
    // Expose refs assignment to track slot positions on mobile
    slotRefs: React.MutableRefObject<(HTMLElement | null)[]>;
}
```
**Changes:** `TeamBuilderStage.tsx` will be heavily thinned out, relying on this hook for coordinate tracking and drop registration but retaining the specific slot logic and Simon easter egg check.

## 4. Verification
1. Launch the local dev server and open the riddle orchestrator in the browser.
2. Play through Expedition 33 using a desktop mouse.
3. Toggle mobile touch emulation via browser DevTools and replay.
4. Verify that:
   - **Reactive Parry** ring shrinks at the correct speed and accepts clicks at the same correct scale window.
   - **Team Builder** allows dragging and dropping items (mouse/touch), and the Simon easter egg triggers when dropped on a slot.
   - **Simon OST** correctly shuffles options, blocks spam clicks, shakes on errors, and displays specific success messages.
   - **Final Choice** smoothly tracks long presses, fades the other option out with particles, and triggers correctly when complete.
